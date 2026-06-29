/* ==================================================
   SETTINGS MODULE SCRIPTS
================================================== */

// DOM Elements
const settingTabs = document.querySelectorAll('.setting-tab');
const settingPanes = document.querySelectorAll('.settings-pane');
const API_URL = 'http://localhost:5000/api/settings';

// 1. Tab Switching Logic
settingTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        settingTabs.forEach(t => t.classList.remove('active'));
        settingPanes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-target')).classList.add('active');
    });
});

// Dynamic naming of inputs for easy serialization
function initializeFormNames() {
    const panes = document.querySelectorAll('.settings-pane');
    panes.forEach(pane => {
        const groupId = pane.id.replace('tab-', ''); // general, company, website, etc.
        const form = pane.querySelector('form.settings-form');
        if (!form) return;
        
        form.setAttribute('data-group', groupId);
        
        // Find all inputs, selects, textareas inside the form
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input, index) => {
            if (!input.name) {
                // Try to find the label
                let label = '';
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    const labelEl = formGroup.querySelector('label');
                    if (labelEl) label = labelEl.innerText.trim();
                }
                
                // If no label found, use fallback
                if (!label) {
                    const row = input.closest('.form-row');
                    if (row) {
                        const rowLabel = row.querySelector('label');
                        if (rowLabel) label = rowLabel.innerText.trim();
                    }
                }
                
                if (!label) label = `field_${index}`;
                
                // Slugify label
                const name = label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
                input.name = name;
            }
        });

        // Attach Save button listener
        // The save button is usually outside the form or inside it? 
        // In the HTML, it's inside the form at the bottom: <button type="button" class="btn btn-primary" onclick="openSaveModal()">Save</button>
        // We will intercept the openSaveModal or add our own click listener
        const saveBtn = form.querySelector('.btn-primary');
        if (saveBtn) {
            saveBtn.removeAttribute('onclick'); // Remove dummy modal
            saveBtn.addEventListener('click', async () => {
                await saveSettingsGroup(form, groupId);
            });
        }
    });
}

async function saveSettingsGroup(form, groupId) {
    const token = localStorage.getItem('token');
    
    // Collect data
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if(input.type === 'checkbox' || input.type === 'radio') {
            data[input.name] = input.checked;
        } else {
            data[input.name] = input.value;
        }
    });

    try {
        const saveBtn = form.querySelector('.btn-primary');
        const origText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const res = await fetch(`${API_URL}/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        saveBtn.innerHTML = origText;
        
        if (result.success) {
            // Show toast or temporary success message
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => { saveBtn.innerHTML = origText; }, 2000);
            fetchActivityLogs(); // Refresh logs
        } else {
            alert('Failed to save settings: ' + (result.message || 'Unknown error'));
        }
    } catch(err) {
        console.error(err);
        alert('Error saving settings');
    }
}

async function loadSettings() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if(result.success && result.data) {
            const settingsObj = result.data; // { general: {...}, company: {...} }
            
            // Populate forms
            const panes = document.querySelectorAll('.settings-pane');
            panes.forEach(pane => {
                const groupId = pane.id.replace('tab-', '');
                const form = pane.querySelector('form.settings-form');
                if(!form) return;
                
                const groupData = settingsObj[groupId];
                if(groupData) {
                    const inputs = form.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        if(groupData[input.name] !== undefined) {
                            if(input.type === 'checkbox' || input.type === 'radio') {
                                input.checked = groupData[input.name];
                            } else {
                                input.value = groupData[input.name];
                            }
                        }
                    });
                }
            });
        }
    } catch(err) {
        console.error('Error loading settings', err);
    }
}

// 2. Activity Logs Logic
async function fetchActivityLogs() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if(result.success) {
            renderActivityLogs(result.data);
        }
    } catch(err) {
        console.error('Error fetching logs', err);
    }
}

const renderActivityLogs = (logs) => {
    const tbody = document.getElementById('activityLogsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const badgeClass = log.status === 'Success' ? 'badge-active' : 'badge-failed';
        const tr = document.createElement('tr');
        
        // Format Date
        const dateOpts = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = new Date(log.created_at).toLocaleDateString('en-GB', dateOpts);
        
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td class="fw-bold">${log.user_id}</td>
            <td>${log.action}</td>
            <td>${log.module}</td>
            <td class="font-mono text-muted">${log.ip_address}</td>
            <td>${log.browser}</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td><button class="btn btn-outline btn-small" title="View Details"><i class="fas fa-ellipsis-v"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
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
document.addEventListener('DOMContentLoaded', async () => {
    initializeFormNames();
    await loadSettings();
    await fetchActivityLogs();
    setTimeout(initSystemCharts, 150);
});
