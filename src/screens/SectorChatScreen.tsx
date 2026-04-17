import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/colors';
import { streamChatCompletion, ChatMessage, checkLLMStatus } from '../services/api';
import { SystemPrompts, SectorInfo } from '../services/systemPrompts';
import { readDocument, DocumentResult, formatFileSize } from '../services/documentReader';
import ChatBubble from '../components/ChatBubble';

const { width } = Dimensions.get('window');

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SectorChatScreen({ route, navigation }: any) {
  const { sectorKey } = route.params;
  const sector = SectorInfo[sectorKey];
  const systemPrompt = SystemPrompts[sectorKey];

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<DocumentResult[]>([]);
  const [llmOnline, setLlmOnline] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <View style={[styles.headerIcon, { backgroundColor: sector.color + '20' }]}>
            <MaterialIcons name={sector.icon as any} size={18} color={sector.color} />
          </View>
          <View>
            <Text style={styles.headerTitleText}>{sector.name}</Text>
            <View style={styles.headerStatus}>
              <View style={[styles.statusDot, llmOnline ? styles.online : styles.offline]} />
              <Text style={styles.headerSubtitle}>{llmOnline ? 'LLM Actif' : 'Hors ligne'}</Text>
            </View>
          </View>
        </View>
      ),
      headerStyle: { backgroundColor: Colors.surface, elevation: 2, shadowOpacity: 0.08 },
      headerTintColor: Colors.onSurface,
      headerRight: () => (
        <TouchableOpacity onPress={handleReset} style={{ marginRight: Spacing.md }}>
          <MaterialIcons name="refresh" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      ),
    });

    checkLLMStatus().then(r => setLlmOnline(r.online));
  }, [llmOnline]);

  const handleReset = () => {
    setMessages([]);
    setChatHistory([]);
    setAttachedFiles([]);
    setInputText('');
    setStreamingText('');
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', 'application/json', 'application/xml',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const doc = await readDocument(asset.uri, asset.name, asset.mimeType || undefined);
          setAttachedFiles(prev => [...prev, doc]);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le document');
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = overrideText || inputText.trim();
    if (!text && attachedFiles.length === 0) return;
    if (isLoading) return;

    // Build user message with file content
    let userContent = text;
    if (attachedFiles.length > 0) {
      const fileTexts = attachedFiles.map(f => `--- Document: ${f.name} ---\n${f.text}`).join('\n\n');
      userContent = fileTexts + (text ? `\n\n${text}` : '');
    }

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text || `[${attachedFiles.length} document(s) attaché(s)]`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStreamingText('');

    // Build API messages
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userContent },
    ];

    let fullResponse = '';

    try {
      await streamChatCompletion(apiMessages, {
        onToken: (token) => {
          fullResponse += token;
          setStreamingText(fullResponse);
        },
        onDone: () => {
          const assistantMsg: DisplayMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setChatHistory(prev => [
            ...prev,
            { role: 'user', content: userContent },
            { role: 'assistant', content: fullResponse },
          ]);
          setStreamingText('');
          setIsLoading(false);
        },
        onError: (error) => {
          Alert.alert('Erreur', error);
          setStreamingText('');
          setIsLoading(false);
        },
      });
    } catch {
      setIsLoading(false);
      setStreamingText('');
    }
  }, [inputText, attachedFiles, isLoading, chatHistory, systemPrompt]);

  const cardWidth = (width - Spacing.xl * 2 - Spacing.sm) / 2;

  const SuggestionCard = ({ item }: { item: typeof sector.suggestions[0] }) => (
    <TouchableOpacity
      style={[styles.suggestionCard, { borderColor: sector.color + '30', width: cardWidth }]}
      activeOpacity={0.7}
      onPress={() => sendMessage(item.prompt)}
    >
      <Text style={[styles.suggestionTitle, { color: sector.color }]}>{item.title}</Text>
      <Text style={styles.suggestionDesc} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: DisplayMessage }) => (
    <ChatBubble
      role={item.role}
      content={item.content}
      accentColor={sector.color}
    />
  );

  const showWelcome = messages.length === 0 && !streamingText;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {showWelcome ? (
          <View style={styles.welcomeContainer}>
            <View style={[styles.welcomeIcon, { backgroundColor: sector.color + '15' }]}>
              <MaterialIcons name={sector.icon as any} size={40} color={sector.color} />
            </View>
            <Text style={styles.welcomeTitle}>{sector.name}</Text>
            <Text style={styles.welcomeDesc}>{sector.description}</Text>

            <Text style={styles.suggestionsLabel}>Suggestions</Text>
            <View style={styles.suggestionsGrid}>
              <View style={styles.suggestionRow}>
                {sector.suggestions.slice(0, 2).map((item) => (
                  <SuggestionCard key={item.title} item={item} />
                ))}
              </View>
              <View style={styles.suggestionRow}>
                {sector.suggestions.slice(2, 4).map((item) => (
                  <SuggestionCard key={item.title} item={item} />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[
              ...messages,
              ...(streamingText ? [{ id: 'streaming', role: 'assistant' as const, content: streamingText, timestamp: new Date() }] : []),
            ]}
            renderItem={({ item }) => (
              <ChatBubble
                role={item.role}
                content={item.content}
                accentColor={sector.color}
                isStreaming={item.id === 'streaming'}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Attached files bar */}
        {attachedFiles.length > 0 && (
          <View style={styles.filesBar}>
            {attachedFiles.map((file, index) => (
              <View key={index} style={styles.fileBadge}>
                <MaterialIcons name="insert-drive-file" size={14} color={sector.color} />
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <TouchableOpacity onPress={() => removeFile(index)}>
                  <MaterialIcons name="close" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
            <MaterialIcons name="attach-file" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor={Colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={5000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: sector.color }, (!inputText.trim() && attachedFiles.length === 0) && styles.sendDisabled]}
            onPress={() => sendMessage()}
            disabled={(!inputText.trim() && attachedFiles.length === 0) || isLoading}
          >
            <MaterialIcons name={isLoading ? 'hourglass-empty' : 'send'} size={20} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainer },
  flex: { flex: 1 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  headerTitleText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.onSurface },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  online: { backgroundColor: Colors.success },
  offline: { backgroundColor: Colors.error },

  // Welcome
  welcomeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  welcomeIcon: { width: 72, height: 72, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  welcomeTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.onSurface, marginBottom: Spacing.xs },
  welcomeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  suggestionsLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md, alignSelf: 'flex-start' },
  suggestionsGrid: { width: '100%' },
  suggestionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  suggestionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    minHeight: 80,
  },
  suggestionTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  suggestionDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },

  // Chat
  chatList: { paddingVertical: Spacing.md },

  // Files
  filesBar: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.sm, paddingHorizontal: Spacing.md, gap: Spacing.xs, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.outline },
  fileBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceContainer, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, maxWidth: 200 },
  fileName: { fontSize: FontSize.xs, color: Colors.onSurface, flex: 1 },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.outline,
    gap: Spacing.sm,
  },
  attachButton: { padding: Spacing.sm, justifyContent: 'center' },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.onSurface,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
