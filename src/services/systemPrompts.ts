// System prompts for each sector - matching the web application

export const SystemPrompts: Record<string, string> = {
  ao: `Tu es un expert en réponse aux appels d'offres (marchés publics et privés). Tu maîtrises parfaitement :
- L'analyse des cahiers des charges (CCTP, RC, DPGF)
- La rédaction de mémoires techniques professionnels
- La construction de matrices de conformité
- Le chiffrage et l'estimation des coûts
- La stratégie de différenciation compétitive

Réponds en français, de manière structurée et professionnelle. Utilise des titres, sous-titres et listes quand c'est approprié.`,

  juridique: `Tu es un expert juridique spécialisé en droit français et européen. Tu maîtrises :
- L'analyse de contrats et documents juridiques
- La conformité RGPD et protection des données
- Le droit des affaires et M&A
- L'identification des risques et clauses problématiques
- La rédaction et reformulation juridique

Analyse les documents avec rigueur. Identifie les points critiques, les risques et les opportunités. Réponds en français avec une structure claire.`,

  sante: `Tu es un expert médical et scientifique. Tu maîtrises :
- L'analyse de dossiers patients et rapports médicaux
- La synthèse clinique et le raisonnement diagnostique
- La recherche bibliographique et l'analyse d'études
- Les recommandations HAS, ANSM et guidelines françaises
- La rédaction de comptes-rendus médicaux

Réponds avec précision et rigueur scientifique. Cite les sources quand pertinent. Respecte la terminologie médicale française.`,

  operations: `Tu es un expert en opérations, supply chain et excellence opérationnelle. Tu maîtrises :
- L'analyse de données opérationnelles et KPIs
- La gestion de supply chain et logistique
- Les méthodologies Lean, Six Sigma, Kaizen
- La gestion de projet (Agile, Waterfall, SAFe)
- L'analyse de risques et plans d'action
- La rédaction de PV de réunion et reporting

Réponds de manière structurée avec des recommandations actionnables. Utilise des frameworks reconnus.`,

  rh: `Tu es un expert en ressources humaines et gestion des talents. Tu maîtrises :
- L'analyse de CV et le scoring de candidatures
- La conduite d'entretiens structurés
- Les plans de formation et développement
- L'onboarding et l'intégration
- La gestion administrative RH
- Le droit du travail français

Réponds de manière professionnelle et bienveillante. Respecte les principes RGPD dans le traitement des données personnelles.`,

  infrastructure: `Tu es un expert en infrastructure IT et déploiement de modèles d'IA. Tu maîtrises :
- La configuration de clusters GPU
- Le monitoring de performance (VRAM, latence, charge)
- Le déploiement de modèles LLM
- L'architecture on-premise vs cloud hybride
- La sécurité et conformité des infrastructures

Réponds avec précision technique. Utilise la terminologie appropriée.`,
};

export const SectorInfo: Record<string, {
  name: string;
  icon: string;
  color: string;
  description: string;
  suggestions: Array<{ title: string; description: string; prompt: string }>;
}> = {
  ao: {
    name: 'Appels d\'Offres',
    icon: 'description',
    color: '#D97706',
    description: 'Assistant IA pour la réponse aux appels d\'offres',
    suggestions: [
      { title: 'Analyse CCTP', description: 'Analyser un cahier des charges', prompt: 'Analyse ce cahier des charges et identifie les points clés, les exigences techniques et les critères de notation.' },
      { title: 'Mémoire Technique', description: 'Rédiger un mémoire', prompt: 'Rédige un mémoire technique professionnel basé sur le document fourni.' },
      { title: 'Matrice Conformité', description: 'Vérifier la conformité', prompt: 'Construis une matrice de conformité détaillée à partir de ce document.' },
      { title: 'Chiffrage', description: 'Estimer les coûts', prompt: 'Aide-moi à estimer et structurer le chiffrage pour cette réponse.' },
    ],
  },
  juridique: {
    name: 'Juridique',
    icon: 'gavel',
    color: '#254AEA',
    description: 'Analyse juridique et contractuelle',
    suggestions: [
      { title: 'Synthèse', description: 'Résumer un document', prompt: 'Fais une synthèse complète de ce document juridique en identifiant les parties, l\'objet et les clauses principales.' },
      { title: 'Risques', description: 'Identifier les risques', prompt: 'Identifie et analyse tous les risques juridiques présents dans ce document.' },
      { title: 'Conformité RGPD', description: 'Audit RGPD', prompt: 'Effectue un audit de conformité RGPD de ce document.' },
      { title: 'Benchmark', description: 'Comparer aux standards', prompt: 'Compare ce document aux standards et bonnes pratiques du secteur.' },
    ],
  },
  sante: {
    name: 'Santé',
    icon: 'health-and-safety',
    color: '#10B981',
    description: 'Assistant médical et recherche clinique',
    suggestions: [
      { title: 'Synthèse Clinique', description: 'Résumé médical', prompt: 'Effectue une synthèse clinique structurée de ce dossier.' },
      { title: 'Recherche', description: 'Question scientifique', prompt: 'Réponds à cette question médicale en citant les recommandations et études pertinentes.' },
      { title: 'Analyse Patient', description: 'Analyser un dossier', prompt: 'Analyse ce dossier patient et identifie les points d\'attention.' },
      { title: 'Aide Diagnostic', description: 'Raisonnement clinique', prompt: 'Aide-moi dans le raisonnement diagnostique à partir de ces éléments cliniques.' },
    ],
  },
  operations: {
    name: 'Opérations',
    icon: 'precision-manufacturing',
    color: '#F97316',
    description: 'Supply chain, Lean et gestion de projet',
    suggestions: [
      { title: 'Analytics', description: 'Analyse de données', prompt: 'Analyse ces données opérationnelles et identifie les tendances et anomalies.' },
      { title: 'Supply Chain', description: 'Optimisation logistique', prompt: 'Analyse cette situation supply chain et propose des optimisations.' },
      { title: 'Gestion Projet', description: 'Suivi et pilotage', prompt: 'Aide-moi à structurer et piloter ce projet.' },
      { title: 'Lean / Six Sigma', description: 'Amélioration continue', prompt: 'Applique une méthodologie Lean/Six Sigma à cette problématique.' },
    ],
  },
  rh: {
    name: 'Ressources Humaines',
    icon: 'groups',
    color: '#7C3AED',
    description: 'Recrutement, formation et gestion des talents',
    suggestions: [
      { title: 'Analyse CV', description: 'Évaluer des candidatures', prompt: 'Analyse ce CV et évalue la pertinence du profil par rapport au poste.' },
      { title: 'Entretien', description: 'Préparer un entretien', prompt: 'Prépare une grille d\'entretien structuré pour ce poste.' },
      { title: 'Formation', description: 'Plan de développement', prompt: 'Propose un plan de formation adapté à ce profil et ces objectifs.' },
      { title: 'Onboarding', description: 'Programme d\'intégration', prompt: 'Crée un programme d\'onboarding structuré pour ce poste.' },
    ],
  },
};
