/* ==================================================
   SETTINGS MODULE SCRIPTS
================================================== */

// DOM Elements
const settingTabs = document.querySelectorAll('.setting-tab');
const settingPanes = document.querySelectorAll('.settings-pane');

// 1. Tab Switching Logic
settingTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all tabs & panes
        settingTabs.forEach(t => t.classList.remove('active'));
        settingPanes.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Add active class to corresponding pane
        const targetId = tab.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// 2. Activity Logs Mock Data
const sampleLogs = [
    { date: '26 Jun 2026, 10:25 AM', user: 'Admin', action: 'Updated Website Settings', module: 'Settings', ip: '192.168.1.25', device: 'Chrome / Win', status: 'Success' },
    { date: '26 Jun 2026, 09:14 AM', user: 'Admin', action: 'Created New Banner', module: 'Banners', ip: '192.168.1.25', device: 'Chrome / Win', status: 'Success' },
    { date: '25 Jun 2026, 18:45 PM', user: 'Samuel', action: 'Failed Login Attempt', module: 'Auth', ip: '103.45.12.99', device: 'Safari / iOS', status: 'Failed' },
    { date: '25 Jun 2026, 16:30 PM', user: 'Admin', action: 'Exported Leads Report', module: 'Leads', ip: '192.168.1.25', device: 'Chrome / Win', status: 'Success' },
    { date: '24 Jun 2026, 11:20 AM', user: 'System', action: 'Automated Database Backup', module: 'System', ip: 'Localhost', device: 'Server', status: 'Success' },
    { date: '23 Jun 2026, 14:15 PM', user: 'Samuel', action: 'Updated Lead Status', module: 'Leads', ip: '103.45.12.99', device: 'Safari / Mac', status: 'Success' },
    { date: '22 Jun 2026, 10:05 AM', user: 'System', action: 'SMTP Email Test', module: 'Settings', ip: 'Localhost', device: 'Server', status: 'Failed' },
    { date: '21 Jun 2026, 09:30 AM', user: 'Admin', action: 'Deleted Banner BN004', module: 'Banners', ip: '192.168.1.25', device: 'Chrome / Win', status: 'Success' }
];

const renderActivityLogs = () => {
    const tbody = document.getElementById('activityLogsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sampleLogs.forEach(log => {
        const badgeClass = log.status === 'Success' ? 'badge-active' : 'badge-failed';
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${log.date}</td>
            <td class="fw-bold">${log.user}</td>
            <td>${log.action}</td>
            <td>${log.module}</td>
            <td class="font-mono text-muted">${log.ip}</td>
            <td>${log.device}</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td><button class="btn btn-outline btn-small" title="View Details"><i class="fas fa-ellipsis-v"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
};

// 3. Modals
window.openSaveModal = () => {
    document.getElementById('saveSettingsModal').classList.add('active');
};
window.openResetModal = () => {
    document.getElementById('resetSettingsModal').classList.add('active');
};
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
};
window.confirmSave = () => {
    closeModal('saveSettingsModal');
    // Optional toast notification simulation here
};
window.confirmReset = () => {
    closeModal('resetSettingsModal');
};

// 4. Analytics & Health Charts
const initSystemCharts = () => {
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter' } } } }
    };

    // Chart 1: Daily Logins (Line)
    const ctxLogins = document.getElementById('loginsChart');
    if (ctxLogins) {
        new Chart(ctxLogins, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Admin Logins',
                    data: [12, 19, 15, 22, 18, 5, 8],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4, fill: true, borderWidth: 3
                },
                {
                    label: 'Failed Attempts',
                    data: [0, 2, 1, 0, 4, 1, 0],
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    tension: 0.4, fill: false, borderWidth: 2, borderDash: [5, 5]
                }]
            },
            options: chartOptions
        });
    }

    // Chart 2: System Usage (Pie)
    const ctxUsage = document.getElementById('usageChart');
    if (ctxUsage) {
        new Chart(ctxUsage, {
            type: 'pie',
            data: {
                labels: ['Database', 'Media Files', 'System Logs', 'Backups'],
                datasets: [{
                    data: [35, 45, 5, 15],
                    backgroundColor: ['#0B6B3A', '#3b82f6', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }

    // Chart 3: Storage (Bar)
    const ctxStorage = document.getElementById('storageChart');
    if (ctxStorage) {
        new Chart(ctxStorage, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Storage Growth (GB)',
                    data: [150, 180, 210, 250, 290, 340],
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: chartOptions
        });
    }

    // Chart 4: Notifications (Doughnut)
    const ctxNotifications = document.getElementById('notificationsChart');
    if (ctxNotifications) {
        new Chart(ctxNotifications, {
            type: 'doughnut',
            data: {
                labels: ['Email Delivered', 'SMS Sent', 'WhatsApp', 'Push Notifs'],
                datasets: [{
                    data: [850, 120, 350, 600],
                    backgroundColor: ['#2563eb', '#f97316', '#22c55e', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: { ...chartOptions, cutout: '75%' }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderActivityLogs();
    setTimeout(initSystemCharts, 150);
});
