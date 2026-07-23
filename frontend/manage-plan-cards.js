/* ==================================================
   PLAN CARDS MODULE SCRIPTS
================================================== */

let liveCards = [];
const API_URL = `${API_BASE_URL}/api/pricing-cards`;

// Fetch Cards on Load
document.addEventListener('DOMContentLoaded', () => {
    fetchCards();
    
    // Save button listener
    document.getElementById('saveCardBtn').addEventListener('click', saveCard);
});

async function fetchCards() {
    const token = localStorage.getItem('token') || '';
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            liveCards = data.data;
            renderTable();
            updateStats();
        } else {
            console.error('Failed to fetch cards:', data.message);
        }
    } catch (err) {
        console.error('Error fetching cards:', err);
    }
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('cardsTableBody');
    if (!tbody) return;
    
    if (liveCards.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No plan cards found.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = liveCards.map(c => {
        const badge = c.is_highlighted 
            ? `<span class="badge badge-highlight"><i class="fas fa-star"></i> Highlighted</span>` 
            : `<span class="badge badge-standard">Standard</span>`;
            
        // --- ADDED TOGGLE LOGIC HERE ---
        const isActive = c.is_active !== false; 
        const toggleBtnText = isActive ? 'Deactivate' : 'Activate';
        const toggleBtnColor = isActive ? '#f59e0b' : '#10b981'; // Orange to deactivate, Green to activate
        const toggleIcon = isActive ? 'fa-eye-slash' : 'fa-eye';
        // -------------------------------

        return `
        <tr onclick="updatePreview(${c.id})">
            <td onclick="event.stopPropagation()"><input type="checkbox" class="row-checkbox" value="${c.id}"></td>
            <td style="font-weight: 700; color: #94a3b8;">#${c.order_index}</td>
            <td class="plan-info">
                <strong>${c.title}</strong>
                <span>${c.description.substring(0, 40)}${c.description.length > 40 ? '...' : ''}</span>
            </td>
            <td class="plan-info">
                <strong style="color: var(--primary-green);">${c.price_active}</strong>
                ${c.price_strike ? `<span style="text-decoration: line-through;">${c.price_strike}</span>` : '<span>-</span>'}
            </td>
            <td>${badge}</td>
            <td onclick="event.stopPropagation()">
                <div class="action-buttons">
                    <button class="icon-btn" title="Edit" onclick="openModal('cardModal', 'edit', ${c.id})"><i class="fas fa-edit"></i></button>
                    
                    <button class="icon-btn" title="${toggleBtnText}" style="color: ${toggleBtnColor};" onclick="toggleCardStatus(${c.id}, ${isActive})"><i class="fas ${toggleIcon}"></i></button>
                    
                    <button class="icon-btn icon-danger" title="Delete" onclick="deleteCard(${c.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');
    
    setupCheckboxes();
    
    // Auto-preview the first card if available
    if (liveCards.length > 0) updatePreview(liveCards[0].id);
}

// Update Top Stats
function updateStats() {
    const highlightedCount = liveCards.filter(c => c.is_highlighted).length;
    document.getElementById('statTotalCards').innerText = liveCards.length;
    document.getElementById('statHighlighted').innerText = highlightedCount;
}

// Update Right Sidebar Preview
function updatePreview(id) {
    const card = liveCards.find(x => x.id === id);
    if (!card) return;
    
    const previewContainer = document.getElementById('livePreviewContainer');
    
    // 1. Determine Dynamic CSS Classes
    const isFeatured = card.is_highlighted ? 'featured' : '';
    const buttonClass = card.is_highlighted ? 'btn-primary' : 'btn-outline-green';
    const buttonText = card.is_highlighted ? 'Register My Advisory Session' : 'Schedule a Discovery Call';
    
    // 2. Handle Optional Elements
    const badgeHtml = card.urgency_text 
        ? `<div class="badge-pulse">${card.urgency_text}</div>` 
        : '';
        
    const strikeHtml = card.price_strike 
        ? `<div class="price-strike">${card.price_strike}</div>` 
        : '';

    // 3. Build the Bullet Points HTML
    let featuresListHtml = '';
    if (card.features && Array.isArray(card.features)) {
        const liItems = card.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');
        featuresListHtml = `<ul class="pricing-list">${liItems}</ul>`;
    }

    // 4. Inject 1:1 Public Card HTML
    previewContainer.innerHTML = `
        <div class="pricing-card ${isFeatured}" style="margin: 0 auto; cursor: default;">
            ${badgeHtml}
            <h3>${card.title}</h3>
            <p class="desc">${card.description}</p>
            
            <div class="price-box">
                ${strikeHtml}
                <div class="price-active">${card.price_active}</div>
                
                <div class="countdown-wrapper">
                    <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Offer expires in:</span>
                    <div class="timer-display">
                        <div class="time-box"><span class="t-hours">00</span><small>HRS</small></div>:
                        <div class="time-box"><span class="t-mins">00</span><small>MIN</small></div>:
                        <div class="time-box"><span class="t-secs">00</span><small>SEC</small></div>
                    </div>
                </div>
            </div>

            ${featuresListHtml}

            <button class="btn ${buttonClass}" style="width: 100%; justify-content: center; pointer-events: none;">${buttonText}</button>
        </div>
    `;
}

// Modal Management
function openModal(modalId, mode, id = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    document.getElementById('modalMode').value = mode;
    document.getElementById('cardForm').reset();
    
    if (mode === 'add') {
        document.getElementById('modalTitle').innerText = 'Create New Plan';
        document.getElementById('cardId').value = '';
    } else if (mode === 'edit' && id) {
        document.getElementById('modalTitle').innerText = 'Edit Plan Card';
        const c = liveCards.find(x => x.id === id);
        if (c) {
            document.getElementById('cardId').value = c.id;
            document.getElementById('cardTitle').value = c.title;
            document.getElementById('cardDescription').value = c.description;
            document.getElementById('priceStrike').value = c.price_strike || '';
            document.getElementById('priceActive').value = c.price_active;
            document.getElementById('urgencyText').value = c.urgency_text || '';
            document.getElementById('orderIndex').value = c.order_index;
            document.getElementById('isHighlighted').checked = c.is_highlighted;
            // When opening the modal, set the value:
            document.getElementById('cardButtonText').value = c.button_text || (c.is_highlighted ? 'Register My Advisory Session' : 'Schedule a Discovery Call');
            
            if (c.features && Array.isArray(c.features)) {
                document.getElementById('cardFeatures').value = c.features.join(', ');
            }
        }
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Save (Create/Update) Card
async function saveCard() {
    const mode = document.getElementById('modalMode').value;
    const id = document.getElementById('cardId').value;
    const token = localStorage.getItem('token') || '';
    
    // Process Features Array
    const featuresInput = document.getElementById('cardFeatures').value;
    const featuresArray = featuresInput.split(',').map(f => f.trim()).filter(f => f.length > 0);

    const payload = {
        title: document.getElementById('cardTitle').value,
        description: document.getElementById('cardDescription').value,
        features: featuresArray,
        price_strike: document.getElementById('priceStrike').value || null,
        price_active: document.getElementById('priceActive').value,
        urgency_text: document.getElementById('urgencyText').value || null,
        order_index: parseInt(document.getElementById('orderIndex').value || 0),
        button_text: document.getElementById('cardButtonText').value,
        is_highlighted: document.getElementById('isHighlighted').checked
    };

    try {
        const url = mode === 'edit' ? `${API_URL}/${id}` : API_URL;
        const method = mode === 'edit' ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.success) {
            closeModal('cardModal');
            fetchCards();
        } else {
            alert(data.message || 'Error saving card');
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('Failed to communicate with server.');
    }
}

// Delete Single Card
async function deleteCard(id) {
    if(!confirm('Are you sure you want to delete this pricing card? It will be removed from the public website instantly.')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) fetchCards();
    } catch(err) {
        console.error(err);
    }
}

// Checkboxes & Bulk Delete Logic
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
            cb.addEventListener('change', (e) => {
                e.stopPropagation(); // prevent row click preview trigger
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

async function bulkDelete() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.value);
    
    if (ids.length === 0) {
        alert('Please select at least one card.');
        return;
    }
    
    if (!confirm(`Are you SURE you want to delete ${ids.length} cards from the public website?`)) return;

    const token = localStorage.getItem('token') || '';
    try {
        await Promise.all(ids.map(id => 
            fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ));
        fetchCards();
    } catch (err) {
        console.error(err);
        alert('An error occurred during bulk deletion.');
    }
}

// Toggle Active/Inactive Status
async function toggleCardStatus(id, currentStatus) {
    const newStatus = !currentStatus;
    const token = localStorage.getItem('token');

    // --- THE FIX: Find the existing card so we can send all required fields ---
    const existingCard = liveCards.find(c => c.id === id);
    if (!existingCard) {
        alert("Card data not found in memory.");
        return;
    }

    // Merge the existing card data with the new status to satisfy the backend validator
    const payload = {
        ...existingCard,
        is_active: newStatus
    };

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload) // Sending the full card
        });
        
        const data = await res.json();
        if (data.success) {
            fetchCards(); // Reload the cards to show the updated button
        } else {
            alert('Error updating status: ' + (data.message || data.error));
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Failed to update status');
    }
}