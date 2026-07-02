/* ==================================================
   LEADS & CONTACTS MODULE SCRIPTS (PREMIUM)
================================================== */

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token') || '';

// Modal Management
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

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// Chart Instances to destroy before re-rendering
let charts = {};

function setupCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAll');
    if (!selectAllCheckbox) return;

    selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        rowCheckboxes.forEach(cb => {
            cb.checked = isChecked;
            const row = cb.closest('tr');
            if (isChecked) {
                row.style.backgroundColor = 'rgba(11, 107, 58, 0.04)';
            } else {
                row.style.backgroundColor = '';
            }
        });
    });
}

function attachCheckboxListeners() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const row = cb.closest('tr');
            if (cb.checked) {
                row.style.backgroundColor = 'rgba(11, 107, 58, 0.04)';
            } else {
                row.style.backgroundColor = '';
            }
            if(selectAllCheckbox) {
                const allChecked = Array.from(rowCheckboxes).every(c => c.checked);
                const someChecked = Array.from(rowCheckboxes).some(c => c.checked);
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            }
        });
    });
}

let debounceTimer;
function handleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchLeads();
    }, 400);
}

document.addEventListener('DOMContentLoaded', () => {
    setupCheckboxes();
    fetchLeads();
    fetchAnalytics();
    fetchConsultants();
    
    // Set up filter event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    
    const filters = ['statusFilter', 'serviceFilter', 'priorityFilter', 'dateFilter'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', fetchLeads);
    });
    
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            filters.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            fetchLeads();
        });
    }
});

// Fetch Leads
async function fetchLeads() {
    try {
        let url = new URL(`${API_URL}/leads`);
        
        // Append Search
        const searchVal = document.getElementById('searchInput')?.value;
        if (searchVal) url.searchParams.append('search', searchVal);
        
        // Append Status
        const statusVal = document.getElementById('statusFilter')?.value;
        if (statusVal) url.searchParams.append('status', statusVal);
        
        // Append Service
        const serviceVal = document.getElementById('serviceFilter')?.value;
        if (serviceVal) url.searchParams.append('serviceInterested', serviceVal);
        
        // Append Priority
        const priorityVal = document.getElementById('priorityFilter')?.value;
        if (priorityVal) url.searchParams.append('priority', priorityVal);
        
        // Append Date Filter (calculate start/end dates if needed)
        const dateVal = document.getElementById('dateFilter')?.value;
        if (dateVal && dateVal !== '') {
            const today = new Date();
            let start, end;
            if (dateVal === 'Today') {
                start = new Date(today.setHours(0,0,0,0));
                end = new Date(today.setHours(23,59,59,999));
            } else if (dateVal === 'Yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                start = new Date(yesterday.setHours(0,0,0,0));
                end = new Date(yesterday.setHours(23,59,59,999));
            } else if (dateVal === 'This Week') {
                const first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
                start = new Date(today.setDate(first));
                start.setHours(0,0,0,0);
                end = new Date();
            } else if (dateVal === 'This Month') {
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            }
            if (start && end) {
                url.searchParams.append('startDate', start.toISOString());
                url.searchParams.append('endDate', end.toISOString());
            }
        }

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            window.currentLeadsData = json.data;
            renderLeadsTable(json.data);
            document.querySelector('.pagination-info').innerText = `Showing 1–${json.data.length} of ${json.total} Leads`;
        }
    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}

function renderLeadsTable(leads) {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if(leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" class="text-center p-20">No leads found.</td></tr>';
        return;
    }

    leads.forEach(lead => {
        const priorityBadge = lead.priority.toLowerCase();
        const statusBadge = lead.status.toLowerCase().replace(' ', '-');
        const assignedName = lead.assignedConsultant ? lead.assignedConsultant : 'Unassigned';
        const initial = assignedName !== 'Unassigned' && assignedName ? assignedName.charAt(0) : '?';
        const createdDate = new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const lastFollowup = lead.communicationHistory && lead.communicationHistory.length > 0 
            ? new Date(lead.communicationHistory[lead.communicationHistory.length-1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" value="${lead.id}"></td>
            <td class="lead-id">${lead.leadId}</td>
            <td class="fw-bold">${lead.customerName}</td>
            <td>${lead.company || '-'}</td>
            <td>
                <div class="contact-info">
                    <span><i class="fas fa-envelope"></i> ${lead.email || '-'}</span>
                    <span><i class="fas fa-phone"></i> ${lead.phone}</span>
                </div>
            </td>
            <td>${lead.serviceInterested}</td>
            <td>${lead.leadSource}</td>
            <td><div class="avatar-sm">${initial}</div> ${assignedName}</td>
            <td><span class="badge badge-priority badge-${priorityBadge}">${lead.priority}</span></td>
            <td><span class="badge badge-status badge-${statusBadge}">${lead.status}</span></td>
            <td>${createdDate}</td>
            <td>${lastFollowup}</td>
            <td class="action-cell">
                <div class="action-buttons">
                    <button class="icon-btn" title="View" onclick="viewLead('${lead.id}')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn" title="Edit" onclick="editLead('${lead.id}')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn icon-danger" title="Delete" onclick="deleteLeadConfirm('${lead.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    attachCheckboxListeners();
}

async function fetchAnalytics() {
    try {
        const [dashRes, analyticRes] = await Promise.all([
            fetch(`${API_URL}/leads/stats/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/leads/stats/analytics`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const dashData = await dashRes.json();
        const analyticData = await analyticRes.json();

        if (dashData.success) {
            updateDashboardCards(dashData.data);
        }
        if (analyticData.success) {
            renderCharts(analyticData.data);
        }
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
}

function updateDashboardCards(stats) {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 6) {
        statValues[0].innerText = stats.totalLeads || 0;
        statValues[1].innerText = stats.newLeads || 0;
        statValues[2].innerText = stats.contactedLeads || 0; 
        statValues[3].innerText = stats.qualifiedLeads || 0;
        statValues[4].innerText = stats.wonLeads || 0;
        statValues[5].innerText = stats.lostLeads || 0;
    }
}

async function fetchConsultants() {
    try {
        const res = await fetch(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            const addSelect = document.getElementById('addAssignedTo');
            const editSelect = document.getElementById('editAssignedTo');
            
            let optionsHTML = '<option value="">-- Unassigned --</option>';
            const defaultConsultants = ['samuel', 'aditya', 'priya'];
            const seenNames = new Set();
            json.data.forEach(user => {
                const name = user.name.trim();
                const isConsultant = user.role !== 'Viewer' || defaultConsultants.includes(name.toLowerCase());
                const isExcluded = user.role === 'Admin' || user.role === 'Super Admin' || name.toLowerCase() === 'admin' || name.toLowerCase() === 'super admin';
                if (isConsultant && !isExcluded && !seenNames.has(name.toLowerCase())) {
                    seenNames.add(name.toLowerCase());
                    optionsHTML += `<option value="${name}">${name}</option>`;
                }
            });
            
            if (addSelect) addSelect.innerHTML = optionsHTML;
            if (editSelect) editSelect.innerHTML = optionsHTML;
        }
    } catch (error) {
        console.error('Error fetching consultants:', error);
    }
}


function renderCharts(analytics) {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';
    Chart.defaults.scale.grid.color = 'rgba(226, 232, 240, 0.8)';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.titleFont = { size: 13, family: "'Montserrat', sans-serif", weight: 'bold' };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = false;

    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    // Monthly Leads
    const ctxMonthElement = document.getElementById('leadsMonthChart');
    if (ctxMonthElement) {
        const ctxMonth = ctxMonthElement.getContext('2d');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let labels = [];
        let data = [];
        if(analytics.monthlyLeads && analytics.monthlyLeads.length > 0) {
            analytics.monthlyLeads.forEach(item => {
                labels.push(`${months[item._id.month - 1]} ${item._id.year}`);
                data.push(item.count);
            });
        } else {
            labels = ['Jan', 'Feb', 'Mar'];
            data = [0, 0, 0];
        }

        if(charts.month) charts.month.destroy();
        charts.month = new Chart(ctxMonth, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Leads',
                    data: data,
                    backgroundColor: createGradient(ctxMonth, '#0B6B3A', '#22c55e'),
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }
            }
        });
    }

    // Lead Sources
    const ctxSourceElement = document.getElementById('leadsSourceChart');
    if (ctxSourceElement) {
        let labels = analytics.bySource.map(item => item._id || 'Unknown');
        let data = analytics.bySource.map(item => item.count);
        if(labels.length === 0) { labels = ['None']; data = [1]; }

        if(charts.source) charts.source.destroy();
        charts.source = new Chart(ctxSourceElement, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{ data: data, backgroundColor: ['#0B6B3A', '#0ea5e9', '#22c55e', '#6366f1', '#f59e0b'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '40%', plugins: { legend: { position: 'right', labels: { usePointStyle: true } } } }
        });
    }

    // Lead Status
    const ctxStatusElement = document.getElementById('leadsStatusChart');
    if (ctxStatusElement) {
        let labels = analytics.byStatus.map(item => item._id || 'Unknown');
        let data = analytics.byStatus.map(item => item.count);
        if(labels.length === 0) { labels = ['None']; data = [1]; }

        if(charts.status) charts.status.destroy();
        charts.status = new Chart(ctxStatusElement, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{ data: data, backgroundColor: ['#3b82f6', '#eab308', '#f97316', '#a855f7', '#6366f1', '#10b981', '#ef4444'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { usePointStyle: true } } } }
        });
    }

    // Lead Funnel
    const ctxFunnelElement = document.getElementById('leadsFunnelChart');
    if (ctxFunnelElement) {
        const funnelOrder = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won'];
        let data = funnelOrder.map(status => {
            const item = analytics.byStatus.find(s => s._id === status);
            return item ? item.count : 0;
        });

        if(charts.funnel) charts.funnel.destroy();
        charts.funnel = new Chart(ctxFunnelElement, {
            type: 'bar',
            data: {
                labels: funnelOrder,
                datasets: [{
                    label: 'Leads',
                    data: data,
                    backgroundColor: ['#3b82f6', '#eab308', '#f97316', '#a855f7', '#10b981'],
                    borderRadius: 4
                }]
            },
            options: { 
                indexAxis: 'y', 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                    x: { beginAtZero: true, grid: { display: false } },
                    y: { grid: { display: false }, border: { display: false } }
                }
            }
        });
    }

    // Top Services
    const ctxServicesElement = document.getElementById('servicesChart');
    if (ctxServicesElement) {
        const allServicesList = [
            "AI & Automation", "Business Consulting", "Business Registration", 
            "Change Management", "Cloud Solutions", "Compliance", 
            "Customer Experience Consulting", "Data Analytics", 
            "Digital Transformation", "ESG & Sustainability", 
            "Essential Startup Documents", "Financial Advisory", 
            "Funding Support", "GST", "Human Resources", "IT Consulting", 
            "Legal Consultation", "License and Certificate", 
            "Marketing & Growth Consulting", "MSME Registration", 
            "Operations Consulting", "Organization & Leadership", 
            "Policy Making", "Software Development", "Startup Advisory", 
            "Strategy & Growth Consulting", "Tax Consultation", 
            "Trademark", "Web Development", "Other"
        ];
        
        let labels = [...allServicesList];
        let data = new Array(allServicesList.length).fill(0);

        if (analytics.byService && analytics.byService.length > 0) {
            analytics.byService.forEach(item => {
                const serviceName = item._id || 'Unknown';
                const index = allServicesList.indexOf(serviceName);
                if (index !== -1) {
                    data[index] = item.count;
                } else {
                    labels.push(serviceName);
                    data.push(item.count);
                }
            });
        }

        if(charts.services) charts.services.destroy();
        charts.services = new Chart(ctxServicesElement, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Requests',
                    data: data,
                    backgroundColor: '#0ea5e9',
                    borderRadius: 4
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, border: { display: false } }, 
                    x: { grid: { display: false }, border: { display: false } } 
                }
            }
        });
    }
}

// Action Stubs
window.viewLead = (id) => { console.log('View Lead', id); openModal('viewLeadModal'); };
window.editLead = (id) => { console.log('Edit Lead', id); openModal('editLeadModal'); };
window.deleteLeadConfirm = (id) => { console.log('Delete Lead', id); openModal('deleteLeadModal'); };

// Form Submissions
document.addEventListener('DOMContentLoaded', () => {
    const saveLeadBtn = document.getElementById('saveLeadBtn');
    if (saveLeadBtn) {
        saveLeadBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const form = document.getElementById('addLeadForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const payload = {
                customerName: document.getElementById('addCustomerName').value,
                company: document.getElementById('addCompany').value,
                email: document.getElementById('addEmail').value,
                phone: document.getElementById('addPhone').value,
                serviceInterested: document.getElementById('addServiceInterested').value,
                leadSource: document.getElementById('addLeadSource').value,
                priority: document.getElementById('addPriority').value,
                status: document.getElementById('addStatus').value,
                message: document.getElementById('addMessage').value + 
                    (document.getElementById('addInternalNotes').value.trim() ? '\n\n---\nInternal Notes: ' + document.getElementById('addInternalNotes').value : '')
            };

            const assignedTo = document.getElementById('addAssignedTo');
            if (assignedTo && assignedTo.value) {
                payload.assignedConsultant = assignedTo.value;
            }

            try {
                const res = await fetch(`${API_URL}/leads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const json = await res.json();
                if (json.success) {
                    closeModal('addLeadModal');
                    form.reset();
                    // Refresh data
                    fetchLeads();
                    fetchAnalytics();
                    fetchConsultants();
                } else {
                    alert('Error adding lead: ' + (json.message || JSON.stringify(json.errors)));
                }
            } catch (error) {
                console.error('Error saving lead:', error);
                alert('Failed to save lead. Check console.');
            }
        });
    }
});

// EXPORT LEADS
async function exportLeads(format) {
    const selectedIds = getSelectedLeadIds();
    const payload = { ids: selectedIds };

    try {
        const res = await fetch(`${API_URL}/exports/leads/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert(`Failed to export ${format}`);
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let ext = format;
        if (format === 'excel') ext = 'xlsx';
        a.download = `leads_export_${Date.now()}.${ext}`;
        
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Error exporting ${format}:`, error);
        alert(`Error exporting to ${format}`);
    }
}

function getSelectedLeadIds() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

let pendingDeleteIds = [];

window.deleteSelectedLeads = () => {
    const ids = getSelectedLeadIds();
    if (ids.length === 0) return alert('Please select at least one lead.');
    
    pendingDeleteIds = ids;
    const modal = document.getElementById('deleteLeadModal');
    if (modal) {
        modal.querySelector('h3').innerText = `Delete ${ids.length} Leads?`;
        modal.classList.add('active');
        
        // Ensure we remove old event listeners to prevent double firing
        const deleteBtn = modal.querySelector('.btn-danger');
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.addEventListener('click', async () => {
            closeModal('deleteLeadModal');
            await executeBulkDelete(pendingDeleteIds);
        });
    } else {
        if (confirm(`Are you sure you want to delete ${ids.length} selected leads?`)) {
            executeBulkDelete(ids);
        }
    }
};

window.deleteLeadConfirm = (id) => {
    pendingDeleteIds = [id];
    const modal = document.getElementById('deleteLeadModal');
    if (modal) {
        modal.querySelector('h3').innerText = `Delete Lead?`;
        modal.classList.add('active');
        
        const deleteBtn = modal.querySelector('.btn-danger');
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.addEventListener('click', async () => {
            closeModal('deleteLeadModal');
            await executeBulkDelete(pendingDeleteIds);
        });
    } else {
        if (confirm(`Are you sure you want to delete this lead?`)) {
            executeBulkDelete([id]);
        }
    }
};

async function executeBulkDelete(ids) {
    try {
        const res = await fetch(`${API_URL}/leads/bulk/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids })
        });
        const json = await res.json();
        if (json.success) {
            alert(json.message || 'Leads deleted successfully');
            fetchLeads();
            const sa = document.getElementById('selectAll');
            if(sa) sa.checked = false;
        } else {
            alert('Failed to delete leads: ' + (json.message || ''));
        }
    } catch (error) {
        console.error('Error deleting leads:', error);
        alert('Failed to delete leads. Check console.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const selectAll = document.getElementById('selectAll');
    if(selectAll) {
        selectAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }
});

window.bulkAssignConsultant = async () => {
    const ids = getSelectedLeadIds();
    if (ids.length === 0) return alert('Please select at least one lead.');
    const consultantName = prompt('Enter Consultant Name to assign (e.g. Samuel, Aditya, Priya, Admin):');
    if (!consultantName) return;

    try {
        const res = await fetch(`${API_URL}/leads/bulk/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ids, consultantName })
        });
        const json = await res.json();
        if (json.success) {
            alert('Consultant assigned successfully');
            fetchLeads();
        } else {
            alert('Failed: ' + json.message);
        }
    } catch (e) {
        console.error(e);
        alert('Error assigning consultant');
    }
};

window.bulkChangeStatus = async () => {
    const ids = getSelectedLeadIds();
    if (ids.length === 0) return alert('Please select at least one lead.');
    const status = prompt('Enter new status (New, Contacted, Qualified, Proposal Sent, Won, Lost):');
    if (!status) return;

    try {
        const res = await fetch(`${API_URL}/leads/bulk/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ids, status })
        });
        const json = await res.json();
        if (json.success) {
            alert('Status updated successfully');
            fetchLeads();
        } else {
            alert('Failed: ' + json.message);
        }
    } catch (e) {
        console.error(e);
        alert('Error updating status');
    }
};

window.viewLead = async (id) => {
    try {
        const res = await fetch(`${API_URL}/leads/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            const lead = json.data;
            document.getElementById('viewLeadTitle').innerText = `Lead Details - ${lead.leadId}`;
            document.getElementById('viewLeadId').value = lead.id;
            document.getElementById('viewCustomerName').innerText = lead.customerName || '-';
            document.getElementById('viewCompany').innerText = lead.company || '-';
            
            const emailEl = document.getElementById('viewEmail');
            emailEl.innerText = lead.email || '-';
            emailEl.href = `mailto:${lead.email || ''}`;
            
            const phoneEl = document.getElementById('viewPhone');
            phoneEl.innerText = lead.phone || '-';
            phoneEl.href = `tel:${lead.phone || ''}`;
            
            document.getElementById('viewServiceInterested').innerText = lead.serviceInterested || '-';
            document.getElementById('viewLeadSource').innerText = lead.leadSource || '-';
            document.getElementById('viewAssignedTo').innerText = lead.assignedConsultant ? lead.assignedConsultant : 'Unassigned';
            
            const priorityEl = document.getElementById('viewPriority');
            priorityEl.innerText = lead.priority;
            priorityEl.className = `badge badge-priority badge-${lead.priority.toLowerCase()}`;
            
            const statusEl = document.getElementById('viewStatus');
            statusEl.innerText = lead.status;
            statusEl.className = `badge badge-status badge-${lead.status.toLowerCase().replace(' ', '-')}`;
            
            document.getElementById('viewCreatedDate').innerText = new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // Render Timeline (Basic placeholder if empty)
            const timelineEl = document.getElementById('viewTimeline');
            timelineEl.innerHTML = '';
            if (lead.communicationHistory && lead.communicationHistory.length > 0) {
                lead.communicationHistory.forEach(hist => {
                    timelineEl.innerHTML += `
                        <div class="timeline-item">
                            <div class="timeline-date">${new Date(hist.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                            <div class="timeline-dot bg-blue"></div>
                            <div class="timeline-content">
                                <strong>${hist.type || 'Communication'}</strong>
                                <p>${hist.notes}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                timelineEl.innerHTML = '<p class="text-muted">No communication history.</p>';
            }
            
            // Wait for DOM updates then open modal
            setTimeout(() => {
                openModal('viewLeadModal');
            }, 10);
        } else {
            alert('Failed to load lead details');
        }
    } catch (error) {
        console.error('Error loading lead:', error);
        alert('Error loading lead details');
    }
};

window.editLead = async (id) => {
    try {
        const res = await fetch(`${API_URL}/leads/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            const lead = json.data;
            document.getElementById('editLeadTitle').innerText = `Edit Lead - ${lead.leadId}`;
            document.getElementById('editLeadId').value = lead.id;
            document.getElementById('editCustomerName').value = lead.customerName || '';
            document.getElementById('editCompany').value = lead.company || '';
            document.getElementById('editEmail').value = lead.email || '';
            document.getElementById('editPhone').value = lead.phone || '';
            document.getElementById('editServiceInterested').value = lead.serviceInterested || 'Startup Advisory';
            document.getElementById('editStatus').value = lead.status || 'New';
            document.getElementById('editPriority').value = lead.priority || 'Medium';
            const editAssignedTo = document.getElementById('editAssignedTo');
            if (editAssignedTo) {
                editAssignedTo.value = lead.assignedConsultant ? (lead.assignedConsultant.id || lead.assignedConsultant) : '';
            }
            
            // Wait for DOM updates then open modal
            setTimeout(() => {
                openModal('editLeadModal');
            }, 10);
        } else {
            alert('Failed to load lead details');
        }
    } catch (error) {
        console.error('Error loading lead:', error);
        alert('Error loading lead details');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveEditLeadBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const id = document.getElementById('editLeadId').value;
            const updatedData = {
                customerName: document.getElementById('editCustomerName').value,
                company: document.getElementById('editCompany').value,
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                serviceInterested: document.getElementById('editServiceInterested').value,
                status: document.getElementById('editStatus').value,
                priority: document.getElementById('editPriority').value
            };
            const editAssignedTo = document.getElementById('editAssignedTo');
            if (editAssignedTo && editAssignedTo.value) {
                updatedData.assignedConsultant = editAssignedTo.value;
            } else {
                updatedData.assignedConsultant = null; // Unassigned
            }

            try {
                const res = await fetch(`${API_URL}/leads/${id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(updatedData)
                });
                const json = await res.json();
                
                if (json.success) {
                    closeModal('editLeadModal');
                    fetchLeads(); // refresh the table
                } else {
                    alert('Failed to update lead: ' + (json.message || ''));
                }
            } catch (error) {
                console.error('Error updating lead:', error);
                alert('Error saving lead details');
            }
        });
    }
});

window.addCommunication = async () => {
    const id = document.getElementById('viewLeadId').value;
    const type = document.getElementById('commType').value;
    const notes = document.getElementById('commNotes').value;
    
    if (!notes.trim()) {
        alert('Please enter some notes for the communication.');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/leads/${id}/followup`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ type, notes })
        });
        const json = await res.json();
        
        if (json.success) {
            document.getElementById('commNotes').value = '';
            viewLead(id); // Refresh the view
        } else {
            alert('Failed to add communication: ' + (json.message || ''));
        }
    } catch (error) {
        console.error('Error adding communication:', error);
        alert('Error saving communication');
    }
};

window.sendBulkEmail = () => {
    const ids = getSelectedLeadIds();
    if (ids.length === 0) return alert('Please select at least one lead to email.');
    
    if (!window.currentLeadsData) return alert('Data not loaded. Please refresh the page.');
    
    const selectedLeads = window.currentLeadsData.filter(l => ids.includes(l.id));
    const emails = selectedLeads.map(l => l.email).filter(e => e && e.trim() !== '' && e !== '-');
    
    if (emails.length === 0) {
        return alert('No valid email addresses found in the selected leads.');
    }
    
    // Create mailto link with bcc to hide emails from each other
    const mailtoLink = `mailto:?bcc=${emails.join(',')}`;
    window.location.href = mailtoLink;
};

window.handleImportCSV = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);
        if (rows.length < 2) {
            alert('Invalid CSV format. Need at least a header row and one data row.');
            return;
        }

        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
        let successCount = 0;
        let failCount = 0;

        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const lead = {};
            
            headers.forEach((header, index) => {
                if (header.includes('name')) lead.customerName = values[index];
                else if (header.includes('company')) lead.company = values[index];
                else if (header.includes('email')) lead.email = values[index];
                else if (header.includes('phone')) lead.phone = values[index];
                else if (header.includes('service')) lead.serviceInterested = values[index] || 'Startup Advisory';
                else if (header.includes('source')) lead.leadSource = values[index] || 'Website';
                else if (header.includes('priority')) lead.priority = values[index] || 'Medium';
                else if (header.includes('status')) lead.status = values[index] || 'New';
                else if (header.includes('consultant') || header.includes('assigned')) lead.assignedConsultant = values[index];
            });

            if (lead.customerName && (lead.phone || lead.email)) {
                try {
                    const res = await fetch(`${API_URL}/leads`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(lead)
                    });
                    const json = await res.json();
                    if (json.success) successCount++;
                    else failCount++;
                } catch (err) {
                    failCount++;
                }
            } else {
                failCount++;
            }
        }
        
        alert(`Import Complete!\nSuccessfully imported: ${successCount}\nFailed: ${failCount}`);
        event.target.value = ''; // Reset input
        fetchLeads();
        fetchAnalytics();
    };
    reader.readAsText(file);
};

window.exportLeads = async function(format) {
    const token = localStorage.getItem('token') || '';
    const checkboxes = document.querySelectorAll('.lead-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.value);
    
    try {
        const response = await fetch(`${API_URL}/exports/leads/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids: ids })
        });
        
        if (!response.ok) throw new Error('Export failed. Check backend console for details.');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let ext = format;
        if(format === 'excel') ext = 'xlsx';
        a.download = `leads_export_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting leads:', error);
        alert('Failed to export leads. ' + error.message);
    }
};


window.fetchDashboardStats = async function() {
    try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/leads/stats/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            const data = json.data;
            if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = data.totalLeads;
            if(document.getElementById('stat-new')) document.getElementById('stat-new').innerText = data.newLeads;
            if(document.getElementById('stat-contacted')) document.getElementById('stat-contacted').innerText = data.contactedLeads;
            if(document.getElementById('stat-qualified')) document.getElementById('stat-qualified').innerText = data.qualifiedLeads;
            if(document.getElementById('stat-won')) document.getElementById('stat-won').innerText = data.wonLeads;
            if(document.getElementById('stat-lost')) document.getElementById('stat-lost').innerText = data.lostLeads;
        }
    } catch (e) {
        console.error('Error fetching dashboard stats:', e);
    }
};

// Call it initially
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
});
