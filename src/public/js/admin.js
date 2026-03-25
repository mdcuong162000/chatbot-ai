const socket = io();
let currentModule = 'inbox';
let activeMarket = localStorage.getItem('active_market') || 'TH';
let currentConvId = null;

// --- Core UI Navigation ---
function switchModule(module, el) {
    currentModule = module;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.module-content').forEach(c => c.classList.remove('active'));

    el.classList.add('active');
    document.getElementById(`module-${module}`).classList.add('active');

    // Data loading per module
    if (module === 'inbox') loadConversations();
    if (module === 'training') loadFaqs();
    if (module === 'inventory') loadProducts();
    if (module === 'crm') loadCustomers();
    if (module === 'analytics') loadAnalytics();
    if (module === 'settings') loadSettings();
}

function switchGlobalMarket(val) {
    activeMarket = val;
    localStorage.setItem('active_market', val);
    // Reload current module with new market context
    if (currentModule === 'training') loadFaqs();
    if (currentModule === 'inventory') loadProducts();
}

function closeAllModals() {
    document.querySelectorAll('.fixed-overlay').forEach(o => o.style.display = 'none');
}

// --- INBOX LOGIC ---
async function loadConversations() {
    try {
        const res = await fetch('/api/admin/conversations');
        const data = await res.json();
        const container = document.getElementById('conv-list');
        if (!container) return;
        container.innerHTML = data.map(c => `
            <div class="item-card ${currentConvId === c.id ? 'active' : ''}" onclick="selectConv('${c.id}', '${c.name.replace(/'/g, "\\'")}')">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${c.name}</strong>
                    <span class="badge ${c.status === 'human_takeover' ? 'badge-alert' : 'b-market'}">${c.status === 'human_takeover' ? 'Xâm nhập' : c.channel}</span>
                </div>
                <div style="font-size:11px; color:var(--text-dim); margin-top:6px;">${new Date(c.started_at).toLocaleTimeString()}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load conversations:', e);
    }
}

async function selectConv(id, name) {
    currentConvId = id;
    const header = document.getElementById('chat-header');
    if (header) header.innerHTML = `<h3>Hội thoại: ${name}</h3>`;
    const inputCont = document.getElementById('chat-input-container');
    if (inputCont) inputCont.style.display = 'flex';
    loadConversations(); // highlight active

    const res = await fetch(`/api/admin/conversations/${id}/messages`);
    const msgs = await res.json();
    const container = document.getElementById('chat-messages');
    if (container) {
        container.innerHTML = msgs.map(m => {
            let roleClass = 'bot';
            if(m.role === 'user') roleClass = 'user';
            if(m.role === 'system_human') roleClass = 'system';
            return `<div class="bubble ${roleClass}">${m.content}</div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    }

    // Load Metadata
    const resMeta = await fetch(`/api/admin/conversations/${id}/metadata`);
    const meta = await resMeta.json();
    const crmPanel = document.getElementById('crm-content');
    if (meta && crmPanel) {
        crmPanel.innerHTML = `
            <div style="padding: 16px; background: var(--glass-bg); border-radius: 12px; margin-bottom: 12px;">
                <div style="margin-bottom: 8px;"><strong>Hạng:</strong> <span class="badge ${meta.priority_level === 'VIP' ? 'b-vip' : ''}">${meta.priority_level}</span></div>
                <div style="margin-bottom: 8px;"><strong>Cấp:</strong> ${meta.status}</div>
                <div style="margin-bottom: 8px;"><strong>Tổng đơn:</strong> ${meta.total_orders}</div>
                <div style="margin-bottom: 8px;"><strong>SĐT:</strong> ${meta.phone || 'N/A'}</div>
            </div>
        `;
    }
}

async function sendMessage() {
    const input = document.getElementById('admin-input');
    const txt = input ? input.value.trim() : '';
    if (!txt || !currentConvId) return;
    await fetch(`/api/admin/conversations/${currentConvId}/messages`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content: txt })
    });
    if (input) input.value = '';
    selectConv(currentConvId, '...'); 
}

async function takeoverBot() {
    if (!currentConvId) return;
    await fetch(`/api/admin/conversations/${currentConvId}/takeover`, { method: 'POST' });
    alert('Đã chặn AI. Sếp toàn quyền trả lời!');
    loadConversations();
}

// --- TRAINING HUB LOGIC ---
function showFaqModal() {
    const modal = document.getElementById('faq-modal');
    if (modal) modal.style.display = 'flex';
}

async function loadFaqs() {
    const res = await fetch('/api/admin/faqs');
    const data = await res.json();
    const container = document.getElementById('faq-grid');
    if (!container) return;
    const filtered = data.filter(f => f.market_code === activeMarket);
    container.innerHTML = filtered.map(f => `
        <div class="faq-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <span class="badge b-market">${f.market_code}</span>
                <div style="display:flex; gap:8px;">
                    <button class="nav-icon" style="font-size:14px;" onclick="editFaq('${f.id}')">✏️</button>
                    <button class="nav-icon" style="font-size:14px; color:var(--danger)" onclick="deleteFaq('${f.id}')">🗑️</button>
                </div>
            </div>
            <strong>Q: ${f.question}</strong>
            <p style="font-size: 13px; color: var(--text-dim); margin-top: 8px;">A: ${f.answer}</p>
        </div>
    `).join('');
}

// --- EXCEL IMPORT ---
function openExcelModal() { 
    const modal = document.getElementById('excel-modal');
    if (modal) modal.style.display = 'flex';
}

async function handleImport() {
    const fileInput = document.getElementById('excel-file-input');
    if(!fileInput || !fileInput.files[0]) return alert('Vui lòng chọn file!');
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    const res = await fetch('/api/admin/faqs/import', {
        method: 'POST',
        body: formData
    });
    const result = await res.json();
    alert(`Đã nạp thành công kịch bản mới cho thị trường ${activeMarket}!`);
    closeAllModals();
    loadFaqs();
}

// --- INVENTORY ---
async function loadProducts() {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    const container = document.getElementById('product-grid');
    if (!container) return;
    const filtered = data.filter(p => p.market_code === activeMarket);
    container.innerHTML = filtered.map(p => `
        <div class="faq-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span class="badge b-market">${p.industry}</span>
                <span class="badge b-market">${p.market_code}</span>
            </div>
            <h3 style="margin-top:10px;">${p.name}</h3>
            <p style="color:var(--primary); font-weight:700; font-size:1.1em; margin:8px 0;">${p.price} B</p>
            <p style="font-size:12px; color:var(--text-dim); line-height:1.4;">${p.fits_who}</p>
        </div>
    `).join('');
}

// --- CRM ---
async function loadCustomers() {
    const res = await fetch('/api/admin/customers');
    const data = await res.json();
    const container = document.getElementById('customer-grid');
    if (!container) return;
    container.innerHTML = data.map(c => `
        <div class="faq-card" style="border-left: 4px solid ${c.priority_level === 'VIP' ? '#facc15' : 'var(--glass-border)'}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <strong>${c.name || 'Khách ẩn danh'}</strong>
                <span class="badge ${c.priority_level === 'VIP' ? 'b-vip' : 'b-market'}">${c.priority_level}</span>
            </div>
            <div style="font-size:13px; color:var(--text-dim);">
                <div>📍 Stage: ${c.stage}</div>
                <div>📦 Đơn: ${c.total_orders}</div>
            </div>
        </div>
    `).join('');
}

// --- MARKETING hub ---
function showMarketingModal(type) {
    const modal = document.getElementById('marketing-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    const title = document.getElementById('mkt-title');
    const script = document.getElementById('mkt-script');
    if (type === 'abandoned_cart') {
        if (title) title.innerText = 'Cấu hình Abandoned Cart';
        if (script) script.value = 'Chào {{name}}, mình thấy bạn còn đơn hàng chưa hoàn tất...';
    } else if (type === 'birthday') {
        if (title) title.innerText = 'Cấu hình Chúc mừng Sinh nhật';
        if (script) script.value = 'Chúc mừng sinh nhật {{name}}!';
    } else {
        if (title) title.innerText = 'Cấu hình Thu thập Feedback';
        if (script) script.value = 'Chào {{name}}, cho shop xin feedback nhé!';
    }
}

// --- SETTINGS ---
async function loadSettings() {
    const res = await fetch('/api/admin/settings');
    const s = await res.json();
    const personaEl = document.getElementById('s-persona');
    const tempEl = document.getElementById('s-temp');
    const thresholdEl = document.getElementById('s-threshold');
    const marketEl = document.getElementById('s-market');
    const tempValDisp = document.getElementById('temp-val');

    if (personaEl) personaEl.value = s.ai_persona || '';
    if (tempEl) tempEl.value = s.ai_temperature || 0.7;
    if (tempValDisp) tempValDisp.innerText = s.ai_temperature || 0.7;
    if (thresholdEl) thresholdEl.value = s.escalate_threshold || 5000000;
    if (marketEl) {
        marketEl.value = s.market_code || 'TH';
        activeMarket = s.market_code || 'TH';
    }
}

async function updateSetting(key, value) {
    if (key === 'ai_temperature') {
        const valDisp = document.getElementById('temp-val');
        if (valDisp) valDisp.innerText = value;
    }
    if (key === 'market_code') switchGlobalMarket(value);
    
    await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key, value })
    });
}

// --- ANALYTICS [NEW Phase 14] ---
async function loadAnalytics() {
    try {
        // 1. Load Overview
        const resOver = await fetch('/api/admin/analytics/overview');
        const over = await resOver.json();
        document.getElementById('ana-revenue').innerText = `${over.total_revenue.toLocaleString()} B`;
        document.getElementById('ana-cr').innerText = over.conversion_rate;
        document.getElementById('ana-sales').innerText = over.total_sales;

        // 2. Load Top Products
        const resTop = await fetch('/api/admin/analytics/top-products');
        const topProds = await resTop.json();
        const topContainer = document.getElementById('ana-top-products');
        topContainer.innerHTML = topProds.map(p => `
            <div class="faq-card" style="padding: 15px;">
                <div style="font-weight: 600;">${p.name}</div>
                <div style="font-size: 13px; color: var(--primary); margin-top: 5px;">${p.sales_count} đơn - ${p.total_revenue.toLocaleString()} B</div>
            </div>
        `).join('') || '<p style="color:var(--text-dim)">Chưa có dữ liệu bán hàng.</p>';

        // 3. Load Segments
        const resSeg = await fetch('/api/admin/analytics/customer-segments');
        const segments = await resSeg.json();
        const segContainer = document.getElementById('ana-segments');
        segContainer.innerHTML = segments.map(s => `
            <div class="faq-card" style="padding: 15px;">
                <div style="font-weight: 600;">${s.segment.toUpperCase()}</div>
                <div style="font-size: 13px; color: var(--text-dim); margin-top: 5px;">${s.count} khách - ${s.total_orders} đơn hàng</div>
            </div>
        `).join('');

    } catch (e) {
        console.error('Failed to load analytics:', e);
    }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    loadSettings();
});
