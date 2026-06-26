/* ==================================================
   BOOKINGS MODULE SCRIPTS
================================================== */

// SAMPLE DATA
const sampleBookings = [
    {
        id: 'BK001', name: 'Rahul Sharma', company: 'ABC Pvt Ltd', email: 'rahul@gmail.com', phone: '9876543210',
        type: 'Startup Advisory', consultant: 'Samuel', date: '2026-06-28', time: '10:30 AM',
        mode: 'Online', payment: 'Paid', status: 'Confirmed', created: '2026-06-26'
    },
    {
        id: 'BK002', name: 'Priya Verma', company: 'XYZ Industries', email: 'priya@gmail.com', phone: '9123456789',
        type: 'GST Registration', consultant: 'Admin', date: '2026-06-29', time: '02:00 PM',
        mode: 'Offline', payment: 'Pending', status: 'Pending', created: '2026-06-26'
    },
    {
        id: 'BK003', name: 'Mohit Jain', company: 'MJ Tech', email: 'mohit@mjtech.in', phone: '9988776655',
        type: 'Business Consultation', consultant: 'Aditya', date: '2026-06-30', time: '11:00 AM',
        mode: 'Online', payment: 'Paid', status: 'Upcoming', created: '2026-06-27'
    },
    {
        id: 'BK004', name: 'Anita Desai', company: 'Desai Traders', email: 'anita@desai.com', phone: '9871234560',
        type: 'Tax Consultation', consultant: 'Priya', date: '2026-06-27', time: '04:00 PM',
        mode: 'Phone Call', payment: 'Paid', status: 'Completed', created: '2026-06-25'
    },
    {
        id: 'BK005', name: 'Vikram Singh', company: 'Singh Logistics', email: 'vikram@logistics.com', phone: '9123000000',
        type: 'Legal Consultation', consultant: 'Samuel', date: '2026-07-02', time: '10:00 AM',
        mode: 'Online', payment: 'Failed', status: 'Cancelled', created: '2026-06-26'
    },
    {
        id: 'BK006', name: 'Neha Gupta', company: 'Gupta Sweets', email: 'neha@gupta.com', phone: '9000011111',
        type: 'Trademark', consultant: 'Admin', date: '2026-07-03', time: '01:30 PM',
        mode: 'Offline', payment: 'Refunded', status: 'Cancelled', created: '2026-06-27'
    },
    {
        id: 'BK007', name: 'Sanjay Kumar', company: 'SK Builders', email: 'sanjay@skb.com', phone: '9888877777',
        type: 'Compliance', consultant: 'Aditya', date: '2026-07-05', time: '11:30 AM',
        mode: 'Online', payment: 'Paid', status: 'Confirmed', created: '2026-06-27'
    },
    {
        id: 'BK008', name: 'Kavita Reddy', company: 'Reddy Foods', email: 'kavita@reddy.in', phone: '9777766666',
        type: 'Funding Support', consultant: 'Priya', date: '2026-07-06', time: '03:00 PM',
        mode: 'Online', payment: 'Pending', status: 'Rescheduled', created: '2026-06-27'
    },
    {
        id: 'BK009', name: 'Amit Patel', company: 'Patel Exports', email: 'amit@patel.com', phone: '9666655555',
        type: 'GST', consultant: 'Samuel', date: '2026-07-01', time: '12:00 PM',
        mode: 'Online', payment: 'Paid', status: 'Upcoming', created: '2026-06-27'
    },
    {
        id: 'BK010', name: 'Deepa Iyer', company: 'Iyer Consulting', email: 'deepa@iyer.com', phone: '9555544444',
        type: 'Startup Advisory', consultant: 'Admin', date: '2026-07-04', time: '10:30 AM',
        mode: 'Offline', payment: 'Paid', status: 'Confirmed', created: '2026-06-27'
    }
];

// Helper to get Badge HTML
function getStatusBadge(status) {
    const s = status.toLowerCase();
    return `<span class="badge badge-status badge-${s}">${status}</span>`;
}
function getPaymentBadge(payment) {
    const p = payment.toLowerCase();
    return `<span class="badge badge-payment badge-${p}">${payment}</span>`;
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = sampleBookings.map(b => `
        <tr>
            <td data-label="Select"><input type="checkbox" class="row-checkbox"></td>
            <td data-label="ID" class="booking-id">${b.id}</td>
            <td data-label="Client Info" class="client-info">
                <strong>${b.name}</strong>
                <span>${b.company}</span>
            </td>
            <td data-label="Type">${b.type}</td>
            <td data-label="Consultant">${b.consultant}</td>
            <td data-label="Date & Time" class="client-info">
                <strong>${b.date}</strong>
                <span>${b.time}</span>
            </td>
            <td data-label="Mode">${b.mode}</td>
            <td data-label="Payment">${getPaymentBadge(b.payment)}</td>
            <td data-label="Status">${getStatusBadge(b.status)}</td>
            <td data-label="Actions" class="action-cell">
                <div class="action-buttons">
                    <button class="icon-btn" title="View" onclick="openModal('viewBookingModal')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn" title="Edit" onclick="openModal('editBookingModal')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn" title="Reschedule" onclick="openModal('rescheduleBookingModal')"><i class="fas fa-calendar-plus"></i></button>
                    <button class="icon-btn icon-danger" title="Delete" onclick="openModal('deleteBookingModal')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    
    setupCheckboxes();
}

// Checkboxes Logic
function setupCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            rowCheckboxes.forEach(cb => {
                cb.checked = isChecked;
                const row = cb.closest('tr');
                if (isChecked) row.style.backgroundColor = 'rgba(11, 107, 58, 0.04)';
                else row.style.backgroundColor = '';
            });
        });

        rowCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const row = cb.closest('tr');
                if (cb.checked) row.style.backgroundColor = 'rgba(11, 107, 58, 0.04)';
                else row.style.backgroundColor = '';
                
                const allChecked = Array.from(rowCheckboxes).every(c => c.checked);
                const someChecked = Array.from(rowCheckboxes).some(c => c.checked);
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            });
        });
    }
}

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

// Toggle Calendar View
let calendarInitialized = false;
let calendarInstance = null;

function toggleCalendarView() {
    const tableView = document.getElementById('tableView');
    const calView = document.getElementById('calendarView');
    const btn = document.getElementById('calendarViewBtn');
    const bulkActions = document.getElementById('bulkActionsContainer');
    
    if (tableView.style.display === 'none') {
        tableView.style.display = 'block';
        calView.style.display = 'none';
        bulkActions.style.display = 'inline-flex';
        btn.innerHTML = '<i class="fas fa-calendar-alt"></i> Calendar View';
    } else {
        tableView.style.display = 'none';
        bulkActions.style.display = 'none';
        calView.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-table"></i> Table View';
        
        if (!calendarInitialized) {
            initCalendar();
            calendarInitialized = true;
        } else {
            calendarInstance.render(); // fix sizing issues when unhidden
        }
    }
}

// Initialize FullCalendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    // Map sample data to calendar events
    const events = sampleBookings.map(b => {
        let color = '#3b82f6'; // Confirmed (blue)
        if(b.status === 'Pending') color = '#f97316';
        else if(b.status === 'Completed') color = '#10b981';
        else if(b.status === 'Cancelled') color = '#ef4444';
        
        return {
            title: `${b.name} - ${b.type}`,
            start: `${b.date}T${convertTime12to24(b.time)}`,
            backgroundColor: color,
            borderColor: color,
            extendedProps: { id: b.id }
        };
    });

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events,
        eventClick: function(info) {
            openModal('viewBookingModal');
        }
    });
    calendarInstance.render();
}

// Helper: Convert 10:30 AM to 10:30:00
function convertTime12to24(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

// Initialize Charts
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';
    Chart.defaults.scale.grid.color = 'rgba(226, 232, 240, 0.8)';
    
    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    // 1. Bookings Per Month
    const ctxMonthElement = document.getElementById('bookingsMonthChart');
    if (ctxMonthElement) {
        const ctxMonth = ctxMonthElement.getContext('2d');
        new Chart(ctxMonth, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Bookings',
                    data: [120, 150, 180, 140, 210, 248],
                    backgroundColor: createGradient(ctxMonth, '#0B6B3A', '#22c55e'),
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }
            }
        });
    }

    // 2. Booking Status
    const ctxStatusElement = document.getElementById('bookingStatusChart');
    if (ctxStatusElement) {
        new Chart(ctxStatusElement, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Completed', 'Pending', 'Cancelled'],
                datasets: [{
                    data: [165, 132, 28, 15],
                    backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#ef4444'],
                    borderWidth: 0, hoverOffset: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: { legend: { position: 'right', labels: { usePointStyle: true } } }
            }
        });
    }

    // 3. Consultation Categories
    const ctxCategoryElement = document.getElementById('consultationChart');
    if (ctxCategoryElement) {
        new Chart(ctxCategoryElement, {
            type: 'pie',
            data: {
                labels: ['Startup', 'Tax', 'GST', 'Legal', 'Trademark', 'Funding'],
                datasets: [{
                    data: [35, 20, 15, 10, 12, 8],
                    backgroundColor: ['#0B6B3A', '#0ea5e9', '#22c55e', '#6366f1', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0, hoverOffset: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { usePointStyle: true } } }
            }
        });
    }

    // 4. Revenue Generated
    const ctxRevElement = document.getElementById('revenueChart');
    if (ctxRevElement) {
        const ctxRev = ctxRevElement.getContext('2d');
        const areaGradient = ctxRev.createLinearGradient(0, 0, 0, 300);
        areaGradient.addColorStop(0, 'rgba(11, 107, 58, 0.4)');
        areaGradient.addColorStop(1, 'rgba(11, 107, 58, 0.0)');

        new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [120000, 150000, 140000, 180000, 220000, 280000],
                    borderColor: '#0B6B3A', backgroundColor: areaGradient, borderWidth: 3, fill: true,
                    tension: 0.4, pointBackgroundColor: '#ffffff', pointBorderColor: '#0B6B3A', pointRadius: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }
            }
        });
    }
});
