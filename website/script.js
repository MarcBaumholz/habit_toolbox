// Habit Toolbox Website JavaScript

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navigation
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = 'none';
        }
    });

    // Add animation to process steps on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe process steps and tool cards
    const animatedElements = document.querySelectorAll('.process-step, .tool-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Problem input functionality
function findSolution() {
    const problemInput = document.getElementById('problemInput');
    const problem = problemInput.value.trim();
    
    if (!problem) {
        showNotification('Bitte gib dein Problem ein!', 'warning');
        return;
    }
    
    // Simulate AI analysis
    showNotification('Analysiere dein Problem...', 'info');
    
    setTimeout(() => {
        const solution = analyzeProblem(problem);
        showSolutionModal(solution);
    }, 2000);
}

function analyzeProblem(problem) {
    const keywords = problem.toLowerCase();
    
    // Simple keyword matching for demo
    if (keywords.includes('sport') || keywords.includes('fitness') || keywords.includes('bewegung')) {
        return {
            category: 'Fitness & Bewegung',
            icon: '🏃‍♂️',
            tools: ['Habit Stacking', 'Environment Design', 'Accountability Partner'],
            description: 'Basierend auf deinem Problem empfehlen wir die Fitness & Bewegung Toolbox.'
        };
    } else if (keywords.includes('lernen') || keywords.includes('studieren') || keywords.includes('produktivität')) {
        return {
            category: 'Lernen & Produktivität',
            icon: '🧠',
            tools: ['Pomodoro Technique', 'Deep Work Blocks', 'Learning Sprints'],
            description: 'Für dein Lernproblem ist die Lernen & Produktivität Toolbox ideal.'
        };
    } else if (keywords.includes('schlaf') || keywords.includes('erholung') || keywords.includes('müde')) {
        return {
            category: 'Schlaf & Erholung',
            icon: '😴',
            tools: ['Sleep Hygiene', 'Evening Routine', 'Digital Detox'],
            description: 'Die Schlaf & Erholung Toolbox hilft dir bei deinem Problem.'
        };
    } else if (keywords.includes('ernährung') || keywords.includes('essen') || keywords.includes('gesund')) {
        return {
            category: 'Ernährung & Gesundheit',
            icon: '🍎',
            tools: ['Meal Planning', 'Mindful Eating', 'Nutrition Tracking'],
            description: 'Für dein Ernährungsproblem ist diese Toolbox perfekt.'
        };
    } else {
        return {
            category: 'Allgemeine Gewohnheitsbildung',
            icon: '⚡',
            tools: ['Habit Loop', 'Implementation Intentions', 'Progress Tracking'],
            description: 'Wir empfehlen dir unsere allgemeine Gewohnheitsbildungs-Toolbox.'
        };
    }
}

function showSolutionModal(solution) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'solution-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeSolutionModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Deine Lösung</h3>
                <button class="modal-close" onclick="closeSolutionModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="solution-card">
                    <div class="solution-icon">${solution.icon}</div>
                    <h4>${solution.category}</h4>
                    <p>${solution.description}</p>
                    <div class="solution-tools">
                        <h5>Empfohlene Tools:</h5>
                        <ul>
                            ${solution.tools.map(tool => `<li>${tool}</li>`).join('')}
                        </ul>
                    </div>
                    <button class="btn btn-primary" onclick="openToolbox('${solution.category}')">
                        Toolbox öffnen
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .solution-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }
        
        .modal-content {
            position: relative;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 24px 0;
        }
        
        .modal-header h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 4px;
        }
        
        .modal-body {
            padding: 24px;
        }
        
        .solution-card {
            text-align: center;
        }
        
        .solution-icon {
            font-size: 4rem;
            margin-bottom: 16px;
        }
        
        .solution-card h4 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: #111827;
        }
        
        .solution-card p {
            color: #6b7280;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .solution-tools {
            text-align: left;
            margin-bottom: 24px;
        }
        
        .solution-tools h5 {
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
        }
        
        .solution-tools ul {
            list-style: none;
            padding: 0;
        }
        
        .solution-tools li {
            padding: 4px 0;
            color: #6b7280;
        }
        
        .solution-tools li:before {
            content: '✓';
            color: #10b981;
            font-weight: bold;
            margin-right: 8px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

function closeSolutionModal() {
    const modal = document.querySelector('.solution-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function openToolbox(category) {
    closeSolutionModal();
    showNotification(`Öffne ${category} Toolbox...`, 'info');
    
    // Show detailed toolbox modal
    showToolboxModal(category);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification-info {
            background: #3b82f6;
        }
        
        .notification-warning {
            background: #f59e0b;
        }
        
        .notification-success {
            background: #10b981;
        }
        
        .notification.show {
            transform: translateX(0);
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Tool card interactions
document.addEventListener('DOMContentLoaded', function() {
    const toolButtons = document.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.tool-card');
            const title = card.querySelector('h3').textContent;
            showNotification(`${title} Toolbox wird geöffnet...`, 'info');
        });
    });
});

// Add enter key support for problem input
document.addEventListener('DOMContentLoaded', function() {
    const problemInput = document.getElementById('problemInput');
    if (problemInput) {
        problemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                findSolution();
            }
        });
    }
});

// Toolbox Modal Functions
function showToolboxModal(category) {
    const toolboxData = getToolboxData(category);
    
    const modal = document.createElement('div');
    modal.className = 'toolbox-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeToolboxModal()"></div>
        <div class="modal-content toolbox-content">
            <div class="modal-header">
                <h3>${toolboxData.icon} ${toolboxData.name}</h3>
                <button class="modal-close" onclick="closeToolboxModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="toolbox-description">
                    <p>${toolboxData.description}</p>
                </div>
                <div class="toolbox-tools">
                    <h4>Verfügbare Tools</h4>
                    <div class="tools-grid">
                        ${toolboxData.tools.map(tool => `
                            <div class="tool-item">
                                <div class="tool-icon">${tool.icon}</div>
                                <h5>${tool.name}</h5>
                                <p>${tool.description}</p>
                                <button class="btn btn-sm" onclick="showToolDetails('${tool.id}')">
                                    Details anzeigen
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="toolbox-resources">
                    <h4>Ressourcen</h4>
                    <div class="resource-links">
                        ${toolboxData.resources.map(resource => `
                            <a href="${resource.url}" target="_blank" class="resource-link">
                                ${resource.icon} ${resource.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="downloadNotionTemplate()">
                        📥 Notion Template herunterladen
                    </button>
                    <button class="btn btn-secondary" onclick="joinCommunity()">
                        👥 Community beitreten
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

function closeToolboxModal() {
    const modal = document.querySelector('.toolbox-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function getToolboxData(category) {
    const toolboxes = {
        'Fitness & Bewegung': {
            name: 'Fitness & Bewegung',
            icon: '🏃‍♂️',
            description: 'Baue nachhaltige Fitness-Gewohnheiten auf und bleibe langfristig aktiv.',
            tools: [
                { id: 'habit-stacking', name: 'Habit Stacking', icon: '🔗', description: 'Verlinke neue Gewohnheiten mit bestehenden' },
                { id: 'environment-design', name: 'Environment Design', icon: '🏠', description: 'Gestalte deine Umgebung für Erfolg' },
                { id: 'progress-tracking', name: 'Progress Tracking', icon: '📊', description: 'Verfolge deine Fortschritte visuell' },
                { id: 'accountability', name: 'Accountability Partner', icon: '👥', description: 'Finde einen Trainingspartner' }
            ],
            resources: [
                { name: 'Fitness Tracker Template', url: '#', icon: '📋' },
                { name: 'Workout Planner', url: '#', icon: '💪' }
            ]
        },
        'Lernen & Produktivität': {
            name: 'Lernen & Produktivität',
            icon: '🧠',
            description: 'Maximiere deine Lernfähigkeit und Produktivität mit bewährten Methoden.',
            tools: [
                { id: 'pomodoro', name: 'Pomodoro Technique', icon: '⏰', description: '25-Minuten Fokus-Sessions' },
                { id: 'deep-work', name: 'Deep Work Blocks', icon: '🎯', description: 'Unterbrechungsfreie Arbeitszeiten' },
                { id: 'learning-sprints', name: 'Learning Sprints', icon: '🚀', description: 'Intensive Lernphasen' },
                { id: 'spaced-repetition', name: 'Spaced Repetition', icon: '🔄', description: 'Optimales Wiederholen' }
            ],
            resources: [
                { name: 'Study Planner', url: '#', icon: '📚' },
                { name: 'Focus Timer', url: '#', icon: '⏱️' }
            ]
        },
        'Schlaf & Erholung': {
            name: 'Schlaf & Erholung',
            icon: '😴',
            description: 'Verbessere deine Schlafqualität und Erholung für mehr Energie.',
            tools: [
                { id: 'sleep-hygiene', name: 'Sleep Hygiene', icon: '🛁', description: 'Optimale Schlafgewohnheiten' },
                { id: 'evening-routine', name: 'Evening Routine', icon: '🌙', description: 'Entspannende Abendroutine' },
                { id: 'digital-detox', name: 'Digital Detox', icon: '📱', description: 'Bildschirmfreie Zeit' },
                { id: 'meditation', name: 'Meditation', icon: '🧘', description: 'Achtsamkeitsübungen' }
            ],
            resources: [
                { name: 'Sleep Tracker', url: '#', icon: '😴' },
                { name: 'Meditation Guide', url: '#', icon: '🧘‍♀️' }
            ]
        },
        'Ernährung & Gesundheit': {
            name: 'Ernährung & Gesundheit',
            icon: '🍎',
            description: 'Entwickle gesunde Ernährungsgewohnheiten für langfristiges Wohlbefinden.',
            tools: [
                { id: 'meal-planning', name: 'Meal Planning', icon: '🍽️', description: 'Wöchentliche Essensplanung' },
                { id: 'mindful-eating', name: 'Mindful Eating', icon: '🧘', description: 'Achtsames Essen' },
                { id: 'nutrition-tracking', name: 'Nutrition Tracking', icon: '📊', description: 'Nährstoffverfolgung' },
                { id: 'hydration', name: 'Hydration Reminder', icon: '💧', description: 'Ausreichend trinken' }
            ],
            resources: [
                { name: 'Meal Planner', url: '#', icon: '📅' },
                { name: 'Nutrition Guide', url: '#', icon: '🥗' }
            ]
        },
        'Allgemeine Gewohnheitsbildung': {
            name: 'Allgemeine Gewohnheitsbildung',
            icon: '⚡',
            description: 'Die Grundlagen für erfolgreiche Gewohnheitsbildung in allen Lebensbereichen.',
            tools: [
                { id: 'habit-loop', name: 'Habit Loop', icon: '🔄', description: 'Cue-Routine-Reward Zyklus' },
                { id: 'implementation-intentions', name: 'Implementation Intentions', icon: '📝', description: 'Wenn-Dann Pläne' },
                { id: 'progress-tracking', name: 'Progress Tracking', icon: '📈', description: 'Fortschrittsverfolgung' },
                { id: 'habit-stacking', name: 'Habit Stacking', icon: '🔗', description: 'Gewohnheiten verketten' }
            ],
            resources: [
                { name: 'Habit Tracker', url: '#', icon: '📋' },
                { name: 'Implementation Guide', url: '#', icon: '🎯' }
            ]
        }
    };
    
    return toolboxes[category] || toolboxes['Allgemeine Gewohnheitsbildung'];
}

function showToolDetails(toolId) {
    const toolData = getToolDetails(toolId);
    
    const modal = document.createElement('div');
    modal.className = 'tool-details-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeToolDetailsModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${toolData.icon} ${toolData.name}</h3>
                <button class="modal-close" onclick="closeToolDetailsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tool-description">
                    <p>${toolData.description}</p>
                </div>
                <div class="tool-steps">
                    <h4>Anleitung</h4>
                    <ol>
                        ${toolData.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                <div class="tool-tips">
                    <h4>Pro-Tipps</h4>
                    <ul>
                        ${toolData.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

function closeToolDetailsModal() {
    const modal = document.querySelector('.tool-details-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function getToolDetails(toolId) {
    const tools = {
        'habit-stacking': {
            name: 'Habit Stacking',
            icon: '🔗',
            description: 'Verlinke neue Gewohnheiten mit bestehenden Routinen für besseren Erfolg.',
            steps: [
                'Identifiziere eine starke bestehende Gewohnheit',
                'Wähle eine neue Gewohnheit, die du aufbauen möchtest',
                'Verwende die Formel: "Nachdem ich [bestehende Gewohnheit], werde ich [neue Gewohnheit]"',
                'Starte mit der kleinstmöglichen Version',
                'Steigere die Komplexität allmählich'
            ],
            tips: [
                'Wähle Gewohnheiten, die natürlich zusammenpassen',
                'Sei spezifisch bei Zeit und Ort',
                'Verfolge deine Erfolgsrate',
                'Passe an, wenn die Verkettung nicht funktioniert'
            ]
        },
        'progress-tracking': {
            name: 'Progress Tracking',
            icon: '📊',
            description: 'Visualisiere deine Fortschritte, um motiviert zu bleiben und Muster zu erkennen.',
            steps: [
                'Wähle deine Tracking-Methode (App, Journal, Kalender)',
                'Definiere klare Erfolgsmetriken',
                'Dokumentiere tägliche Fortschritte',
                'Überprüfe wöchentliche Muster',
                'Feiere Meilensteine'
            ],
            tips: [
                'Mache das Tracking so einfach wie möglich',
                'Fokussiere auf Konsistenz statt Perfektion',
                'Verwende visuelle Hinweise wie Häkchen oder Farben',
                'Teile Fortschritte mit einem Accountability Partner'
            ]
        },
        'pomodoro': {
            name: 'Pomodoro Technique',
            icon: '⏰',
            description: 'Arbeite in 25-Minuten Fokus-Sessions mit kurzen Pausen für maximale Produktivität.',
            steps: [
                'Wähle eine Aufgabe aus',
                'Stelle einen Timer auf 25 Minuten',
                'Arbeite fokussiert bis der Timer klingelt',
                'Mache eine 5-Minuten Pause',
                'Wiederhole 4 Mal, dann mache eine längere Pause'
            ],
            tips: [
                'Eliminiere alle Ablenkungen während der Session',
                'Verwende einen physischen Timer',
                'Passe die Zeiten an deine Aufmerksamkeitsspanne an',
                'Verfolge deine abgeschlossenen Pomodoros'
            ]
        }
    };
    
    return tools[toolId] || {
        name: 'Tool Details',
        icon: '🔧',
        description: 'Detaillierte Informationen zu diesem Tool.',
        steps: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
        tips: ['Tipp 1', 'Tipp 2']
    };
}

function downloadNotionTemplate() {
    showNotification('Notion Template wird heruntergeladen...', 'success');
    // Simulate download
    setTimeout(() => {
        showNotification('Download abgeschlossen!', 'success');
    }, 2000);
}

function joinCommunity() {
    showNotification('Weiterleitung zur WhatsApp Community...', 'info');
    // Simulate redirect
    setTimeout(() => {
        window.open('https://wa.me/your-community-link', '_blank');
    }, 1000);
}
