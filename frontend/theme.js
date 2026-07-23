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
        root.setAttribute('data-theme', 'dark');
        
        // Cleanup old inline styles if they exist from previous versions
        root.style.removeProperty('--white');
        root.style.removeProperty('--exec-black');
        root.style.removeProperty('--light-grey');
        root.style.removeProperty('--border-grey');
    } else {
        root.removeAttribute('data-theme');
        
        // Cleanup old inline styles
        root.style.removeProperty('--white');
        root.style.removeProperty('--exec-black');
        root.style.removeProperty('--light-grey');
        root.style.removeProperty('--border-grey');
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

    // Update Chart.js colors if Chart is loaded
    if (typeof Chart !== 'undefined') {
        const textColor = isDark ? '#D1D5DB' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
        
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
        
        // Update all existing charts
        for (let id in Chart.instances) {
            let chart = Chart.instances[id];
            
            // Update scales (axes and grid)
            if (chart.options.scales) {
                for (let axis in chart.options.scales) {
                    if (chart.options.scales[axis].ticks) {
                        chart.options.scales[axis].ticks.color = textColor;
                    }
                    if (chart.options.scales[axis].grid) {
                        chart.options.scales[axis].grid.color = gridColor;
                    }
                }
            }
            
            // Update legend
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            // Update title
            if (chart.options.plugins && chart.options.plugins.title) {
                chart.options.plugins.title.color = textColor;
            }
            
            chart.update();
        }
    }
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
