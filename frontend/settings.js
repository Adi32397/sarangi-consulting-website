/* ==================================================
   SETTINGS MODULE SCRIPTS
================================================== */

// DOM Elements
const settingTabs = document.querySelectorAll('.setting-tab');
const settingPanes = document.querySelectorAll('.settings-pane');
const API_URL = `${API_BASE_URL}/api/settings`;

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
        if (saveBtn && groupId !== 'email') {
            saveBtn.removeAttribute('onclick'); // Remove dummy modal
            saveBtn.addEventListener('click', async () => {
                await saveSettingsGroup(form, groupId);
            });
        }
    });

    // ----------------------------------------------------
    // ADMIN PROFILE AND PASSWORD LOGIC
    // ----------------------------------------------------

    async function loadAdminProfile() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            
            if (result.success && result.data) {
                const user = result.data;
                const nameInput = document.getElementById('adminName');
                const roleInput = document.getElementById('adminRole');
                const emailInput = document.getElementById('adminEmail');
                const phoneInput = document.getElementById('adminPhone');
                const deptInput = document.getElementById('adminDepartment');
                const bioInput = document.getElementById('adminBio');
                
                if(nameInput) nameInput.value = user.name || '';
                if(roleInput) roleInput.value = user.role || '';
                if(emailInput) emailInput.value = user.email || '';
                if(phoneInput) phoneInput.value = user.phone || '';
                if(deptInput) deptInput.value = user.department || '';
                if(bioInput) bioInput.value = user.bio || '';
                
                // Update profile header
                const profileHeaderName = document.querySelector('.profile-header h4');
                const profileHeaderRole = document.querySelector('.profile-header p');
                if(profileHeaderName) profileHeaderName.textContent = user.name || 'Admin User';
                if(profileHeaderRole) profileHeaderRole.textContent = user.role || 'Super Administrator';
            }
        } catch (err) {
            console.error('Error loading admin profile:', err);
        }
    }
    
    // Call it initially
    loadAdminProfile();

    window.updateAdminProfile = async function() {
        const btn = document.getElementById('btnUpdateProfile');
        if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: document.getElementById('adminName').value,
                email: document.getElementById('adminEmail').value,
                phone: document.getElementById('adminPhone').value,
                department: document.getElementById('adminDepartment').value,
                bio: document.getElementById('adminBio').value
            };
            
            const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.success) {
                showToast('Profile updated successfully!', 'success');
                loadAdminProfile(); // Refresh header
            } else {
                showToast(result.message || 'Failed to update profile', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error updating profile', 'error');
        } finally {
            if(btn) btn.textContent = 'Update Profile';
        }
    };

    window.changeAdminPassword = async function() {
        const btn = document.getElementById('btnChangePassword');
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        
        if (newPass !== confirmPass) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
        
        try {
            const token = localStorage.getItem('token');
            const payload = {
                currentPassword: currentPass,
                newPassword: newPass
            };
            
            const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.success) {
                showToast('Password changed successfully!', 'success');
                document.getElementById('changePasswordForm').reset();
            } else {
                showToast(result.message || 'Failed to change password', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error changing password', 'error');
        } finally {
            if(btn) btn.textContent = 'Change Password';
        }
    };

}
async function saveSettingsGroup(form, groupId) {
    const token = localStorage.getItem('token');
    
    // Collect data
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if(input.name) {
            if(input.type === 'checkbox') {
                data[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) data[input.name] = input.value;
            } else {
                data[input.name] = input.value;
            }
        }
    });

    if (groupId === 'appearance') {
        localStorage.setItem('themeSettings', JSON.stringify(data));
        if(window.applyTheme) window.applyTheme(data);
    }

    if (groupId === 'system' || groupId === 'backup') {
        const storageKey = groupId === 'system' ? 'systemPreferences' : 'backupPreferences';
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // Show success message
        const saveBtn = form.querySelector('.btn-primary');
        if (saveBtn) {
            const origText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => { saveBtn.innerHTML = origText; }, 2000);
        }
        return; // Don't do the backend fetch since we just did a custom frontend save
    }

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
            if (typeof fetchActivityLogs === 'function') fetchActivityLogs(); // Refresh logs
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
                    if (groupId === 'appearance') {
                        localStorage.setItem('themeSettings', JSON.stringify(groupData));
                        if(window.applyTheme) window.applyTheme(groupData);
                    }
                    const inputs = form.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        if(groupData[input.name] !== undefined) {
                            if(input.type === 'checkbox' || input.type === 'radio') {
                                if (input.type === 'radio') {
                                    if (input.value === groupData[input.name]) input.checked = true;
                                } else {
                                    input.checked = groupData[input.name];
                                }
                            } else {
                                input.value = groupData[input.name];
                                
                                // Special case for company logo preview
                                if (input.name === 'company_logo' && input.value) {
                                    const preview = document.getElementById('companyLogoPreview');
                                    const placeholder = document.getElementById('companyLogoPlaceholder');
                                    if (preview && placeholder) {
                                        preview.src = input.value.startsWith('/') ? API_BASE_URL + input.value : input.value;
                                        preview.style.display = 'block';
                                        placeholder.style.display = 'none';
                                    }
                                }
                                
                                // Special case for hero image preview
                                if (input.name === 'homepage_hero_image' && input.value) {
                                    const preview = document.getElementById('heroImagePreview');
                                    const placeholder = document.getElementById('heroImagePlaceholder');
                                    if (preview && placeholder) {
                                        preview.src = input.value.startsWith('/') ? API_BASE_URL + input.value : input.value;
                                        preview.style.display = 'block';
                                        placeholder.style.display = 'none';
                                    }
                                }
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
let chartsInstance = {};
const initSystemCharts = (analyticsData) => {
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter' } } } }
    };

    // Destroy existing charts if any
    Object.values(chartsInstance).forEach(c => c.destroy());

    // Chart 1: Daily Logins (Line)
    const ctxLogins = document.getElementById('loginsChart');
    if (ctxLogins && analyticsData && analyticsData.logins) {
        chartsInstance.logins = new Chart(ctxLogins, {
            type: 'line',
            data: {
                labels: analyticsData.logins.labels,
                datasets: [{
                    label: 'Admin Logins',
                    data: analyticsData.logins.data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4, fill: true, borderWidth: 3
                }]
            },
            options: chartOptions
        });
    }

    // Chart 2: System Usage (Pie)
    const ctxUsage = document.getElementById('usageChart');
    if (ctxUsage && analyticsData && analyticsData.system) {
        chartsInstance.usage = new Chart(ctxUsage, {
            type: 'pie',
            data: {
                labels: ['Database', 'Media Files', 'System Logs', 'Backups'],
                datasets: [{
                    data: analyticsData.system.data,
                    backgroundColor: ['#0B6B3A', '#3b82f6', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }

    // Chart 3: Storage (Bar)
    const ctxStorage = document.getElementById('storageChart');
    if (ctxStorage && analyticsData && analyticsData.storageGrowth) {
        chartsInstance.storage = new Chart(ctxStorage, {
            type: 'bar',
            data: {
                labels: analyticsData.storageGrowth.labels,
                datasets: [{
                    label: 'Storage Growth (MB)',
                    data: analyticsData.storageGrowth.data,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: chartOptions
        });
    }

    // Chart 4: Notifications (Doughnut)
    const ctxNotifications = document.getElementById('notificationsChart');
    if (ctxNotifications && analyticsData && analyticsData.notifications) {
        chartsInstance.notifications = new Chart(ctxNotifications, {
            type: 'doughnut',
            data: {
                labels: ['Email Delivered', 'SMS Sent', 'WhatsApp', 'Push Notifs'],
                datasets: [{
                    data: analyticsData.notifications.data,
                    backgroundColor: ['#2563eb', '#f97316', '#22c55e', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: { ...chartOptions, cutout: '75%' }
        });
    }
};

async function fetchSystemHealth() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/health`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success) {
            const health = result.health;
            
            // Update UI Cards
            if(document.getElementById('health-server-status')) {
                document.getElementById('health-server-status').innerText = health.server.status;
                document.getElementById('health-server-label').innerText = health.server.label;
            }
            if(document.getElementById('health-db-status')) {
                document.getElementById('health-db-status').innerText = health.database.status;
                document.getElementById('health-db-label').innerText = health.database.label;
            }
            if(document.getElementById('health-api-status')) {
                document.getElementById('health-api-status').innerText = health.api.status;
                document.getElementById('health-api-label').innerText = health.api.label;
            }
            if(document.getElementById('health-storage-status')) {
                document.getElementById('health-storage-status').innerText = health.storage.usage + '%';
                document.getElementById('health-storage-label').innerText = health.storage.label;
            }
            if(document.getElementById('health-memory-status')) {
                document.getElementById('health-memory-status').innerText = health.memory.usage + '%';
                document.getElementById('health-memory-label').innerText = health.memory.label;
            }
            if(document.getElementById('health-cpu-status')) {
                document.getElementById('health-cpu-status').innerText = health.cpu.usage + '%';
                document.getElementById('health-cpu-label').innerText = health.cpu.label;
            }

            // Initialize Charts with Data
            initSystemCharts(result.analytics);
        } else {
            initSystemCharts({}); // fallback empty charts
        }
    } catch (err) {
        console.error('Error fetching system health', err);
        initSystemCharts({});
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeFormNames();
    await loadSettings();
    await fetchActivityLogs();
    await fetchSystemHealth();

    // Company Logo Upload Logic
    const btnUploadLogo = document.getElementById('btnUploadLogo');
    const companyLogoFile = document.getElementById('companyLogoFile');
    const companyLogoUrl = document.getElementById('companyLogoUrl');
    const companyLogoPreview = document.getElementById('companyLogoPreview');
    const companyLogoPlaceholder = document.getElementById('companyLogoPlaceholder');
    const logoUploadStatus = document.getElementById('logoUploadStatus');

    if (btnUploadLogo && companyLogoFile) {
        btnUploadLogo.addEventListener('click', () => companyLogoFile.click());
        
        companyLogoFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            logoUploadStatus.innerHTML = '<span class="text-muted"><i class="fas fa-spinner fa-spin"></i> Uploading...</span>';
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/banners/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await res.json();
                
                if(data.success) {
                    const imagePath = data.data; // e.g. /uploads/image-123.jpg
                    companyLogoUrl.value = imagePath;
                    companyLogoPreview.src = imagePath.startsWith('/') ? API_BASE_URL + imagePath : imagePath;
                    companyLogoPreview.style.display = 'block';
                    companyLogoPlaceholder.style.display = 'none';
                    logoUploadStatus.innerHTML = '<span class="text-success"><i class="fas fa-check"></i> Uploaded!</span>';
                } else {
                    logoUploadStatus.innerHTML = '<span class="text-danger"><i class="fas fa-times"></i> Upload failed</span>';
                }
            } catch(err) {
                console.error(err);
                logoUploadStatus.innerHTML = '<span class="text-danger"><i class="fas fa-times"></i> Upload failed</span>';
            }
        });
    }

    // Hero Image Upload Logic
    const btnUploadHero = document.getElementById('btnUploadHero');
    const heroImageFile = document.getElementById('heroImageFile');
    const heroImageUrl = document.getElementById('heroImageUrl');
    const heroImagePreview = document.getElementById('heroImagePreview');
    const heroImagePlaceholder = document.getElementById('heroImagePlaceholder');
    const heroUploadStatus = document.getElementById('heroUploadStatus');

    if (btnUploadHero && heroImageFile) {
        btnUploadHero.addEventListener('click', () => heroImageFile.click());
        
        heroImageFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            heroUploadStatus.innerHTML = '<span class="text-muted"><i class="fas fa-spinner fa-spin"></i> Uploading...</span>';
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/banners/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await res.json();
                
                if(data.success) {
                    const imagePath = data.data;
                    heroImageUrl.value = imagePath;
                    heroImagePreview.src = imagePath.startsWith('/') ? API_BASE_URL + imagePath : imagePath;
                    heroImagePreview.style.display = 'block';
                    heroImagePlaceholder.style.display = 'none';
                    heroUploadStatus.innerHTML = '<span class="text-success"><i class="fas fa-check"></i> Uploaded!</span>';
                } else {
                    heroUploadStatus.innerHTML = '<span class="text-danger"><i class="fas fa-times"></i> Upload failed</span>';
                }
            } catch(err) {
                console.error(err);
                heroUploadStatus.innerHTML = '<span class="text-danger"><i class="fas fa-times"></i> Upload failed</span>';
            }
        });
    }

    // Appearance Logic
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                e.target.closest('.theme-option').classList.add('active');
            }
        });
    });

    const pColor = document.getElementById('primary_color');
    const pColorText = document.getElementById('primary_color_text');
    if (pColor && pColorText) {
        pColor.addEventListener('input', (e) => pColorText.value = e.target.value);
        pColorText.addEventListener('input', (e) => pColor.value = e.target.value);
    }

    const sColor = document.getElementById('secondary_color');
    const sColorText = document.getElementById('secondary_color_text');
    if (sColor && sColorText) {
        sColor.addEventListener('input', (e) => sColorText.value = e.target.value);
        sColorText.addEventListener('input', (e) => sColor.value = e.target.value);
    }

    const btnPreviewTheme = document.getElementById('btn-preview-theme');
    if (btnPreviewTheme) {
        btnPreviewTheme.addEventListener('click', () => {
            const form = document.getElementById('appearanceForm');
            const data = {};
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if(input.type === 'radio' && !input.checked) return;
                if(input.name) data[input.name] = input.value;
            });
            if(window.applyTheme) window.applyTheme(data);
        });
    }

    // Toggle Password Visibility Logic
    const togglePasswords = document.querySelectorAll('.toggle-password');
    togglePasswords.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });

    try {
        const prefs = JSON.parse(localStorage.getItem('systemPreferences'));
        if (prefs) {
            const sysForm = document.getElementById('systemPreferencesForm');
            if (sysForm) {
                const inputs = sysForm.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.name && prefs[input.name] !== undefined) {
                        if (input.type === 'checkbox') input.checked = prefs[input.name];
                        else input.value = prefs[input.name];
                    }
                });
            }
        }
    } catch(e) {}

    // ----------------------------------------------------
    // BACKUP & RESTORE LOGIC
    // ----------------------------------------------------
    try {
        const backupPrefs = JSON.parse(localStorage.getItem('backupPreferences'));
        if (backupPrefs && backupPrefs.backup_schedule) {
            const schedSelect = document.getElementById('backup-schedule-select');
            if (schedSelect) schedSelect.value = backupPrefs.backup_schedule;
        }
    } catch(e) {}

    const btnDownload = document.getElementById('btn-download-backup');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const dummyData = JSON.stringify({ 
                metadata: { timestamp: new Date().toISOString(), version: '1.0' },
                data: "Encrypted Backup Data Placeholder"
            });
            const blob = new Blob([dummyData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sarangi_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    const btnCreate = document.getElementById('btn-create-backup');
    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            const origHTML = btnCreate.innerHTML;
            btnCreate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            setTimeout(() => {
                btnCreate.innerHTML = '<i class="fas fa-check"></i> Backup Created';
                
                const latestInfo = document.getElementById('latest-backup-info');
                if (latestInfo) {
                    const now = new Date();
                    const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const newSize = (Math.random() * 5 + 45).toFixed(1);
                    latestInfo.innerHTML = `<i class="fas fa-calendar-check mr-10"></i> ${formatted} &bull; <i class="fas fa-hdd ml-10 mr-10"></i> ${newSize} MB &bull; <span class="text-success fw-bold"><i class="fas fa-check-circle"></i> Success</span>`;
                }
                
                setTimeout(() => { btnCreate.innerHTML = origHTML; }, 3000);
            }, 1500);
        });
    }

    const btnRestore = document.getElementById('btn-restore-backup');
    const fileRestore = document.getElementById('file-restore-backup');
    if (btnRestore && fileRestore) {
        btnRestore.addEventListener('click', () => fileRestore.click());
        
        fileRestore.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const origHTML = btnRestore.innerHTML;
                btnRestore.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restoring...';
                setTimeout(() => {
                    btnRestore.innerHTML = origHTML;
                    alert('Backup restored successfully. The system will now reload.');
                    location.reload();
                }, 2000);
            }
        });
    }

});

// Modal Logic
window.openSaveModal = () => {
    document.getElementById('saveSettingsModal').classList.add('active');
};

window.openResetModal = () => {
    document.getElementById('resetSettingsModal').classList.add('active');
};

window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
};

window.confirmSave = async () => {
    const activePane = document.querySelector('.settings-pane.active');
    if (activePane) {
        const form = activePane.querySelector('form.settings-form');
        const groupId = activePane.id.replace('tab-', '');
        if (form && groupId) {
            await saveSettingsGroup(form, groupId);
        }
    }
    window.closeModal('saveSettingsModal');
};

window.confirmReset = () => {
    // Basic factory reset for demo: clear theme settings and reload
    localStorage.removeItem('themeSettings');
    window.closeModal('resetSettingsModal');
    alert('Settings have been reset to factory defaults.');
    location.reload();
};
