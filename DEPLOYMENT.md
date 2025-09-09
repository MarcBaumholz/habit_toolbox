# GitHub Pages Deployment Anleitung

## Schritt 1: GitHub Repository erstellen

1. Gehe zu [GitHub.com](https://github.com)
2. Klicke auf "New repository"
3. Repository Name: `habit-toolbox-website`
4. Beschreibung: `Modern Habit Toolbox Website with AI-powered recommendations`
5. Wähle "Public"
6. **WICHTIG**: Lass "Add a README file" **UNCHECKED**
7. Klicke "Create repository"

## Schritt 2: Code hochladen

### Option A: Über GitHub Web Interface
1. Klicke "uploading an existing file"
2. Ziehe alle Dateien aus dem `website/` Ordner in das Repository
3. Commit message: "Initial commit: Habit Toolbox Website"
4. Klicke "Commit changes"

### Option B: Über Git Command Line
```bash
# Remote Repository hinzufügen (ersetze USERNAME mit deinem GitHub Username)
git remote add origin https://github.com/USERNAME/habit-toolbox-website.git

# Code pushen
git branch -M main
git push -u origin main
```

## Schritt 3: GitHub Pages aktivieren

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf "Settings" (oben rechts)
3. Scrolle runter zu "Pages" (linke Sidebar)
4. Unter "Source" wähle "Deploy from a branch"
5. Branch: `main`
6. Folder: `/ (root)`
7. Klicke "Save"

## Schritt 4: Website ist live!

Deine Website ist jetzt verfügbar unter:
`https://USERNAME.github.io/habit-toolbox-website`

## Features der Website

✅ **KI-Problem-Analyse**: Gib dein Gewohnheitsproblem ein und erhalte personalisierte Empfehlungen
✅ **Interaktive Toolboxes**: 5 verschiedene Kategorien mit detaillierten Tools
✅ **Modern Dark Design**: Elegantes Design mit Glow-Effekten
✅ **Responsive**: Funktioniert perfekt auf allen Geräten
✅ **Notion Integration**: Download-Links für Templates
✅ **Community Features**: WhatsApp Group Integration

## Testen der Website

1. Öffne die Website in deinem Browser
2. Gib ein Gewohnheitsproblem ein (z.B. "Ich will morgens früher aufstehen")
3. Klicke "Lösung finden"
4. Erkunde die empfohlene Toolbox
5. Klicke auf einzelne Tools für detaillierte Anleitungen

## Anpassungen

- **Design ändern**: Wechsle zwischen den 3 Design-Varianten
- **Farben anpassen**: Bearbeite die CSS-Variablen in `variation3.css`
- **Tools hinzufügen**: Erweitere die `getToolboxData()` Funktion in `script.js`
- **KI verbessern**: Erweitere die `analyzeProblem()` Funktion

## Support

Bei Fragen oder Problemen:
1. Überprüfe die Browser-Konsole auf Fehler
2. Teste die Website in verschiedenen Browsern
3. Überprüfe die GitHub Pages Einstellungen
