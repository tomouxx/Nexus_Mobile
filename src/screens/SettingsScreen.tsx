import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/colors';
import { getServerUrl, setServerUrl, checkLLMStatus } from '../services/api';

interface Props {
  navigation: any;
  onLogout: () => void;
}

export default function SettingsScreen({ navigation, onLogout }: Props) {
  const [url, setUrl] = useState(getServerUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'error'>('none');

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Paramètres',
      headerStyle: { backgroundColor: Colors.surface, elevation: 2, shadowOpacity: 0.08 },
      headerTintColor: Colors.onSurface,
    });
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult('none');
    setServerUrl(url);
    const result = await checkLLMStatus();
    setTestResult(result.online ? 'success' : 'error');
    setTesting(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Server Config */}
        <Text style={styles.sectionTitle}>Serveur LLM</Text>
        <View style={styles.card}>
          <Text style={styles.label}>URL du serveur</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="http://10.0.2.2:8000"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <TouchableOpacity
            style={[styles.testButton, testing && styles.testingButton]}
            onPress={testConnection}
            disabled={testing}
          >
            <MaterialIcons
              name={testing ? 'hourglass-empty' : 'wifi-tethering'}
              size={18}
              color={Colors.onPrimary}
            />
            <Text style={styles.testButtonText}>
              {testing ? 'Test en cours...' : 'Tester la connexion'}
            </Text>
          </TouchableOpacity>
          {testResult !== 'none' && (
            <View style={[styles.resultBanner, testResult === 'success' ? styles.successBanner : styles.errorBanner]}>
              <MaterialIcons
                name={testResult === 'success' ? 'check-circle' : 'error'}
                size={18}
                color={testResult === 'success' ? Colors.success : Colors.error}
              />
              <Text style={styles.resultText}>
                {testResult === 'success' ? 'Connexion réussie !' : 'Connexion échouée'}
              </Text>
            </View>
          )}
        </View>

        {/* App Info */}
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plateforme</Text>
            <Text style={styles.infoValue}>Nexus by SQLI</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chiffrement</Text>
            <Text style={styles.infoValue}>AES-256</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Conformité</Text>
            <Text style={styles.infoValue}>RGPD</Text>
          </View>
        </View>

        {/* Compliance */}
        <Text style={styles.sectionTitle}>Sécurité</Text>
        <View style={styles.card}>
          <View style={styles.complianceRow}>
            <MaterialIcons name="verified-user" size={20} color={Colors.success} />
            <View style={styles.complianceInfo}>
              <Text style={styles.complianceTitle}>Données on-premise</Text>
              <Text style={styles.complianceDesc}>Vos données ne quittent jamais votre infrastructure</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.complianceRow}>
            <MaterialIcons name="lock" size={20} color={Colors.info} />
            <View style={styles.complianceInfo}>
              <Text style={styles.complianceTitle}>Chiffrement de bout en bout</Text>
              <Text style={styles.complianceDesc}>Communications chiffrées AES-256</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.complianceRow}>
            <MaterialIcons name="shield" size={20} color={Colors.rh} />
            <View style={styles.complianceInfo}>
              <Text style={styles.complianceTitle}>Conforme RGPD</Text>
              <Text style={styles.complianceDesc}>Respect du règlement européen sur les données</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Nexus by SQLI — v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainer },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.onSurface, marginBottom: Spacing.sm, marginTop: Spacing.md },

  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.onSurface, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surfaceContainer, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSize.sm, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.outline,
  },
  testButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm, marginTop: Spacing.sm, gap: Spacing.sm,
  },
  testingButton: { opacity: 0.7 },
  testButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.onPrimary },

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm, borderRadius: BorderRadius.sm, marginTop: Spacing.sm,
  },
  successBanner: { backgroundColor: '#ECFDF5' },
  errorBanner: { backgroundColor: '#FEF2F2' },
  resultText: { fontSize: FontSize.sm, color: Colors.onSurface },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.onSurface },
  separator: { height: 1, backgroundColor: Colors.outline },

  complianceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  complianceInfo: { flex: 1 },
  complianceTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.onSurface },
  complianceDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, marginTop: Spacing.xl,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.error + '30',
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.error },

  footer: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.lg },
});
