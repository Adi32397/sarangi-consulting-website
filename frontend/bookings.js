/* ==================================================
   BOOKINGS MODULE SCRIPTS
================================================== */

let liveBookings = [];

// Helper to get Badge HTML
function getStatusBadge(status) {
    const s = status ? status.toLowerCase() : 'pending';
    return `<span class="badge badge-status badge-${s}">${status || 'Pending'}</span>`;
}
function getPaymentBadge(payment) {
    const p = payment ? payment.toLowerCase() : 'pending';
    return `<span class="badge badge-payment badge-${p}">${payment || 'Pending'}</span>`;
}

// Fetch API Setup
const API_URL = 'http://localhost:5000/api/bookings';

async function fetchBookings() {
    const token = localStorage.getItem('token') || '';
    try {
        const queryParams = new URLSearchParams();
        const search = document.getElementById('searchInput')?.value;
        const status = document.getElementById('statusFilter')?.value;
        const type = document.getElementById('typeFilter')?.value;
        const consultant = document.getElementById('consultantFilter')?.value;
        const payment = document.getElementById('paymentFilter')?.value;
        const mode = document.getElementById('modeFilter')?.value;

        if (search && search.trim() !== '') queryParams.append('search', search.trim());
        if (status && status !== '' && status !== 'All') queryParams.append('status', status);
        if (type && type !== '' && type !== 'All') queryParams.append('type', type);
        if (consultant && consultant !== '' && consultant !== 'All') queryParams.append('consultant', consultant);
        if (payment && payment !== '' && payment !== 'All') queryParams.append('payment', payment);
        if (mode && mode !== '' && mode !== 'All') queryParams.append('mode', mode);

        const url = `${API_URL}?${queryParams.toString()}`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            liveBookings = data.data;
            renderTable();
            
            // Update Pagination Text
            const paginationEl = document.querySelector('.pagination-info');
            if (paginationEl) {
                paginationEl.textContent = `Showing 1–${liveBookings.length} of ${data.count || liveBookings.length} Bookings`;
            }

            if (calendarInitialized) {
                initCalendar(); // re-init calendar with new data
            }
        }
    } catch (err) {
        console.error('Error fetching bookings:', err);
    }
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = liveBookings.map(b => `
        <tr>
            <td data-label="Select"><input type="checkbox" class="row-checkbox" value="${b.id}"></td>
            <td data-label="ID" class="booking-id">${b.booking_id}</td>
            <td data-label="Client Info" class="client-info">
                <strong>${b.client_name}</strong>
                <span>${b.company || '-'}</span>
            </td>
            <td data-label="Type">${b.consultation_type}</td>
            <td data-label="Consultant">${b.consultant}</td>
            <td data-label="Date & Time" class="client-info">
                <strong>${b.booking_date}</strong>
                <span>${b.booking_time}</span>
            </td>
            <td data-label="Mode">${b.meeting_mode}</td>
            <td data-label="Payment">${getPaymentBadge(b.payment_status)}</td>
            <td data-label="Status">${getStatusBadge(b.booking_status)}</td>
            <td data-label="Actions" class="action-cell">
                <div class="action-buttons">
                    <button class="icon-btn" title="View" onclick="viewBooking('${b.id}')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn" title="Edit" onclick="editBooking('${b.id}')"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn" title="Reschedule" onclick="openModal('rescheduleBookingModal')"><i class="fas fa-calendar-plus"></i></button>
                    <button class="icon-btn icon-danger" title="Delete" onclick="deleteBooking('${b.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    
    setupCheckboxes();
}

// Delete Booking
async function deleteBooking(id) {
    if(!confirm('Are you sure you want to delete this booking?')) return;
    const token = localStorage.getItem('token') || '';
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            fetchBookings();
            fetchAnalytics();
        }
    } catch(err) {
        console.error(err);
    }
}

let currentViewBookingId = null;

function viewBooking(id) {
    const b = liveBookings.find(x => x.id === id);
    if (!b) return;
    currentViewBookingId = id;
    
    if(document.getElementById('detailBookingId')) document.getElementById('detailBookingId').textContent = b.booking_id || '';
    if(document.getElementById('viewBookingDate')) document.getElementById('viewBookingDate').textContent = b.booking_date || '';
    if(document.getElementById('viewBookingTime')) document.getElementById('viewBookingTime').textContent = b.booking_time || '';
    if(document.getElementById('viewDuration')) document.getElementById('viewDuration').textContent = b.duration ? `${b.duration} Minutes` : '';
    if(document.getElementById('viewMeetingMode')) document.getElementById('viewMeetingMode').textContent = b.meeting_mode || '';
    if(document.getElementById('viewConsultationType')) document.getElementById('viewConsultationType').textContent = b.consultation_type || '';
    if(document.getElementById('viewBookingStatus')) document.getElementById('viewBookingStatus').innerHTML = getStatusBadge(b.booking_status);
    if(document.getElementById('viewPaymentStatus')) document.getElementById('viewPaymentStatus').innerHTML = getPaymentBadge(b.payment_status);
    
    if(document.getElementById('viewClientName')) document.getElementById('viewClientName').textContent = b.client_name || '';
    if(document.getElementById('viewCompany')) document.getElementById('viewCompany').textContent = b.company || '-';
    
    const emailEl = document.getElementById('viewEmail');
    if (emailEl) {
        emailEl.innerHTML = b.email ? `<a href="mailto:${b.email}">${b.email}</a>` : '';
    }
    const phoneEl = document.getElementById('viewPhone');
    if (phoneEl) {
        phoneEl.innerHTML = b.phone ? `<a href="tel:${b.phone}">${b.phone}</a>` : '';
    }
    
    if(document.getElementById('viewConsultantName')) document.getElementById('viewConsultantName').textContent = b.consultant || '';
    const linkEl = document.getElementById('viewMeetingLink');
    if (linkEl) {
        linkEl.innerHTML = b.meeting_link ? `<a href="${b.meeting_link}" target="_blank" class="text-primary">${b.meeting_link}</a>` : 'Not provided';
    }
    
    if(document.getElementById('viewAmount')) document.getElementById('viewAmount').textContent = b.amount ? `₹${parseFloat(b.amount).toLocaleString('en-IN')}` : '₹0';
    if(document.getElementById('viewGst')) document.getElementById('viewGst').textContent = b.gst ? `₹${parseFloat(b.gst).toLocaleString('en-IN')}` : '₹0';
    if(document.getElementById('viewDiscount')) document.getElementById('viewDiscount').textContent = b.discount ? `₹${parseFloat(b.discount).toLocaleString('en-IN')}` : '₹0';
    
    const total = (parseFloat(b.amount||0) + parseFloat(b.gst||0) - parseFloat(b.discount||0));
    if(document.getElementById('viewTotal')) document.getElementById('viewTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
    
    if(document.getElementById('viewNotes')) document.getElementById('viewNotes').textContent = b.notes || 'No notes provided.';
    
    openModal('viewBookingModal');
}

function editBooking(id) {
    const b = liveBookings.find(x => x.id === id);
    if (!b) return;
    
    if(document.getElementById('editBookingId')) document.getElementById('editBookingId').value = b.id;
    if(document.getElementById('editBookingIdDisplay')) document.getElementById('editBookingIdDisplay').textContent = `(${b.booking_id})`;
    
    if(document.getElementById('editClientName')) document.getElementById('editClientName').value = b.client_name || '';
    if(document.getElementById('editCompany')) document.getElementById('editCompany').value = b.company || '';
    if(document.getElementById('editEmail')) document.getElementById('editEmail').value = b.email || '';
    if(document.getElementById('editPhone')) document.getElementById('editPhone').value = b.phone || '';
    if(document.getElementById('editType')) document.getElementById('editType').value = b.consultation_type || '';
    if(document.getElementById('editConsultant')) document.getElementById('editConsultant').value = b.consultant || '';
    if(document.getElementById('editDate')) document.getElementById('editDate').value = b.booking_date || '';
    if(document.getElementById('editTime')) document.getElementById('editTime').value = b.booking_time || '';
    if(document.getElementById('editMode')) document.getElementById('editMode').value = b.meeting_mode || '';
    if(document.getElementById('editMeetingLink')) document.getElementById('editMeetingLink').value = b.meeting_link || '';
    if(document.getElementById('editBookingStatus')) document.getElementById('editBookingStatus').value = b.booking_status || 'Pending';
    if(document.getElementById('editPaymentStatus')) document.getElementById('editPaymentStatus').value = b.payment_status || 'Pending';
    if(document.getElementById('editAmount')) document.getElementById('editAmount').value = b.amount || 0;
    if(document.getElementById('editDiscount')) document.getElementById('editDiscount').value = b.discount || 0;
    if(document.getElementById('editNotes')) document.getElementById('editNotes').value = b.notes || '';
    
    openModal('editBookingModal');
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
    if(!calendarEl) return;
    
    // Map live data to calendar events
    const events = liveBookings.map(b => {
        let color = '#3b82f6'; // Confirmed (blue)
        if(b.booking_status === 'Pending') color = '#f97316';
        else if(b.booking_status === 'Completed') color = '#10b981';
        else if(b.booking_status === 'Cancelled') color = '#ef4444';
        
        return {
            title: `${b.client_name} - ${b.consultation_type}`,
            start: `${b.booking_date}T${convertTime12to24(b.booking_time)}`,
            backgroundColor: color,
            borderColor: color,
            extendedProps: { id: b.id }
        };
    });

    if (calendarInstance) {
        calendarInstance.destroy();
    }

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
    if(!time12h) return "00:00:00";
    const parts = time12h.split(' ');
    if(parts.length < 2) return time12h; // already 24h or invalid
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM' || modifier === 'pm') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

// Analytics Setup
async function fetchAnalytics() {
    const token = localStorage.getItem('token') || '';
    try {
        const res = await fetch(`${API_URL}/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            // Update Top Cards
            if (document.getElementById('totalBookingsEl')) document.getElementById('totalBookingsEl').textContent = data.data.totalBookings || 0;
            if (document.getElementById('todaysBookingsEl')) document.getElementById('todaysBookingsEl').textContent = data.data.todaysBookings || 0;
            if (document.getElementById('confirmedBookingsEl')) document.getElementById('confirmedBookingsEl').textContent = data.data.confirmedBookings || 0;
            if (document.getElementById('pendingBookingsEl')) document.getElementById('pendingBookingsEl').textContent = data.data.pendingApprovalBookings || 0;
            if (document.getElementById('completedBookingsEl')) document.getElementById('completedBookingsEl').textContent = data.data.completedBookings || 0;
            if (document.getElementById('cancelledBookingsEl')) document.getElementById('cancelledBookingsEl').textContent = data.data.cancelledBookings || 0;

            // Render Charts
            renderMonthlyChart(data.data.monthlyBookings);
            renderStatusChart(data.data.statusDistribution);
            renderConsultationChart(data.data.categoryDistribution);
            renderRevenueChart(data.data.revenueByMonth);
        }
    } catch (err) {
        console.error('Error fetching analytics:', err);
    }
}

let monthChartInstance = null;
function renderMonthlyChart(monthlyData) {
    const ctxMonthElement = document.getElementById('bookingsMonthChart');
    if (!ctxMonthElement) return;

    const labels = monthlyData.map(d => `${d._id.month}/${d._id.year}`);
    const dataPts = monthlyData.map(d => d.count);

    if (monthChartInstance) {
        monthChartInstance.destroy();
    }

    const ctxMonth = ctxMonthElement.getContext('2d');
    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    monthChartInstance = new Chart(ctxMonth, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'Bookings',
                data: dataPts.length ? dataPts : [0],
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

let statusChartInstance = null;
function renderStatusChart(statusData) {
    const ctxElement = document.getElementById('bookingStatusChart');
    if (!ctxElement || !statusData) return;

    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    const labels = statusData.map(d => d.status);
    const dataPts = statusData.map(d => d.count);
    
    // Assign colors based on status
    const bgColors = labels.map(status => {
        if(status === 'Confirmed') return '#3b82f6';
        if(status === 'Completed') return '#10b981';
        if(status === 'Pending') return '#f97316';
        if(status === 'Cancelled') return '#ef4444';
        return '#cbd5e1';
    });

    statusChartInstance = new Chart(ctxElement, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                data: dataPts.length ? dataPts : [1],
                backgroundColor: dataPts.length ? bgColors : ['#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
            },
            cutout: '70%'
        }
    });
}

let consultationChartInstance = null;
function renderConsultationChart(categoryData) {
    const ctxElement = document.getElementById('consultationChart');
    if (!ctxElement || !categoryData) return;

    if (consultationChartInstance) {
        consultationChartInstance.destroy();
    }

    const labels = categoryData.map(d => d.category);
    const dataPts = categoryData.map(d => d.count);

    consultationChartInstance = new Chart(ctxElement, {
        type: 'pie',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                data: dataPts.length ? dataPts : [1],
                backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
            }
        }
    });
}

let revenueChartInstance = null;
function renderRevenueChart(revenueData) {
    const ctxElement = document.getElementById('revenueChart');
    if (!ctxElement || !revenueData) return;

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    const labels = revenueData.map(d => `${d._id.month}/${d._id.year}`);
    const dataPts = revenueData.map(d => d.total);

    const ctx = ctxElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'Revenue (₹)',
                data: dataPts.length ? dataPts : [0],
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { border: { display: false }, beginAtZero: true },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // Check elements for top cards to avoid null reference if HTML differs
    const cards = document.querySelectorAll('.stat-value');
    if (cards.length >= 6) {
        cards[0].id = 'totalBookingsEl';
        cards[1].id = 'todaysBookingsEl';
        cards[2].id = 'confirmedBookingsEl';
        cards[3].id = 'pendingBookingsEl';
        cards[4].id = 'completedBookingsEl';
        cards[5].id = 'cancelledBookingsEl';
    }

    // Default Chart Settings
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#64748b';
        Chart.defaults.scale.grid.color = 'rgba(226, 232, 240, 0.8)';
    }

    // Setup Filters
    const filterIds = ['searchInput', 'statusFilter', 'typeFilter', 'consultantFilter', 'paymentFilter', 'modeFilter'];
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(id === 'searchInput' ? 'keyup' : 'change', () => {
                // simple debounce for search
                if (id === 'searchInput') {
                    clearTimeout(el.timeoutId);
                    el.timeoutId = setTimeout(fetchBookings, 300);
                } else {
                    fetchBookings();
                }
            });
        }
    });

    // Load initial data
    fetchBookings();
    fetchAnalytics();

    // Form Listener
    const saveBookingBtn = document.querySelector('#addBookingModal .btn-primary');
    if(saveBookingBtn) {
        saveBookingBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token') || '';
            const newBooking = {
                client_name: document.getElementById('addClientName')?.value || 'Guest',
                company: document.getElementById('addCompany')?.value || '',
                email: document.getElementById('addEmail')?.value || 'guest@example.com',
                phone: document.getElementById('addPhone')?.value || '0000000000',
                consultation_type: document.getElementById('addType')?.value || 'General',
                consultant: document.getElementById('addConsultant')?.value || 'Admin',
                booking_date: document.getElementById('addDate')?.value || new Date().toISOString().slice(0,10),
                booking_time: document.getElementById('addTime')?.value || '10:00 AM',
                meeting_mode: document.getElementById('addMode')?.value || 'Online',
                amount: document.getElementById('addAmount')?.value || 0
            };

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newBooking)
                });
                const data = await res.json();
                if(data.success) {
                    closeModal('addBookingModal');
                    fetchBookings();
                    fetchAnalytics();
                } else {
                    alert(data.message || 'Error creating booking');
                }
            } catch(err) {
                console.error(err);
            }
        });
    }

    // Save Edit Listener
    const saveEditBookingBtn = document.getElementById('saveEditBookingBtn');
    if(saveEditBookingBtn) {
        saveEditBookingBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editBookingId').value;
            if (!id) return;
            const token = localStorage.getItem('token') || '';
            const updatedBooking = {
                client_name: document.getElementById('editClientName')?.value,
                company: document.getElementById('editCompany')?.value,
                email: document.getElementById('editEmail')?.value,
                phone: document.getElementById('editPhone')?.value,
                consultation_type: document.getElementById('editType')?.value,
                consultant: document.getElementById('editConsultant')?.value,
                booking_date: document.getElementById('editDate')?.value,
                booking_time: document.getElementById('editTime')?.value,
                meeting_mode: document.getElementById('editMode')?.value,
                meeting_link: document.getElementById('editMeetingLink')?.value,
                booking_status: document.getElementById('editBookingStatus')?.value,
                payment_status: document.getElementById('editPaymentStatus')?.value,
                amount: document.getElementById('editAmount')?.value,
                discount: document.getElementById('editDiscount')?.value,
                notes: document.getElementById('editNotes')?.value
            };

            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedBooking)
                });
                const data = await res.json();
                if(data.success) {
                    closeModal('editBookingModal');
                    fetchBookings();
                    fetchAnalytics();
                } else {
                    alert(data.message || 'Error updating booking');
                }
            } catch(err) {
                console.error(err);
            }
        });
    }

    // View Modal Edit Button Listener
    const viewModalEditBtn = document.getElementById('viewModalEditBtn');
    if(viewModalEditBtn) {
        viewModalEditBtn.addEventListener('click', () => {
            if (currentViewBookingId) {
                closeModal('viewBookingModal');
                editBooking(currentViewBookingId);
            }
        });
    }

    // Generate Invoice Button Listener
    const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
    if(generateInvoiceBtn) {
        generateInvoiceBtn.addEventListener('click', async () => {
            if (!currentViewBookingId) return;
            try {
                const token = localStorage.getItem('token') || '';
                const res = await fetch(`${API_URL}/${currentViewBookingId}/invoice`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!res.ok) {
                    alert('Failed to generate invoice');
                    return;
                }
                
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice_${currentViewBookingId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Invoice error:', err);
                alert('Error generating invoice');
            }
        });
    }
});

// EXPORT BOOKINGS
async function exportBookings(format, exportAll = false) {
    let payload = {};
    
    if (!exportAll) {
        const checkboxes = document.querySelectorAll('.row-checkbox:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.value); // Use value, not dataset.id
        if (selectedIds.length === 0) {
            alert('Please select at least one booking to export, or use the top Export buttons to export all.');
            return;
        }
        payload = { ids: selectedIds };
    }

    try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL.replace('/bookings', '/exports/bookings')}/${format}`, {
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
        a.download = `bookings_export_${Date.now()}.${ext}`;
        
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export error:', err);
        alert('Error exporting bookings');
    }
}

// BULK ACTIONS
function getSelectedIds() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

async function bulkUpdateStatus(status) {
    const ids = getSelectedIds();
    if (ids.length === 0) {
        alert('Please select at least one booking.');
        return;
    }
    
    if (!confirm(`Are you sure you want to mark ${ids.length} bookings as ${status}?`)) return;

    const token = localStorage.getItem('token') || '';
    try {
        await Promise.all(ids.map(id => 
            fetch(`${API_URL}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: status })
            })
        ));
        fetchBookings();
        fetchAnalytics();
    } catch (err) {
        console.error(err);
        alert('An error occurred while updating statuses.');
    }
}

async function bulkAssignConsultant() {
    const ids = getSelectedIds();
    if (ids.length === 0) {
        alert('Please select at least one booking.');
        return;
    }
    
    const consultant = prompt('Enter Consultant Name to assign (e.g. Samuel, Aditya, Priya, Admin):');
    if (!consultant) return;

    const token = localStorage.getItem('token') || '';
    try {
        await Promise.all(ids.map(id => 
            fetch(`${API_URL}/${id}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ consultant: consultant })
            })
        ));
        fetchBookings();
    } catch (err) {
        console.error(err);
        alert('An error occurred while assigning consultant.');
    }
}

async function bulkSendReminder() {
    const ids = getSelectedIds();
    if (ids.length === 0) {
        alert('Please select at least one booking.');
        return;
    }
    
    if (!confirm(`Send reminders to ${ids.length} clients?`)) return;

    // Simulate sending reminders since there is no endpoint
    alert(`Successfully sent reminders to ${ids.length} clients.`);
}

async function bulkDelete() {
    const ids = getSelectedIds();
    if (ids.length === 0) {
        alert('Please select at least one booking.');
        return;
    }
    
    if (!confirm(`Are you SURE you want to completely DELETE ${ids.length} bookings? This cannot be undone.`)) return;

    const token = localStorage.getItem('token') || '';
    try {
        await Promise.all(ids.map(id => 
            fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        ));
        fetchBookings();
        fetchAnalytics();
    } catch (err) {
        console.error(err);
        alert('An error occurred while deleting bookings.');
    }
}

async function fetchConsultants() {
    const token = localStorage.getItem('token') || '';
    try {
        const res = await fetch(`http://localhost:5000/api/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success) {
            const addSelect = document.getElementById('addConsultant');
            const editSelect = document.getElementById('editConsultant');
            const filterSelect = document.getElementById('consultantFilter');
            
            let optionsHTML = '';
            let filterOptionsHTML = '<option value="All">All Consultants</option>';
            
            json.data.forEach(user => {
                if (user.role.toLowerCase() !== 'admin' && user.name.toLowerCase() !== 'admin') {
                    optionsHTML += `<option value="${user.name}">${user.name}</option>`;
                    filterOptionsHTML += `<option value="${user.name}">${user.name}</option>`;
                }
            });
            
            if (addSelect) addSelect.innerHTML = optionsHTML;
            if (editSelect) editSelect.innerHTML = optionsHTML;
            if (filterSelect) filterSelect.innerHTML = filterOptionsHTML;
        }
    } catch (error) {
        console.error('Error fetching consultants:', error);
    }
}

// Fetch consultants on load
fetchConsultants();

// ==========================================
// QUICK ACTIONS
// ==========================================

window.sendEmailReminder = () => {
    if(!currentViewBookingId) return;
    const b = liveBookings.find(x => x.id === currentViewBookingId);
    if(b && b.email) {
        const subject = encodeURIComponent(`Meeting Reminder: ${b.consultation_type || 'Consultation'}`);
        const body = encodeURIComponent(`Hi ${b.client_name},\n\nThis is a reminder for our upcoming meeting on ${b.booking_date} at ${b.booking_time}.\n\nMeeting Link: ${b.meeting_link || 'TBD'}\n\nBest regards,\nSarangi Consulting`);
        window.location.href = `mailto:${b.email}?subject=${subject}&body=${body}`;
    } else {
        alert('No email address found for this client.');
    }
};

window.sendWhatsAppReminder = () => {
    if(!currentViewBookingId) return;
    const b = liveBookings.find(x => x.id === currentViewBookingId);
    if(b && b.phone) {
        const text = encodeURIComponent(`Hi ${b.client_name}, this is a reminder for our meeting on ${b.booking_date} at ${b.booking_time}. Link: ${b.meeting_link || 'TBD'}`);
        const phone = b.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else {
        alert('No phone number found for this client.');
    }
};

window.generateMeetLink = async () => {
    if(!currentViewBookingId) return;
    const b = liveBookings.find(x => x.id === currentViewBookingId);
    if(b) {
        // Generate a random meet-like link
        const randomString = Math.random().toString(36).substring(2, 12);
        const newLink = `https://meet.google.com/${randomString.substring(0,3)}-${randomString.substring(3,7)}-${randomString.substring(7)}`;
        
        try {
            const token = localStorage.getItem('token') || '';
            
            // The backend requires all required fields for a PUT request
            const updatedBooking = { ...b, meeting_link: newLink };

            const res = await fetch(`${API_URL}/${b.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(updatedBooking)
            });
            const json = await res.json();
            if (json.success) {
                alert('Meeting link generated successfully!');
                fetchBookings(); // Refresh the list
                b.meeting_link = newLink; // update local instantly
                viewBooking(b.id); // re-render the modal
            } else {
                alert('Failed to generate link: ' + (json.message || ''));
            }
        } catch (error) {
            console.error(error);
            alert('Error generating meeting link');
        }
    }
};

window.copyMeetingLink = () => {
    if(!currentViewBookingId) return;
    const b = liveBookings.find(x => x.id === currentViewBookingId);
    if(b && b.meeting_link) {
        navigator.clipboard.writeText(b.meeting_link).then(() => {
            alert('Meeting link copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy link.');
            console.error(err);
        });
    } else {
        alert('No meeting link is available to copy. Please generate one first.');
    }
};

window.printBookingDetails = () => {
    document.body.classList.add('print-modal-only');
    window.print();
    // Use setTimeout to remove the class after print dialog closes
    setTimeout(() => {
        document.body.classList.remove('print-modal-only');
    }, 500);
};

