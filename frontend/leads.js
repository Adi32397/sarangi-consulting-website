/* ==================================================
   LEADS & CONTACTS MODULE SCRIPTS (PREMIUM)
================================================== */

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modals when clicking outside the content
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // Select All Checkbox logic
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
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

        rowCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const row = cb.closest('tr');
                if (cb.checked) {
                    row.style.backgroundColor = 'rgba(11, 107, 58, 0.04)';
                } else {
                    row.style.backgroundColor = '';
                }
                const allChecked = Array.from(rowCheckboxes).every(c => c.checked);
                const someChecked = Array.from(rowCheckboxes).some(c => c.checked);
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            });
        });
    }

    // Chart.js Premium Configurations
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';
    Chart.defaults.scale.grid.color = 'rgba(226, 232, 240, 0.8)';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.titleFont = { size: 13, family: "'Montserrat', sans-serif", weight: 'bold' };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = false;
    
    // Create Gradients helper
    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    // 1. Leads by Month (Bar Chart)
    const ctxMonthElement = document.getElementById('leadsMonthChart');
    if (ctxMonthElement) {
        const ctxMonth = ctxMonthElement.getContext('2d');
        const primaryGradient = createGradient(ctxMonth, '#0B6B3A', '#22c55e');
        
        new Chart(ctxMonth, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Leads',
                    data: [45, 52, 38, 65, 89, 154],
                    backgroundColor: primaryGradient,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, border: { display: false }, grid: { drawBorder: false } },
                    x: { grid: { display: false }, border: { display: false } }
                },
                animation: { duration: 2000, easing: 'easeOutQuart' }
            }
        });
    }

    // 2. Lead Sources (Pie Chart)
    const ctxSourceElement = document.getElementById('leadsSourceChart');
    if (ctxSourceElement) {
        new Chart(ctxSourceElement, {
            type: 'doughnut', // Doughnut looks more premium than flat pie
            data: {
                labels: ['Website', 'LinkedIn', 'WhatsApp', 'Google Search', 'Referral'],
                datasets: [{
                    data: [40, 25, 15, 12, 8],
                    backgroundColor: ['#0B6B3A', '#0ea5e9', '#22c55e', '#6366f1', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '40%',
                plugins: { 
                    legend: { position: 'right', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } } 
                },
                animation: { animateScale: true, animateRotate: true, duration: 1500 }
            }
        });
    }

    // 3. Lead Status Distribution (Donut Chart)
    const ctxStatusElement = document.getElementById('leadsStatusChart');
    if (ctxStatusElement) {
        new Chart(ctxStatusElement, {
            type: 'doughnut',
            data: {
                labels: ['New', 'Contacted', 'Meeting Scheduled', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
                datasets: [{
                    data: [12, 98, 25, 54, 15, 37, 9],
                    backgroundColor: [
                        '#3b82f6', // New
                        '#eab308', // Contacted
                        '#f97316', // Meeting Scheduled
                        '#a855f7', // Qualified
                        '#6366f1', // Proposal Sent
                        '#10b981', // Won
                        '#ef4444'  // Lost
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'right', labels: { padding: 15, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } 
                },
                cutout: '70%',
                animation: { animateScale: true, duration: 1500 }
            }
        });
    }

    // 4. Lead Conversion Funnel (Using curved area chart)
    const ctxFunnelElement = document.getElementById('leadsFunnelChart');
    if (ctxFunnelElement) {
        const ctxFunnel = ctxFunnelElement.getContext('2d');
        const areaGradient = ctxFunnel.createLinearGradient(0, 0, 0, 300);
        areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
        
        new Chart(ctxFunnel, {
            type: 'line',
            data: {
                labels: ['New Leads', 'Contacted', 'Qualified', 'Proposal', 'Won Clients'],
                datasets: [{
                    label: 'Conversion Count',
                    data: [154, 98, 54, 45, 37],
                    borderColor: '#3b82f6',
                    backgroundColor: areaGradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4, // smooth curves
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                },
                animation: { duration: 2000, easing: 'easeOutQuart' }
            }
        });
    }

    // 5. Top Services Requested (Horizontal Bar Chart)
    const ctxServicesElement = document.getElementById('servicesChart');
    if (ctxServicesElement) {
        const ctxServices = ctxServicesElement.getContext('2d');
        
        new Chart(ctxServices, {
            type: 'bar',
            data: {
                labels: ['Startup Advisory', 'Business Registration', 'Tax Consultation', 'Funding Support', 'Compliance'],
                datasets: [{
                    label: 'Inquiries',
                    data: [65, 42, 38, 25, 18],
                    backgroundColor: ['#0B6B3A', '#14b8a6', '#6366f1', '#f59e0b', '#8b5cf6'],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y', // Makes it horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, border: { display: false } },
                    y: { grid: { display: false }, border: { display: false } }
                },
                animation: { duration: 1500 }
            }
        });
    }

});
