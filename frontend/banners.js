/* ==================================================
   BANNER MANAGEMENT MODULE SCRIPTS
================================================== */

let liveBanners = [];
const API_URL = 'http://localhost:5000/api/banners';

// Helper: Format Date
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
};

// Helper: Get Badge HTML
const getBadge = (status) => {
    const lower = (status || 'draft').toLowerCase();
    return `<span class="badge badge-${lower}">${status}</span>`;
};

// Fetch API Setup
async function fetchBanners(searchQuery = '') {
    const token = localStorage.getItem('token');
    try {
        let url = API_URL;
        if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            liveBanners = data.data;
            renderBannersTable();
            renderActiveCampaigns();
        }
    } catch (err) {
        console.error('Error fetching banners:', err);
    }
}

async function fetchBannerStats() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            const { counts, analytics, charts } = data.data;
            // Update Summary Cards
            if (document.getElementById('stat-total-banners')) document.getElementById('stat-total-banners').innerText = counts.total;
            if (document.getElementById('stat-active-banners')) document.getElementById('stat-active-banners').innerText = counts.active;
            if (document.getElementById('stat-scheduled-banners')) document.getElementById('stat-scheduled-banners').innerText = counts.scheduled;
            if (document.getElementById('stat-expired-banners')) document.getElementById('stat-expired-banners').innerText = counts.expired;
            if (document.getElementById('stat-draft-banners')) document.getElementById('stat-draft-banners').innerText = counts.draft;
            if (document.getElementById('stat-qr-campaigns')) document.getElementById('stat-qr-campaigns').innerText = counts.qrCampaigns;
            
            // Update Analytics Cards
            if (document.getElementById('stat-total-views')) document.getElementById('stat-total-views').innerText = analytics.totalViews.toLocaleString();
            if (document.getElementById('stat-total-clicks')) document.getElementById('stat-total-clicks').innerText = analytics.totalClicks.toLocaleString();
            if (document.getElementById('stat-avg-ctr')) document.getElementById('stat-avg-ctr').innerText = `${analytics.avgCtr}%`;
            if (document.getElementById('stat-top-performing')) document.getElementById('stat-top-performing').innerText = analytics.topPerforming;

            // Initialize Charts with dynamic data
            initCharts(charts);
        }
    } catch (err) {
        console.error('Error fetching banner stats:', err);
    }
}

// Render CMS Table
const renderBannersTable = () => {
    const tbody = document.getElementById('bannersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Read filters
    const search = (document.getElementById('searchBanners')?.value || '').toLowerCase();
    const status = document.getElementById('filterStatus')?.value || '';
    const type = document.getElementById('filterType')?.value || '';
    const position = document.getElementById('filterPosition')?.value || '';
    const dateFilter = document.getElementById('filterDate')?.value || '';
    
    const now = new Date();
    
    const filteredBanners = liveBanners.filter(b => {
        if (search && !b.title.toLowerCase().includes(search)) return false;
        if (status && b.status !== status) return false;
        if (type && b.banner_type !== type) return false;
        if (position && b.display_position !== position) return false;
        
        if (dateFilter && b.createdAt) {
            const createdDate = new Date(b.createdAt);
            if (dateFilter === 'Today') {
                if (createdDate.toDateString() !== now.toDateString()) return false;
            } else if (dateFilter === 'This Week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                if (createdDate < oneWeekAgo) return false;
            } else if (dateFilter === 'This Month') {
                if (createdDate.getMonth() !== now.getMonth() || createdDate.getFullYear() !== now.getFullYear()) return false;
            }
        }
        
        return true;
    });
    
    filteredBanners.forEach(banner => {
        const tr = document.createElement('tr');
        
        let imageSrc = banner.image;
        if(imageSrc && imageSrc.startsWith('/')) {
            imageSrc = `http://localhost:5000${imageSrc}`;
        }
        
        tr.innerHTML = `
            <td data-label="Select"><input type="checkbox" class="banner-checkbox" value="${banner.id}"></td>
            <td data-label="Priority"><i class="fas fa-grip-vertical text-muted mr-10" style="cursor: grab;"></i> ${banner.priority}</td>
            <td data-label="Image"><img src="${imageSrc}" class="banner-thumb" alt="Thumb"></td>
            <td data-label="Info">
                <span class="banner-title">${banner.title}</span>
                <span class="banner-subtitle" title="${banner.subtitle || ''}">${banner.subtitle || ''}</span>
                <span class="text-muted" style="font-size: 11px;">ID: ${banner.banner_id}</span>
            </td>
            <td data-label="Display">
                <div style="font-size: 13px; font-weight: 600; color: #1e293b;">${banner.display_position}</div>
                <div style="font-size: 12px; color: #64748b;">${banner.banner_type}</div>
            </td>
            <td data-label="Timeline">
                <div style="font-size: 12px; color: #64748b;"><i class="far fa-calendar-alt mr-10"></i>${formatDate(banner.start_date)}</div>
                <div style="font-size: 12px; color: #64748b;"><i class="far fa-calendar-times mr-10"></i>${formatDate(banner.end_date)}</div>
            </td>
            <td data-label="Status/QR">
                ${getBadge(banner.status)}
                <div class="mt-10">
                    <span class="qr-badge ${banner.qr_code ? 'enabled' : ''}">
                        <i class="fas fa-qrcode"></i> ${banner.qr_code ? 'QR Ready' : 'No QR'}
                    </span>
                </div>
            </td>
            <td data-label="Actions" class="text-right">
                <div class="action-buttons">
                    <button class="icon-btn icon-primary" title="View" onclick="viewBanner('${banner.id}')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn icon-warning" title="Edit" onclick="openEditBannerModal('${banner.id}')"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn icon-danger" title="Delete" onclick="deleteBanner('${banner.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Delete Banner
window.deleteBanner = async (id) => {
    if(!confirm('Are you sure you want to delete this banner?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            fetchBanners();
            fetchBannerStats();
        }
    } catch(err) {
        console.error(err);
    }
}


// Render Active Campaigns
const renderActiveCampaigns = () => {
    const list = document.getElementById('campaignsList');
    if (!list) return;

    const activeCampaigns = liveBanners.filter(b => b.status === 'Active' && (b.banner_type.includes('Campaign') || b.banner_type.includes('Service')));
    
    list.innerHTML = '';
    activeCampaigns.forEach(camp => {
        let imageSrc = camp.image;
        if(imageSrc && imageSrc.startsWith('/')) {
            imageSrc = `http://localhost:5000${imageSrc}`;
        }
        
        list.innerHTML += `
            <div class="campaign-item">
                <img src="${imageSrc}" class="campaign-img" alt="Campaign">
                <div>
                    <h4 style="font-family: 'Montserrat'; font-size: 16px; margin-bottom: 4px; color: #0f172a;">${camp.title}</h4>
                    <p style="font-size: 13px; color: #64748b; margin: 0;">Running: ${formatDate(camp.start_date)} - ${formatDate(camp.end_date)}</p>
                </div>
                <div class="campaign-stat">
                    <span>Views</span>
                    <strong>${camp.views}</strong>
                </div>
                <div class="campaign-stat">
                    <span>Clicks</span>
                    <strong class="text-primary">${camp.clicks}</strong>
                </div>
                <div class="campaign-stat">
                    <span>CTR</span>
                    <strong class="text-success">${camp.views ? ((camp.clicks / camp.views) * 100).toFixed(1) : 0}%</strong>
                </div>
            </div>
        `;
    });
};

// Modals
let editBannerId = null;

window.openAddBannerModal = () => {
    editBannerId = null;
    const form = document.getElementById('bannerForm');
    if (form) form.reset();
    document.getElementById('dragDropText').innerHTML = `Drag & Drop your image here or <strong>Browse</strong>`;
    uploadedImagePath = '';
    
    const modalTitle = document.querySelector('#bannerModal .modal-header h3');
    if (modalTitle) modalTitle.innerText = 'Add New Banner';
    
    document.getElementById('bannerModal').classList.add('active');
};

window.openEditBannerModal = (id) => {
    editBannerId = id;
    const banner = liveBanners.find(b => b.id === id);
    if (!banner) return;
    
    document.getElementById('addBannerTitle').value = banner.title;
    document.getElementById('addBannerSubtitle').value = banner.subtitle || '';
    document.getElementById('addBannerDesc').value = banner.description || '';
    document.getElementById('addBannerType').value = banner.banner_type;
    document.getElementById('addBannerPosition').value = banner.display_position;
    document.getElementById('addBannerPriority').value = banner.priority;
    document.getElementById('addBannerStatus').value = banner.status;
    document.getElementById('addBannerBtnText').value = banner.button_text || '';
    document.getElementById('addBannerBtnUrl').value = banner.button_url || '';
    
    try {
        const startDate = new Date(banner.start_date).toISOString().split('T')[0];
        const endDate = new Date(banner.end_date).toISOString().split('T')[0];
        document.getElementById('addBannerStart').value = startDate;
        document.getElementById('addBannerEnd').value = endDate;
    } catch (e) {
        console.error('Date parsing error', e);
    }
    
    if (banner.qr_code) {
        document.getElementById('addBannerEnableQR').value = 'Yes';
    } else {
        document.getElementById('addBannerEnableQR').value = 'No';
    }
    
    uploadedImagePath = banner.image;
    document.getElementById('dragDropText').innerHTML = `<span class="text-success"><i class="fas fa-check-circle"></i> Image Loaded</span>`;
    
    const modalTitle = document.querySelector('#bannerModal .modal-header h3');
    if (modalTitle) modalTitle.innerText = 'Edit Banner';
    
    document.getElementById('bannerModal').classList.add('active');
};
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
};
window.viewBanner = (id) => {
    const banner = liveBanners.find(b => b.id === id);
    if (banner) {
        let imageSrc = banner.image;
        if(imageSrc && imageSrc.startsWith('/')) {
            imageSrc = `http://localhost:5000${imageSrc}`;
        }
        
        document.getElementById('viewBannerTitle').innerText = banner.title;
        document.getElementById('viewBannerImg').src = imageSrc;
        document.getElementById('viewBannerId').innerText = banner.banner_id;
        document.getElementById('viewBannerStatus').innerHTML = getBadge(banner.status);
        document.getElementById('viewBannerSubtitle').innerText = banner.subtitle;
        document.getElementById('viewBannerType').innerText = banner.banner_type;
        document.getElementById('viewBannerPos').innerText = banner.display_position;
        document.getElementById('viewBannerPriority').innerText = banner.priority;
        document.getElementById('viewBannerCreator').innerText = banner.creator || 'Admin';
        document.getElementById('viewBannerStart').innerText = formatDate(banner.start_date);
        document.getElementById('viewBannerEnd').innerText = formatDate(banner.end_date);
        document.getElementById('viewBannerBtn').innerText = banner.button_text || "Learn More";
        document.getElementById('viewBannerBtn').href = banner.button_url || "#";
        
        document.getElementById('viewBannerModal').classList.add('active');
    }
};

window.previewBanner = () => {
    // Generate a mock banner from the current form fields
    const mockBanner = {
        title: document.getElementById('addBannerTitle').value || 'Preview Title',
        image: uploadedImagePath || 'https://via.placeholder.com/800x400?text=No+Image',
        banner_id: 'PREVIEW-123',
        status: document.getElementById('addBannerStatus').value || 'Draft',
        subtitle: document.getElementById('addBannerSubtitle').value || '',
        banner_type: document.getElementById('addBannerType').value || 'Homepage Hero',
        display_position: document.getElementById('addBannerPosition').value || 'Homepage',
        priority: document.getElementById('addBannerPriority').value || '1',
        creator: 'You (Preview)',
        start_date: document.getElementById('addBannerStart').value || new Date().toISOString(),
        end_date: document.getElementById('addBannerEnd').value || new Date().toISOString(),
        button_text: document.getElementById('addBannerBtnText').value || 'Learn More',
        button_url: document.getElementById('addBannerBtnUrl').value || '#'
    };
    
    let imageSrc = mockBanner.image;
    if(imageSrc && imageSrc.startsWith('/')) {
        imageSrc = `http://localhost:5000${imageSrc}`;
    }
    
    document.getElementById('viewBannerTitle').innerText = mockBanner.title;
    document.getElementById('viewBannerImg').src = imageSrc;
    document.getElementById('viewBannerId').innerText = mockBanner.banner_id;
    document.getElementById('viewBannerStatus').innerHTML = getBadge(mockBanner.status);
    document.getElementById('viewBannerSubtitle').innerText = mockBanner.subtitle;
    document.getElementById('viewBannerType').innerText = mockBanner.banner_type;
    document.getElementById('viewBannerPos').innerText = mockBanner.display_position;
    document.getElementById('viewBannerPriority').innerText = mockBanner.priority;
    document.getElementById('viewBannerCreator').innerText = mockBanner.creator;
    document.getElementById('viewBannerStart').innerText = formatDate(mockBanner.start_date);
    document.getElementById('viewBannerEnd').innerText = formatDate(mockBanner.end_date);
    document.getElementById('viewBannerBtn').innerText = mockBanner.button_text;
    document.getElementById('viewBannerBtn').href = mockBanner.button_url;
    
    document.getElementById('viewBannerModal').classList.add('active');
};

// Image Upload Logic for Modal
let uploadedImagePath = '';

document.addEventListener('DOMContentLoaded', () => {
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', renderBannersTable);
    }
    
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if(document.getElementById('searchBanners')) document.getElementById('searchBanners').value = '';
            if(document.getElementById('filterStatus')) document.getElementById('filterStatus').value = '';
            if(document.getElementById('filterType')) document.getElementById('filterType').value = '';
            if(document.getElementById('filterPosition')) document.getElementById('filterPosition').value = '';
            if(document.getElementById('filterDate')) document.getElementById('filterDate').value = '';
            renderBannersTable();
        });
    }

    const bulkActionApply = document.getElementById('bulkActionApply');
    if (bulkActionApply) {
        bulkActionApply.addEventListener('click', async () => {
            const action = document.getElementById('bulkActionSelect').value;
            if (!action) return alert('Please select an action.');
            
            const checkboxes = document.querySelectorAll('.banner-checkbox:checked');
            if (checkboxes.length === 0) return alert('Please select at least one banner.');
            
            if (!confirm(`Are you sure you want to apply this action to ${checkboxes.length} banner(s)?`)) return;
            
            const token = localStorage.getItem('token');
            const ids = Array.from(checkboxes).map(cb => cb.value);
            
            try {
                for (const id of ids) {
                    if (action === 'delete') {
                        await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    } else {
                        // Action matches status names roughly, map them:
                        const statusMap = {
                            'activate': 'Active',
                            'deactivate': 'Inactive',
                            'scheduled': 'Scheduled',
                            'expired': 'Expired',
                            'draft': 'Draft'
                        };
                        const newStatus = statusMap[action];
                        const banner = liveBanners.find(b => b.id === id);
                        if (newStatus && banner) {
                            await fetch(`${API_URL}/${id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ title: banner.title, status: newStatus })
                            });
                        }
                    }
                }
                document.getElementById('bulkActionSelect').value = '';
                document.getElementById('selectAll').checked = false;
                fetchBanners();
                fetchBannerStats();
                alert(`Successfully processed ${checkboxes.length} banner(s).`);
            } catch (err) {
                console.error(err);
                alert('Error performing bulk action.');
            }
        });
    }

    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.banner-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    const dragDropZone = document.getElementById('dragDropZone');
    const fileInput = document.getElementById('bannerImageFile');
    const dragDropText = document.getElementById('dragDropText');

    if(dragDropZone && fileInput) {
        dragDropZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(file) {
                dragDropText.innerHTML = `Uploading: ${file.name}...`;
                const formData = new FormData();
                formData.append('image', file);
                
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    const data = await res.json();
                    if(data.success) {
                        uploadedImagePath = data.data; // e.g. /uploads/banner-xxx.jpg
                        dragDropText.innerHTML = `<span class="text-success"><i class="fas fa-check-circle"></i> Uploaded Successfully!</span>`;
                    } else {
                        dragDropText.innerHTML = `<span class="text-danger">Upload failed</span>`;
                    }
                } catch(err) {
                    console.error(err);
                    dragDropText.innerHTML = `<span class="text-danger">Upload failed</span>`;
                }
            }
        });
    }
});

// Save Form
window.saveBanner = async () => {
    const token = localStorage.getItem('token');
    
    // QR Code generation if requested
    let qr_code_data = null;
    const generateQR = document.getElementById('addBannerEnableQR').value === 'Yes';
    const qrUrl = document.getElementById('addBannerQRUrl').value;
    
    if(generateQR && qrUrl) {
        try {
            const qrRes = await fetch(`${API_URL}/generate-qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: qrUrl })
            });
            const qrData = await qrRes.json();
            if(qrData.success) {
                qr_code_data = qrData.data;
            }
        } catch(e) {
            console.error('QR Generation Failed', e);
        }
    }

    const newBanner = {
        title: document.getElementById('addBannerTitle').value,
        subtitle: document.getElementById('addBannerSubtitle').value,
        description: document.getElementById('addBannerDesc').value,
        image: uploadedImagePath || 'https://via.placeholder.com/800x400?text=No+Image', // fallback
        banner_type: document.getElementById('addBannerType').value,
        display_position: document.getElementById('addBannerPosition').value,
        priority: document.getElementById('addBannerPriority').value,
        status: document.getElementById('addBannerStatus').value,
        button_text: document.getElementById('addBannerBtnText').value,
        button_url: document.getElementById('addBannerBtnUrl').value,
        start_date: document.getElementById('addBannerStart').value,
        end_date: document.getElementById('addBannerEnd').value,
        qr_code: qr_code_data
    };

    try {
        const method = editBannerId ? 'PUT' : 'POST';
        const url = editBannerId ? `${API_URL}/${editBannerId}` : API_URL;
        
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newBanner)
        });
        const data = await res.json();
        if(data.success) {
            closeModal('bannerModal');
            document.getElementById('bannerForm').reset();
            uploadedImagePath = '';
            document.getElementById('dragDropText').innerHTML = `Drag & Drop your image here or <strong>Browse</strong>`;
            editBannerId = null;
            fetchBanners();
            fetchBannerStats();
        } else {
            alert(data.message || 'Error saving banner');
        }
    } catch(err) {
        console.error(err);
    }
};

// Chart Instances
let viewsChartInst = null;
let clicksChartInst = null;
let statusChartInst = null;
let typeChartInst = null;

// Charts
const initCharts = (chartsData) => {
    if(!chartsData) return;
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter' } } } }
    };

    const axisOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    // 1. Monthly Views (Line)
    const ctxViews = document.getElementById('viewsChart');
    if (ctxViews) {
        if(viewsChartInst) viewsChartInst.destroy();
        viewsChartInst = new Chart(ctxViews, {
            type: 'line',
            data: {
                labels: chartsData.viewsChartData.labels,
                datasets: [{
                    label: 'Total Views',
                    data: chartsData.viewsChartData.data,
                    borderColor: '#0B6B3A',
                    backgroundColor: 'rgba(11, 107, 58, 0.1)',
                    tension: 0.4, fill: true, borderWidth: 3
                }]
            },
            options: axisOptions
        });
    }

    // 2. Clicks (Line)
    const ctxClicks = document.getElementById('clicksChart');
    if (ctxClicks) {
        if(clicksChartInst) clicksChartInst.destroy();
        clicksChartInst = new Chart(ctxClicks, {
            type: 'line',
            data: {
                labels: chartsData.clicksChartData.labels,
                datasets: [{
                    label: 'Clicks',
                    data: chartsData.clicksChartData.data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4, fill: true, borderWidth: 3
                }]
            },
            options: axisOptions
        });
    }

    // 3. Status (Doughnut)
    const ctxStatus = document.getElementById('statusChart');
    if (ctxStatus) {
        if(statusChartInst) statusChartInst.destroy();
        statusChartInst = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: chartsData.statusChartData.labels,
                datasets: [{
                    data: chartsData.statusChartData.data,
                    backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: { ...chartOptions, cutout: '75%' }
        });
    }

    // 4. Type (Pie)
    const ctxType = document.getElementById('typeChart');
    if (ctxType) {
        if(typeChartInst) typeChartInst.destroy();
        typeChartInst = new Chart(ctxType, {
            type: 'pie',
            data: {
                labels: chartsData.typeChartData.labels,
                datasets: [{
                    data: chartsData.typeChartData.data,
                    backgroundColor: ['#0B6B3A', '#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#6366f1'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchBanners();
    fetchBannerStats();
    
    // Search Functionality
    const searchInput = document.getElementById('searchBanners');
    if(searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchBanners(e.target.value);
            }, 300);
        });
    }

    // Select All Checkbox
    const selectAllBtn = document.getElementById('selectAll');
    if(selectAllBtn) {
        selectAllBtn.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.banner-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    // Bulk Actions
    const bulkActionApply = document.getElementById('bulkActionApply');
    if(bulkActionApply) {
        bulkActionApply.addEventListener('click', async () => {
            const action = document.getElementById('bulkActionSelect').value;
            const checkboxes = document.querySelectorAll('.banner-checkbox:checked');
            const selectedIds = Array.from(checkboxes).map(cb => cb.value);

            if(selectedIds.length === 0) {
                alert('Please select at least one banner.');
                return;
            }
            if(!action) {
                alert('Please select a bulk action.');
                return;
            }

            if(!confirm(`Are you sure you want to ${action} ${selectedIds.length} banners?`)) return;

            const token = localStorage.getItem('token');
            for(const id of selectedIds) {
                try {
                    if(action === 'delete') {
                        await fetch(`${API_URL}/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                    } else if(action === 'activate' || action === 'deactivate') {
                        const status = action === 'activate' ? 'Active' : 'Inactive';
                        await fetch(`${API_URL}/${id}`, {
                            method: 'PUT',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({ status })
                        });
                    }
                } catch(e) {
                    console.error('Bulk action failed for', id, e);
                }
            }
            
            // Refresh
            fetchBanners(searchInput ? searchInput.value : '');
            fetchBannerStats();
            if(selectAllBtn) selectAllBtn.checked = false;
        });
    }
    // Preview Website
    const btnPreview = document.getElementById('btn-preview-website');
    if (btnPreview) {
        btnPreview.addEventListener('click', () => {
            window.open('index.html', '_blank');
        });
    }

    // Export Banner Report
    const btnExport = document.getElementById('btn-export-report');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            if (liveBanners.length === 0) {
                alert('No banners to export.');
                return;
            }
            
            // CSV Header
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "ID,Title,Status,Priority,Type,Position,Views,Clicks,Start Date,End Date\n";
            
            // CSV Rows
            liveBanners.forEach(b => {
                const row = [
                    b.banner_id || '',
                    `"${(b.title || '').replace(/"/g, '""')}"`,
                    b.status || '',
                    b.priority || '',
                    b.banner_type || '',
                    b.display_position || '',
                    b.views || 0,
                    b.clicks || 0,
                    b.start_date ? b.start_date.split('T')[0] : '',
                    b.end_date ? b.end_date.split('T')[0] : ''
                ].join(',');
                csvContent += row + "\n";
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `banners_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});
