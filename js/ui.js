/**
 * StudySphere - UI & Router Coordinator
 * Manages routing, modals, toasts, dark/light theme, and main layout interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initRouter();
    initSidebar();
    initNotifications();
    checkUpcomingAssignments();
});

// ==========================================================================
// Theme Management
// ==========================================================================
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('studysphere_theme') || 'dark';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('studysphere_theme', newTheme);
        updateThemeIcon(newTheme);
        
        showToast(
            'Theme Updated', 
            `Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode`, 
            'success'
        );
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.setAttribute('data-lucide', 'sun');
        } else {
            themeIcon.setAttribute('data-lucide', 'moon');
        }
        if (window.lucide) lucide.createIcons();
    }
}

// ==========================================================================
// Toast Notification Component
// ==========================================================================
function showToast(title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'error') iconName = 'alert-circle';

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">&times;</div>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    // Slide in and set cleanup
    const removeToast = () => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };

    const autoRemove = setTimeout(removeToast, 4000);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeToast();
    });
}

// Export toast globally
window.showToast = showToast;

// ==========================================================================
// Modal Handlers
// ==========================================================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modals when clicking overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

window.openModal = openModal;
window.closeModal = closeModal;

// ==========================================================================
// Sidebar & Header Mobile Interactivity
// ==========================================================================
function initSidebar() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');

    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        // Close sidebar on clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== hamburgerBtn) {
                sidebar.classList.remove('active');
            }
        });

        // Close sidebar on navigation item click (mobile)
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        });
    }
}

// ==========================================================================
// Router System (Hash-based Routing)
// ==========================================================================
const routes = {
    'dashboard': { render: 'renderDashboard', title: 'Dashboard' },
    'notes': { render: 'renderNotes', title: 'Note Sharing' },
    'groups': { render: 'renderGroups', title: 'Study Groups' },
    'assignments': { render: 'renderAssignments', title: 'Assignments Tracker' },
    'resources': { render: 'renderResources', title: 'Resource Library' },
    'forum': { render: 'renderForum', title: 'Discussion Forum' },
    'profile': { render: 'renderProfile', title: 'Student Profile' }
};

function initRouter() {
    window.addEventListener('hashchange', handleRouteChange);
    
    // Initial route load
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    } else {
        handleRouteChange();
    }
}

function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const route = routes[hash] || routes['dashboard'];
    
    // Update Sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemHash = item.getAttribute('href');
        if (itemHash === `#${hash}`) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
// Update Navbar Page Title
    const pageTitles = {
        dashboard: { name: 'Dashboard', icon: 'layout-dashboard' },
        notes: { name: 'Note Sharing', icon: 'file-text' },
        groups: { name: 'Study Groups', icon: 'users' },
        assignments: { name: 'Assignments', icon: 'check-square' },
        resources: { name: 'Resource Library', icon: 'library' },
        forum: { name: 'Discussion Forum', icon: 'message-square' },
        profile: { name: 'Profile', icon: 'user' }
    };

    const pageInfo = pageTitles[hash] || pageTitles['dashboard'];
    const navbarName = document.getElementById('navbar-page-name');
    const navbarIcon = document.getElementById('navbar-page-icon');

    if (navbarName) navbarName.textContent = pageInfo.name;
    if (navbarIcon) {
        navbarIcon.setAttribute('data-lucide', pageInfo.icon);
        lucide.createIcons();
    }
    const pageContainer = document.getElementById('page-container');
    if (pageContainer) {
        // Fade out transition
        pageContainer.classList.add('fade-out');
        
        setTimeout(() => {
            // Render specific page
            if (window.pages && typeof window.pages[route.render] === 'function') {
                window.pages[route.render]();
            } else {
                pageContainer.innerHTML = `<h2>Page ${route.title} is under construction.</h2>`;
            }
            
            // Render Mini Profile in sidebar footer
            renderMiniProfile();

            // Document Title update
            document.title = `StudySphere - ${route.title}`;
            
            // Re-run Lucide Icons
            if (window.lucide) lucide.createIcons();
            
            // Fade in transition
            pageContainer.classList.remove('fade-out');
            
            // Scroll to top
            window.scrollTo(0, 0);
        }, 200);
    }
}

// Sidebar mini-profile refresh
function renderMiniProfile() {
    const miniProfileContainer = document.getElementById('mini-profile-container');
    if (miniProfileContainer && window.db) {
        const prof = window.db.getProfile();
        miniProfileContainer.innerHTML = `
            <img class="user-mini-avatar" src="${prof.avatar}" alt="${prof.name}">
            <div class="user-mini-info">
                <div class="user-mini-name">${prof.name}</div>
                <div class="user-mini-role">${prof.role}</div>
            </div>
        `;
        miniProfileContainer.onclick = () => {
            window.location.hash = '#profile';
        };
    }
}

// Global search handling across current views
const globalSearch = document.getElementById('global-search');
if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const hash = window.location.hash.slice(1) || 'dashboard';
        
        if (window.pages && typeof window.pages.handleGlobalSearch === 'function') {
            window.pages.handleGlobalSearch(hash, query);
        }
    });
}

// ==========================================================================
// Notifications & Reminders
// ==========================================================================
function initNotifications() {
    const notifBtn = document.getElementById('notifications-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            // Trigger a modal or check showing deadline warnings
            const upcoming = getApproachingAssignments();
            if (upcoming.length === 0) {
                showToast('Notifications', 'No upcoming deadlines due within 48 hours!', 'info');
            } else {
                let listHtml = upcoming.map(a => {
                    const hours = Math.round((new Date(a.dueDate) - new Date()) / 3600000);
                    return `• ${a.title} (${a.course}) is due in ${hours} hours!`;
                }).join('\n');
                
                showToast('Urgent Deadlines', listHtml, 'warning');
            }
        });
    }
}

function getApproachingAssignments() {
    if (!window.db) return [];
    const assignments = window.db.getAssignments();
    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return assignments.filter(a => {
        if (a.status === 'Completed') return false;
        const due = new Date(a.dueDate);
        return due > now && due <= fortyEightHoursLater;
    });
}

function checkUpcomingAssignments() {
    // Run after a short delay on page load
    setTimeout(() => {
        const upcoming = getApproachingAssignments();
        if (upcoming.length > 0) {
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.style.display = 'flex';
                badge.innerText = upcoming.length;
            }
            
            showToast(
                'Upcoming Deadlines!',
                `You have ${upcoming.length} assignment(s) due soon. Click the notification icon to view details.`,
                'warning'
            );
        } else {
            const badge = document.getElementById('notif-badge');
            if (badge) badge.style.display = 'none';
        }
    }, 1500);
}

// Export utility functions
window.renderMiniProfile = renderMiniProfile;
window.checkUpcomingAssignments = checkUpcomingAssignments;
