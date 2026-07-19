window.applyTheme = function(theme) {
    if (!theme) return;

    const root = document.documentElement;
    
    // Theme Mode
    let isDark = false;
    if (theme.theme === 'dark') {
        isDark = true;
    } else if (theme.theme === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
        root.style.setProperty('--white', '#0b0b0c');
        root.style.setProperty('--exec-black', '#FFFFFF');
        root.style.setProperty('--light-grey', '#000000');
        root.style.setProperty('--border-grey', '#1c1c1e');
    } else {
        root.style.setProperty('--white', '#FFFFFF');
        root.style.setProperty('--exec-black', '#0D0D0D');
        root.style.setProperty('--light-grey', '#F5F7F8');
        root.style.setProperty('--border-grey', '#E5E7EB');
    }

    // Colors
    if (theme.primary_color) {
        root.style.setProperty('--primary-green', theme.primary_color);
        const hex = theme.primary_color.replace('#', '');
        if (hex.length === 6) {
            // approximation for secondary if they only set primary in some cases, but they have secondary
        }
    }
    if (theme.secondary_color) {
        root.style.setProperty('--secondary-green', theme.secondary_color);
        root.style.setProperty('--dark-green', theme.secondary_color);
    }

    // Font
    if (theme.font_selection === 'roboto') {
        root.style.setProperty('--font-body', '"Roboto", sans-serif');
        root.style.setProperty('--font-heading', '"Open Sans", sans-serif');
    } else {
        root.style.setProperty('--font-body', '"Inter", sans-serif');
        root.style.setProperty('--font-heading', '"Montserrat", sans-serif');
    }

    // Card Radius
    let styleTag = document.getElementById('dynamic-theme-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-theme-styles';
        document.head.appendChild(styleTag);
    }

    let cssRules = '';
    if (theme.card_radius !== undefined) {
        cssRules += `
            .card, .btn, input, select, textarea, .border-radius-12, .stat-card {
                border-radius: ${theme.card_radius}px !important;
            }
        `;
    }

    // Sidebar Style
    if (theme.sidebar_style === 'collapsed') {
        cssRules += `
            .sidebar { width: 80px !important; }
            .sidebar .nav-item { justify-content: center; padding: 15px !important; }
            .sidebar .nav-item i { margin-right: 0 !important; font-size: 20px; }
            .sidebar .sidebar-logo h2 span { display: none; }
            .sidebar .sidebar-logo h2 { font-size: 12px; }
            .main-content { margin-left: 80px !important; width: calc(100% - 80px) !important; }
        `;
        
        // Hide text in nav items
        setTimeout(() => {
            const navItems = document.querySelectorAll('.sidebar .nav-item');
            navItems.forEach(item => {
                const icon = item.querySelector('i');
                if (icon) {
                    item.innerHTML = '';
                    item.appendChild(icon);
                }
            });
        }, 100);
    }
    
    styleTag.innerHTML = cssRules;
};

// Apply on load
try {
    const saved = localStorage.getItem('themeSettings');
    if (saved) {
        window.applyTheme(JSON.parse(saved));
    }
} catch (e) {
    console.error('Failed to load theme', e);
}
