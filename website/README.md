# Habit Toolbox Website

Eine moderne, interaktive Website für Gewohnheitsbildung mit KI-gestützter Toolbox-Empfehlung.

## Features

- 🎯 **KI-Problem-Analyse**: Gib dein Gewohnheitsproblem ein und erhalte personalisierte Toolbox-Empfehlungen
- 🔧 **Interaktive Toolboxes**: Detaillierte Anleitungen für verschiedene Gewohnheitsbereiche
- 📱 **Responsive Design**: Optimiert für alle Geräte
- 🎨 **Modern Dark Theme**: Elegantes Design mit Glow-Effekten
- 📥 **Notion Integration**: Direkter Download von Templates
- 👥 **Community Features**: WhatsApp Group Integration

## Design-Varianten

1. **Variation 1** (`index.html` + `styles.css`): Minimal Clean (Blue/White)
2. **Variation 2** (`variation2.html` + `variation2.css`): Warm Productivity (Green/Orange)  
3. **Variation 3** (`variation3.html` + `variation3.css`): Modern Dark (Purple/Teal) - **AKTIV**

## Technische Details

- **HTML5**: Semantisches Markup
- **CSS3**: Moderne Features mit CSS Grid und Flexbox
- **JavaScript**: Vanilla JS für Interaktivität
- **Responsive**: Mobile-first Design
- **Performance**: Optimiert für schnelle Ladezeiten
- **Accessibility**: Barrierefreie Navigation

## Lokale Entwicklung

```bash
# Starte lokalen Server
python3 -m http.server 8080

# Oder mit Node.js
npx serve .

# Oder mit PHP
php -S localhost:8080
```

## GitHub Pages Deployment

Die Website ist automatisch für GitHub Pages konfiguriert:

1. Repository auf GitHub erstellen
2. GitHub Pages in den Repository-Einstellungen aktivieren
3. `website/` Ordner als Source auswählen
4. Website ist live unter `https://username.github.io/repository-name`

## Struktur

```
website/
├── index.html              # Hauptseite (Design 3)
├── variation2.html         # Design Variation 2
├── variation3.html         # Design Variation 3
├── styles.css              # Design 1 Styles
├── variation2.css          # Design 2 Styles
├── variation3.css          # Design 3 Styles (AKTIV)
├── script.js               # JavaScript Funktionalität
├── .github/workflows/      # GitHub Actions
└── README.md               # Diese Datei
```

## Features im Detail

### KI-Problem-Analyse
- Keyword-basierte Analyse
- Kategorisierung von Gewohnheitsproblemen
- Personalisierte Toolbox-Empfehlungen
- Confidence-Score Anzeige

### Toolbox-System
- **Fitness & Bewegung**: Habit Stacking, Environment Design, Progress Tracking
- **Lernen & Produktivität**: Pomodoro, Deep Work, Learning Sprints
- **Schlaf & Erholung**: Sleep Hygiene, Evening Routine, Digital Detox
- **Ernährung & Gesundheit**: Meal Planning, Mindful Eating, Nutrition Tracking
- **Allgemeine Gewohnheitsbildung**: Habit Loop, Implementation Intentions

### Interaktive Modals
- Toolbox-Detailansicht mit Tools und Ressourcen
- Tool-Details mit Schritt-für-Schritt Anleitungen
- Pro-Tipps für bessere Umsetzung
- Download-Links für Notion Templates

## Browser-Unterstützung

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Lizenz

MIT License - Siehe LICENSE Datei für Details.