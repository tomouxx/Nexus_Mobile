// Document Reader Service for Mobile
// Reads uploaded documents and extracts text content

import * as FileSystem from 'expo-file-system';

const MAX_CHARS = 30000;

export interface DocumentResult {
  name: string;
  text: string;
  type: string;
  charCount: number;
  truncated: boolean;
}

export async function readDocument(uri: string, name: string, mimeType?: string): Promise<DocumentResult> {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const type = mimeType || guessType(ext);

  try {
    let text = '';

    if (['txt', 'csv', 'json', 'xml', 'md', 'html', 'htm', 'rtf', 'log', 'yaml', 'yml', 'tsv'].includes(ext)) {
      // Plain text formats - read directly
      text = await FileSystem.readAsStringAsync(uri);
    } else if (ext === 'pdf') {
      // PDF - we'll send a note that content needs server-side extraction
      // or read raw bytes and try basic extraction
      text = `[Document PDF: ${name}]\n\nNote: L'extraction de texte PDF est limitée sur mobile. Pour une analyse complète, veuillez copier-coller le contenu textuel du document.`;
    } else if (ext === 'docx') {
      // DOCX - basic extraction attempt
      text = `[Document Word: ${name}]\n\nNote: L'extraction de texte DOCX est limitée sur mobile. Pour une analyse complète, veuillez copier-coller le contenu textuel du document.`;
    } else {
      text = `[Document: ${name}]\n\nFormat non supporté pour l'extraction automatique. Veuillez copier-coller le contenu.`;
    }

    const truncated = text.length > MAX_CHARS;
    if (truncated) {
      text = text.slice(0, MAX_CHARS) + '\n\n[... contenu tronqué à 30 000 caractères]';
    }

    return {
      name,
      text,
      type,
      charCount: text.length,
      truncated,
    };
  } catch (error: any) {
    return {
      name,
      text: `Erreur de lecture: ${error.message}`,
      type,
      charCount: 0,
      truncated: false,
    };
  }
}

function guessType(ext: string): string {
  const types: Record<string, string> = {
    txt: 'text/plain',
    csv: 'text/csv',
    tsv: 'text/tsv',
    json: 'application/json',
    xml: 'application/xml',
    md: 'text/markdown',
    html: 'text/html',
    htm: 'text/html',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rtf: 'application/rtf',
  };
  return types[ext] || 'application/octet-stream';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
