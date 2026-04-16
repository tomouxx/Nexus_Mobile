# Nexus Mobile by SQLI

Application mobile React Native (Expo) pour la plateforme Nexus d'IA souveraine.

## Prérequis

- **Node.js** 18+ : https://nodejs.org
- **Expo CLI** : `npm install -g expo-cli`
- **Android Studio** (pour émulateur) ou **Expo Go** sur téléphone

## Installation

```bash
cd Nexus_Mobile
npm install
```

## Lancement (développement)

```bash
# Démarrer le serveur Expo
npx expo start

# Directement sur Android
npx expo start --android

# Directement sur iOS (Mac uniquement)
npx expo start --ios
```

Scannez le QR code avec l'app **Expo Go** sur votre téléphone, ou utilisez un émulateur.

## Configuration serveur LLM

Par défaut, l'app se connecte à `http://10.0.2.2:8000` (émulateur Android → localhost).

Pour changer l'URL :
1. Ouvrez l'app
2. Connectez-vous (mot de passe : `VELO`)
3. Allez dans **Paramètres** (icône engrenage)
4. Modifiez l'URL du serveur
5. Testez la connexion

Pour un appareil physique, utilisez l'IP de votre machine (ex: `http://192.168.1.XX:8000`).

## Build Android (APK)

```bash
# Build APK de développement
npx expo run:android

# Build APK de production avec EAS
npm install -g eas-cli
eas build --platform android --profile preview
```

## Build iOS (futur)

```bash
# Sur Mac uniquement
npx expo run:ios

# Build avec EAS (ne nécessite pas de Mac)
eas build --platform ios
```

## Structure du projet

```
src/
├── components/       # Composants réutilisables
│   └── ChatBubble.tsx    # Bulle de chat avec markdown
├── screens/          # Écrans de l'application
│   ├── LoginScreen.tsx       # Authentification
│   ├── HomeScreen.tsx        # Accueil avec grille secteurs
│   ├── SectorChatScreen.tsx  # Chat IA par secteur
│   ├── InfrastructureScreen.tsx  # Monitoring GPU/modèles
│   └── SettingsScreen.tsx    # Paramètres et connexion
├── services/         # Services et API
│   ├── api.ts            # Communication LLM (streaming)
│   ├── systemPrompts.ts  # Prompts système par secteur
│   └── documentReader.ts # Lecture de documents
└── theme/            # Design system
    └── colors.ts         # Couleurs, espacements, typographie
```

## Fonctionnalités

- **Authentification** : Écran de verrouillage avec mot de passe
- **6 secteurs** : Santé, Juridique, Opérations, RH, Appels d'Offres, Infrastructure
- **Chat IA streaming** : Réponses en temps réel avec rendu markdown
- **Upload documents** : PDF, DOCX, CSV, JSON, TXT, XML...
- **Monitoring** : Métriques GPU, catalogue de modèles LLM, logs
- **Paramètres** : Configuration serveur, test de connexion

## Portage iOS

Le projet est prêt pour iOS — même codebase, aucune modification nécessaire :
1. Sur Mac : `npx expo run:ios`
2. Sans Mac : `eas build --platform ios` (via Expo EAS cloud build)
