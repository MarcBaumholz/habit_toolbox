# 🎯 HabitLink - Advanced Habit Tracking System

A modern, full-stack habit tracking application with AI-powered recommendations, analytics, and social accountability features.

## ✨ Features

### 🎨 **Modern UI/UX**
- **Dark Mode Toggle** - System preference detection with manual override
- **Mobile-First Design** - Responsive layout with collapsible sidebar
- **Weekly Navigation** - Calendar week (KW) display with date ranges
- **Smooth Animations** - Professional transitions and micro-interactions

### 📊 **Advanced Analytics**
- **Real-time Dashboard** - Habit completion rates and streak tracking
- **Visual Progress** - Weekly heatmaps and progress bars
- **Streak Celebrations** - Milestone achievements with animations
- **Performance Metrics** - Success rates and habit insights

### 🔥 **Enhanced Streak System**
- **Visual Indicators** - Fire emojis and color-coded badges
- **Milestone Badges** - Week, month, and legendary streak achievements
- **Streak Celebrations** - Popup animations for major milestones
- **Progress Tracking** - Real-time streak updates

### 🤖 **AI-Powered Website**
- **Problem Analysis** - Enhanced keyword-based AI analysis
- **Confidence Scoring** - Intelligent recommendation system
- **Interactive Toolboxes** - Detailed modals with tools and instructions
- **Notion Integration** - Template downloads and community features

### 📱 **Mobile Optimization**
- **Responsive Sidebar** - Collapsible navigation for mobile
- **Touch-Friendly** - Optimized for mobile interactions
- **Progressive Web App** - Installable on mobile devices
- **Offline Support** - Cached data for offline tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/habit_toolbox.git
cd habit_toolbox
```

2. **Start the development environment**
```bash
./scripts/run_dev.sh
```

3. **Access the application**
- Frontend: http://localhost:3010
- Backend API: http://localhost:8050
- Website: http://localhost:8080

## 🏗️ Architecture

### Backend (FastAPI)
- **Port**: 8050
- **Database**: SQLite with SQLModel
- **Authentication**: JWT tokens
- **API**: RESTful endpoints with OpenAPI docs

### Frontend (Next.js)
- **Port**: 3010
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State**: React hooks with local state management

### Website (Static)
- **Port**: 8080 (development)
- **Deployment**: GitHub Pages
- **Features**: AI analysis, interactive toolboxes, modern design

## 📁 Project Structure

```
habit/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routers/        # API endpoints
│   │   └── main.py         # FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   └── package.json       # Node dependencies
├── website/               # Static website
│   ├── index.html         # Main page
│   ├── variation3.css     # Modern dark theme
│   ├── script.js          # AI analysis & interactions
│   └── .github/workflows/ # GitHub Actions
└── scripts/
    └── run_dev.sh         # Development startup script
```

## 🎨 Design System

### Color Palette
- **Primary**: Electric indigo (#3551FE)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Dark Mode**: Slate backgrounds with high contrast

### Typography
- **Font**: System fonts with feature settings
- **Scale**: Responsive typography with Tailwind classes
- **Hierarchy**: Clear heading and body text distinction

## 🔧 Development

### Adding New Features

1. **Backend**: Add models in `backend/app/models/` and endpoints in `backend/app/routers/`
2. **Frontend**: Create components in `frontend/components/` and pages in `frontend/app/`
3. **Website**: Update HTML/CSS/JS in `website/` directory

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Testing

```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## 🌐 Deployment

### Habit App (Production)
- **Backend**: Deploy to Railway, Heroku, or similar
- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Database**: Use PostgreSQL for production

### Website (GitHub Pages)
1. Create GitHub repository
2. Push website code to main branch
3. Enable GitHub Pages in repository settings
4. Access at `https://username.github.io/repository-name`

## 📊 Analytics & Monitoring

- **Habit Completion Rates** - Track success metrics
- **Streak Analytics** - Monitor consistency patterns
- **User Engagement** - Measure feature usage
- **Performance Metrics** - Monitor app performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern habit tracking apps and productivity tools
- **Icons**: Heroicons and custom emoji sets
- **Color Palette**: Tailwind CSS design system
- **AI Integration**: OpenAI API for enhanced problem analysis

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/habit_toolbox/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/habit_toolbox/discussions)
- **Email**: support@habitlink.app

---

**Built with ❤️ for better habits and productivity**