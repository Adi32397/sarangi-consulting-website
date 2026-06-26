/* ==================================================
   BANNER MANAGEMENT MODULE SCRIPTS
================================================== */

// SAMPLE DATA: 8 Realistic Banners
const sampleBanners = [
    {
        id: 'BN001', title: 'Empowering Businesses with Expert Consulting', subtitle: 'Grow your business with Sarangi Consulting.', 
        type: 'Homepage Hero', position: 'Homepage', priority: 1, 
        startDate: '2026-07-01', endDate: '2026-07-31', status: 'Active', 
        qr: true, creator: 'Admin', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN002', title: 'Startup Funding Assistance', subtitle: 'Apply for funding consultation.', 
        type: 'Campaign', position: 'Homepage', priority: 2, 
        startDate: '2026-07-05', endDate: '2026-07-30', status: 'Scheduled', 
        qr: true, creator: 'Samuel', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN003', title: 'Q3 Financial Advisory Services', subtitle: 'Optimize your corporate tax strategy.', 
        type: 'Service Banner', position: 'Services', priority: 1, 
        startDate: '2026-06-01', endDate: '2026-08-31', status: 'Active', 
        qr: false, creator: 'Admin', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN004', title: 'New Office Opening in Dubai', subtitle: 'Join us for our international expansion launch.', 
        type: 'Announcement', position: 'Sidebar', priority: 3, 
        startDate: '2026-06-15', endDate: '2026-06-25', status: 'Expired', 
        qr: false, creator: 'HR Team', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN005', title: 'Free SEO Audit for SMEs', subtitle: 'Limited time offer for new clients.', 
        type: 'Promotion', position: 'Footer', priority: 4, 
        startDate: '2026-07-10', endDate: '2026-07-20', status: 'Draft', 
        qr: true, creator: 'Marketing', image: 'https://images.unsplash.com/photo-1572061486714-25e24391219b?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN006', title: 'Annual General Meeting 2026', subtitle: 'Register for our virtual shareholder event.', 
        type: 'Event Banner', position: 'About', priority: 2, 
        startDate: '2026-07-01', endDate: '2026-07-15', status: 'Scheduled', 
        qr: true, creator: 'Admin', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN007', title: 'Award Winning Consultants', subtitle: 'Voted Best B2B Agency 2025.', 
        type: 'Announcement', position: 'Homepage', priority: 5, 
        startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active', 
        qr: false, creator: 'PR Dept', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80'
    },
    {
        id: 'BN008', title: 'End of Year Clearance Strategy', subtitle: 'Maximize your Q4 retail profits.', 
        type: 'Campaign', position: 'Services', priority: 2, 
        startDate: '2025-11-01', endDate: '2025-12-31', status: 'Expired', 
        qr: true, creator: 'Samuel', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=150&q=80'
    }
];

// Helper: Format Date
const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
};

// Helper: Get Badge HTML
const getBadge = (status) => {
    const lower = status.toLowerCase();
    return `<span class="badge badge-${lower}">${status}</span>`;
};

// Render CMS Table
const renderBannersTable = () => {
    const tbody = document.getElementById('bannersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sampleBanners.forEach(banner => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td data-label="Select"><input type="checkbox"></td>
            <td data-label="Priority"><i class="fas fa-grip-vertical text-muted mr-10" style="cursor: grab;"></i> ${banner.priority}</td>
            <td data-label="Image"><img src="${banner.image}" class="banner-thumb" alt="Thumb"></td>
            <td data-label="Info">
                <span class="banner-title">${banner.title}</span>
                <span class="banner-subtitle" title="${banner.subtitle}">${banner.subtitle}</span>
                <span class="text-muted" style="font-size: 11px;">ID: ${banner.id}</span>
            </td>
            <td data-label="Display">
                <div style="font-size: 13px; font-weight: 600; color: #1e293b;">${banner.position}</div>
                <div style="font-size: 12px; color: #64748b;">${banner.type}</div>
            </td>
            <td data-label="Timeline">
                <div style="font-size: 12px; color: #64748b;"><i class="far fa-calendar-alt mr-10"></i>${formatDate(banner.startDate)}</div>
                <div style="font-size: 12px; color: #64748b;"><i class="far fa-calendar-times mr-10"></i>${formatDate(banner.endDate)}</div>
            </td>
            <td data-label="Status/QR">
                ${getBadge(banner.status)}
                <div class="mt-10">
                    <span class="qr-badge ${banner.qr ? 'enabled' : ''}">
                        <i class="fas fa-qrcode"></i> ${banner.qr ? 'QR Ready' : 'No QR'}
                    </span>
                </div>
            </td>
            <td data-label="Actions" class="text-right">
                <div class="action-buttons">
                    <button class="icon-btn icon-primary" title="View" onclick="viewBanner('${banner.id}')"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn icon-warning" title="Edit" onclick="openAddBannerModal()"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn" title="Generate QR"><i class="fas fa-qrcode"></i></button>
                    <button class="icon-btn icon-danger" title="Delete" onclick="openDeleteModal()"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Render Active Campaigns
const renderActiveCampaigns = () => {
    const list = document.getElementById('campaignsList');
    if (!list) return;

    const activeCampaigns = sampleBanners.filter(b => b.status === 'Active' && b.type.includes('Campaign') || b.type.includes('Service'));
    
    list.innerHTML = '';
    activeCampaigns.forEach(camp => {
        list.innerHTML += `
            <div class="campaign-item">
                <img src="${camp.image}" class="campaign-img" alt="Campaign">
                <div>
                    <h4 style="font-family: 'Montserrat'; font-size: 16px; margin-bottom: 4px; color: #0f172a;">${camp.title}</h4>
                    <p style="font-size: 13px; color: #64748b; margin: 0;">Running: ${formatDate(camp.startDate)} - ${formatDate(camp.endDate)}</p>
                </div>
                <div class="campaign-stat">
                    <span>Views</span>
                    <strong>45.2k</strong>
                </div>
                <div class="campaign-stat">
                    <span>Clicks</span>
                    <strong class="text-primary">8.4k</strong>
                </div>
                <div class="campaign-stat">
                    <span>CTR</span>
                    <strong class="text-success">18.5%</strong>
                </div>
            </div>
        `;
    });
};

// Modals
window.openAddBannerModal = () => {
    document.getElementById('bannerModal').classList.add('active');
};
window.closeModal = (id) => {
    document.getElementById(id).classList.remove('active');
};
window.viewBanner = (id) => {
    const banner = sampleBanners.find(b => b.id === id);
    if (banner) {
        document.getElementById('viewBannerTitle').innerText = banner.title;
        document.getElementById('viewBannerImg').src = banner.image;
        document.getElementById('viewBannerId').innerText = banner.id;
        document.getElementById('viewBannerStatus').innerHTML = getBadge(banner.status);
        document.getElementById('viewBannerSubtitle').innerText = banner.subtitle;
        document.getElementById('viewBannerType').innerText = banner.type;
        document.getElementById('viewBannerPos').innerText = banner.position;
        document.getElementById('viewBannerPriority').innerText = banner.priority;
        document.getElementById('viewBannerCreator').innerText = banner.creator;
        document.getElementById('viewBannerStart').innerText = formatDate(banner.startDate);
        document.getElementById('viewBannerEnd').innerText = formatDate(banner.endDate);
        document.getElementById('viewBannerBtn').innerText = "Learn More";
        document.getElementById('viewBannerBtn').href = "#";
        
        document.getElementById('viewBannerModal').classList.add('active');
    }
};
window.openDeleteModal = () => {
    document.getElementById('deleteBannerModal').classList.add('active');
};
window.confirmDelete = () => {
    closeModal('deleteBannerModal');
    alert('Banner deleted successfully!');
};
window.saveBanner = () => {
    closeModal('bannerModal');
    alert('Banner saved successfully!');
};

// Charts
const initCharts = () => {
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter' } } } }
    };

    // 1. Monthly Views (Line)
    const ctxViews = document.getElementById('viewsChart');
    if (ctxViews) {
        new Chart(ctxViews, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Total Views',
                    data: [12000, 19000, 15000, 22000, 28000, 35000],
                    borderColor: '#0B6B3A',
                    backgroundColor: 'rgba(11, 107, 58, 0.1)',
                    tension: 0.4, fill: true, borderWidth: 3
                }]
            },
            options: chartOptions
        });
    }

    // 2. Clicks (Bar)
    const ctxClicks = document.getElementById('clicksChart');
    if (ctxClicks) {
        new Chart(ctxClicks, {
            type: 'bar',
            data: {
                labels: ['Hero Banner', 'Promo 1', 'Service', 'Footer Ad'],
                datasets: [{
                    label: 'Clicks',
                    data: [8500, 4200, 3800, 1750],
                    backgroundColor: '#1d4ed8',
                    borderRadius: 6
                }]
            },
            options: chartOptions
        });
    }

    // 3. Status (Doughnut)
    const ctxStatus = document.getElementById('statusChart');
    if (ctxStatus) {
        new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Scheduled', 'Expired', 'Draft'],
                datasets: [{
                    data: [12, 3, 2, 1],
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
        new Chart(ctxType, {
            type: 'pie',
            data: {
                labels: ['Homepage', 'Promotion', 'Announcement', 'Campaign'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#0B6B3A', '#10b981', '#0ea5e9', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: chartOptions
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderBannersTable();
    renderActiveCampaigns();
    setTimeout(initCharts, 100);
});
