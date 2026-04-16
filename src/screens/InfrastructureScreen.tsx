import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/colors';
import { checkLLMStatus, ModelInfo } from '../services/api';

const { width } = Dimensions.get('window');
const BAR_COUNT = 10;

export default function InfrastructureScreen({ navigation }: any) {
  const [llmOnline, setLlmOnline] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [gpuLoad, setGpuLoad] = useState(72);
  const [vramUsage, setVramUsage] = useState(45);
  const [latency, setLatency] = useState(120);
  const barAnims = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Infrastructure',
      headerStyle: { backgroundColor: Colors.surface, elevation: 2, shadowOpacity: 0.08 },
      headerTintColor: Colors.onSurface,
    });
    loadData();
    animateBars();
    const interval = setInterval(animateBars, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    addLog('Connexion au cluster GPU...');
    const result = await checkLLMStatus();
    setLlmOnline(result.online);
    setModels(result.models);

    if (result.online) {
      addLog(`Serveur LLM en ligne — ${result.models.length} modèle(s) détecté(s)`);
      setGpuLoad(Math.floor(50 + Math.random() * 30));
      setVramUsage(Math.floor(30 + Math.random() * 40));
      setLatency(Math.floor(80 + Math.random() * 100));
    } else {
      addLog('ERREUR: Serveur LLM hors ligne');
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('fr-FR');
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 20));
  };

  const animateBars = () => {
    barAnims.forEach((anim) => {
      Animated.timing(anim, {
        toValue: 0.2 + Math.random() * 0.8,
        duration: 800 + Math.random() * 400,
        useNativeDriver: false,
      }).start();
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    addLog('Actualisation des métriques...');
    await loadData();
    setRefreshing(false);
  };

  const MetricCard = ({ icon, label, value, unit, color }: any) => (
    <View style={styles.metricCard}>
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={styles.metricValue}>{value}<Text style={styles.metricUnit}>{unit}</Text></Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, llmOnline ? styles.bannerOnline : styles.bannerOffline]}>
          <MaterialIcons name={llmOnline ? 'check-circle' : 'error'} size={20} color={llmOnline ? Colors.success : Colors.error} />
          <Text style={styles.statusText}>
            {llmOnline ? 'Cluster GPU opérationnel' : 'Cluster hors ligne'}
          </Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <MaterialIcons name="refresh" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* GPU Metrics */}
        <Text style={styles.sectionTitle}>Performance GPU</Text>
        <View style={styles.metricsRow}>
          <MetricCard icon="memory" label="Charge GPU" value={gpuLoad} unit="%" color="#F59E0B" />
          <MetricCard icon="storage" label="VRAM" value={vramUsage} unit="%" color="#3B82F6" />
          <MetricCard icon="speed" label="Latence" value={latency} unit="ms" color="#10B981" />
        </View>

        {/* Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Activité en temps réel</Text>
          <View style={styles.barsContainer}>
            {barAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 100],
                    }),
                    backgroundColor: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['#3B82F6', '#8B5CF6', '#F59E0B'],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Models */}
        <Text style={styles.sectionTitle}>Modèles LLM disponibles</Text>
        {models.length > 0 ? (
          models.map((model, i) => (
            <View key={i} style={styles.modelCard}>
              <View style={styles.modelHeader}>
                <MaterialIcons name="smart-toy" size={20} color={Colors.primary} />
                <View style={styles.modelInfo}>
                  <Text style={styles.modelName}>{model.id}</Text>
                  <Text style={styles.modelOwner}>{model.owned_by}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={[styles.activeDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.activeText}>ACTIF</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyModels}>
            <MaterialIcons name="cloud-off" size={32} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Aucun modèle disponible</Text>
          </View>
        )}

        {/* Logs */}
        <Text style={styles.sectionTitle}>Journal système</Text>
        <View style={styles.logsCard}>
          {logs.map((log, i) => (
            <Text key={i} style={[styles.logLine, log.includes('ERREUR') && styles.logError]}>
              {log}
            </Text>
          ))}
          {logs.length === 0 && <Text style={styles.logLine}>Aucun événement</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainer },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  bannerOnline: { backgroundColor: '#ECFDF5' },
  bannerOffline: { backgroundColor: '#FEF2F2' },
  statusText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.onSurface },
  refreshBtn: { padding: Spacing.xs },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.onSurface, marginBottom: Spacing.sm, marginTop: Spacing.md },

  metricsRow: { flexDirection: 'row', gap: Spacing.sm },
  metricCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center', gap: Spacing.xs,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  metricValue: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.onSurface },
  metricUnit: { fontSize: FontSize.sm, fontWeight: '400', color: Colors.textSecondary },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },

  chartCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginTop: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  chartTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.onSurface, marginBottom: Spacing.sm },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6, justifyContent: 'space-between' },
  bar: { flex: 1, borderRadius: 4, minHeight: 10 },

  modelCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  modelHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modelInfo: { flex: 1 },
  modelName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.onSurface },
  modelOwner: { fontSize: FontSize.xs, color: Colors.textSecondary },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.success },

  emptyModels: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  logsCard: {
    backgroundColor: '#1a1a2e', borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  logLine: { fontSize: FontSize.xs, color: '#a0a0c0', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 20 },
  logError: { color: '#EF4444' },
});
