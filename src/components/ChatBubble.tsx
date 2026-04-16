import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/colors';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  accentColor?: string;
  isStreaming?: boolean;
}

export default function ChatBubble({ role, content, accentColor = Colors.primary, isStreaming }: Props) {
  const isUser = role === 'user';

  const renderInline = (text: string, white: boolean): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <Text key={i} style={[styles.bold, white && styles.textWhite]}>{p.slice(2, -2)}</Text>;
      }
      const codeParts = p.split(/(`[^`]+`)/);
      return codeParts.map((cp, ci) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <Text key={`${i}-${ci}`} style={styles.inlineCode}>{cp.slice(1, -1)}</Text>;
        }
        return cp;
      });
    });
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^\w+\n/, '');
        return (
          <View key={i} style={styles.codeBlock}>
            <Text style={styles.codeText}>{code.trim()}</Text>
          </View>
        );
      }

      const lines = part.split('\n');
      return lines.map((line, j) => {
        if (line.startsWith('### ')) return <Text key={`${i}-${j}`} style={[styles.h3, isUser && styles.textWhite]}>{line.slice(4)}</Text>;
        if (line.startsWith('## ')) return <Text key={`${i}-${j}`} style={[styles.h2, isUser && styles.textWhite]}>{line.slice(3)}</Text>;
        if (line.startsWith('# ')) return <Text key={`${i}-${j}`} style={[styles.h1, isUser && styles.textWhite]}>{line.slice(2)}</Text>;

        if (line.match(/^[-*•]\s/)) {
          return (
            <View key={`${i}-${j}`} style={styles.bulletRow}>
              <Text style={[styles.bullet, isUser && styles.textWhite]}>•</Text>
              <Text style={[styles.messageText, isUser && styles.textWhite, { flex: 1 }]}>{renderInline(line.slice(2), isUser)}</Text>
            </View>
          );
        }

        if (line.match(/^\d+\.\s/)) {
          const num = line.match(/^(\d+)\./)?.[1] || '';
          const rest = line.replace(/^\d+\.\s/, '');
          return (
            <View key={`${i}-${j}`} style={styles.bulletRow}>
              <Text style={[styles.bullet, isUser && styles.textWhite]}>{num}.</Text>
              <Text style={[styles.messageText, isUser && styles.textWhite, { flex: 1 }]}>{renderInline(rest, isUser)}</Text>
            </View>
          );
        }

        if (line.trim() === '') return <View key={`${i}-${j}`} style={styles.paragraphBreak} />;
        return <Text key={`${i}-${j}`} style={[styles.messageText, isUser && styles.textWhite]}>{renderInline(line, isUser)}</Text>;
      });
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: accentColor + '20' }]}>
          <MaterialIcons name="smart-toy" size={18} color={accentColor} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {renderContent(content)}
        {isStreaming && (
          <View style={styles.typingDots}>
            <View style={[styles.dot, { opacity: 0.4 }]} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.8 }]} />
          </View>
        )}
      </View>
      {isUser && (
        <View style={[styles.avatar, styles.userAvatar]}>
          <MaterialIcons name="person" size={18} color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: Spacing.xs, paddingHorizontal: Spacing.md, alignItems: 'flex-end', gap: Spacing.sm },
  userContainer: { justifyContent: 'flex-end' },
  assistantContainer: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  userAvatar: { backgroundColor: Colors.primary + '15' },
  bubble: { maxWidth: '75%', padding: Spacing.md, borderRadius: BorderRadius.lg },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: Spacing.xs },
  assistantBubble: { backgroundColor: Colors.surface, borderBottomLeftRadius: Spacing.xs, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  messageText: { fontSize: FontSize.sm, color: Colors.onSurface, lineHeight: 21 },
  textWhite: { color: Colors.onPrimary },
  bold: { fontWeight: '700' },
  h1: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.onSurface, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  h2: { fontSize: FontSize.md, fontWeight: '700', color: Colors.onSurface, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  h3: { fontSize: FontSize.md, fontWeight: '600', color: Colors.onSurface, marginTop: Spacing.xs, marginBottom: Spacing.xs },
  bulletRow: { flexDirection: 'row', paddingLeft: Spacing.sm, gap: Spacing.sm },
  bullet: { fontSize: FontSize.sm, color: Colors.onSurface, lineHeight: 21 },
  paragraphBreak: { height: Spacing.sm },
  codeBlock: { backgroundColor: '#1a1a2e', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginVertical: Spacing.xs },
  codeText: { fontSize: FontSize.xs, color: '#e0e0e0', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  inlineCode: { backgroundColor: 'rgba(0,0,0,0.08)', fontSize: FontSize.xs, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', paddingHorizontal: 4, borderRadius: 4 },
  typingDots: { flexDirection: 'row', gap: 4, marginTop: Spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textSecondary },
});
