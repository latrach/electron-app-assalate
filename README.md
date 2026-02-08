# Assalate - Horaires de priere Orleans

Application desktop macOS pour afficher les horaires de priere d'Orleans (France).

![Electron](https://img.shields.io/badge/Electron-40+-47848F?logo=electron&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-macOS-000000?logo=apple&logoColor=white)

## Fonctionnalites

- Affichage des 6 prieres du jour (Fajr, Shuruk, Dhuhr, Asr, Maghrib, Isha)
- Compte a rebours en temps reel vers la prochaine priere
- Date gregorienne et hijri
- Icone dans la barre de menu macOS avec mini-widget
- Notifications macOS a l'heure de chaque priere
- Recalcul automatique a minuit

## Installation

### Depuis le DMG

1. Telecharger le fichier `Assalate-1.0.0-arm64.dmg` depuis les [Releases](https://github.com/latrach/electron-app-assalate/releases)
2. Ouvrir le DMG
3. Glisser **Assalate.app** dans le dossier **Applications**

### Depuis les sources

```bash
git clone https://github.com/latrach/electron-app-assalate.git
cd electron-app-assalate
npm install
npm start
```

### Generer le DMG

```bash
npm run build
open dist/Assalate-1.0.0-arm64.dmg
```

## Source des horaires

Les horaires proviennent de [assalate.latrach.net](https://assalate.latrach.net) et sont stockes dans `assets/horaires-annee.csv` (366 jours, changement d'heure inclus).

Coordonnees : Orleans, France (47.9029, 1.9039)

## Stack technique

- [Electron](https://www.electronjs.org/) - Framework desktop
- [electron-builder](https://www.electron.build/) - Packaging DMG macOS

## Licence

MIT - Said Latrach
