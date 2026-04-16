import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/colors';
import { checkLLMStatus } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

interface Props {
  navigation: any;
}

const sectors = [
  { key: 'sante', name: 'Santé', icon: 'local-hospital', color: Colors.sante, screen: 'SectorChat', stat: '2.4h/jour gagnées' },
  { key: 'juridique', name: 'Juridique', icon: 'gavel', color: Colors.juridique, screen: 'SectorChat', stat: 'Analyse contrats' },
  { key: 'operations', name: 'Opérations', icon: 'precision-manufacturing', color: Colors.operations, screen: 'SectorChat', stat: '-50% reporting' },
  { key: 'rh', name: 'RH', icon: 'groups', color: Colors.rh, screen: 'SectorChat', stat: '+45% productivité' },
  { key: 'ao', name: 'Appels d\'Offres', icon: 'description', color: Colors.ao, screen: 'SectorChat', stat: '×2 taux succès' },
  { key: 'infrastructure', name: 'Infrastructure', icon: 'dns', color: Colors.info, screen: 'Infrastructure', stat: 'GPU Monitoring' },
];

export default function HomeScreen({ navigation }: Props) {
  const [llmOnline, setLlmOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnims = useRef(sectors.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(sectors.map(() => new Animated.Value(30))).current;

  useEffect(() => {
    // Staggered card animations
    sectors.forEach((_, i) => {
      Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 400,
          delay: i * 100,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnims[i], {
          toValue: 0,
          tension: 50,
          friction: 7,
          delay: i * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    checkStatus();
  }, []);

  const checkStatus = async () => {
    const result = await checkLLMStatus();
    setLlmOnline(result.online);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkStatus();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Nexus</Text>
            <Text style={styles.headerSubtitle}>by SQLI</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusDot, llmOnline ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>{llmOnline ? 'LLM Actif' : 'Hors ligne'}</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialIcons name="settings" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            L'IA Souveraine{'\n'}au Service de Votre Métier
          </Text>
          <Text style={styles.heroSubtitle}>
            Plateforme d'intelligence artificielle on-premise, sécurisée et conforme RGPD
          </Text>
        </View>
      </View>

      {/* Sector Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.sectionTitle}>Secteurs d'expertise</Text>

        <View style={styles.cardGrid}>
          {sectors.map((sector, index) => (
            <Animated.View
              key={sector.key}
              style={[
                styles.cardWrapper,
                {
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                  if (sector.screen === 'Infrastructure') {
                    navigation.navigate('Infrastructure');
                  } else {
                    navigation.navigate('SectorChat', { sectorKey: sector.key });
                  }
                }}
              >
                <View style={[styles.cardIconBg, { backgroundColor: sector.color + '15' }]}>
                  <MaterialIcons name={sector.icon as any} size={28} color={sector.color} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{sector.name}</Text>
                <Text style={styles.cardStat}>{sector.stat}</Text>
                <View style={[styles.cardAccent, { backgroundColor: sector.color }]} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Compliance badges */}
        <View style={styles.badges}>
          <View style={styles.badge}>
            <MaterialIcons name="verified-user" size={16} color={Colors.success} />
            <Text style={styles.badgeText}>RGPD</Text>
          </View>
          <View style={styles.badge}>
            <MaterialIcons name="lock" size={16} color={Colors.info} />
            <Text style={styles.badgeText}>AES-256</Text>
          </View>
          <View style={styles.badge}>
            <MaterialIcons name="cloud-off" size={16} color={Colors.operations} />
            <Text style={styles.badgeText}>On-Premise</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + Spacing.sm : 50,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: Colors.success,
  },
  statusOffline: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  settingsButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  hero: {
    marginTop: Spacing.sm,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.onPrimary,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  cardStat: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});
