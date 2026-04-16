// Nexus API Service - LLM Communication
// Handles streaming chat completions and model listing

import { Platform } from 'react-native';

// Default server URL - change this to your server address
// On Android emulator, 10.0.2.2 maps to host machine's localhost
const DEFAULT_SERVER = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

let serverUrl = DEFAULT_SERVER;

export function setServerUrl(url: string) {
  serverUrl = url.replace(/\/+$/, '');
}

export function getServerUrl(): string {
  return serverUrl;
}

// ─── Types ───────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelInfo {
  id: string;
  owned_by: string;
  object: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

// ─── Check LLM Status ───────────────────────────────────────────
export async function checkLLMStatus(): Promise<{ online: boolean; models: ModelInfo[] }> {
  try {
    const response = await fetch(`${serverUrl}/v1/models`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Server error');
    const data = await response.json();
    return { online: true, models: data.data || [] };
  } catch {
    return { online: false, models: [] };
  }
}

// ─── Streaming Chat Completion ───────────────────────────────────
export async function streamChatCompletion(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  model: string = 'minimax-m2.7',
  temperature: number = 0.7,
  maxTokens: number = 2048,
): Promise<void> {
  const controller = new AbortController();

  try {
    const response = await fetch(`${serverUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            callbacks.onToken(content);
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }
    callbacks.onDone();
  } catch (error: any) {
    if (error.name === 'AbortError') return;
    callbacks.onError(error.message || 'Connection error');
  }
}

// ─── Non-streaming Chat (fallback) ──────────────────────────────
export async function chatCompletion(
  messages: ChatMessage[],
  model: string = 'minimax-m2.7',
): Promise<string> {
  try {
    const response = await fetch(`${serverUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response';
  } catch (error: any) {
    throw new Error(error.message || 'Connection error');
  }
}
