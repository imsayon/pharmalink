// Main JavaScript for PharmaLink

// Custom Toast Notification System
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `<i data-feather="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    if (typeof feather !== 'undefined') feather.replace();
    
    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

window.viewHistory = async function(customerId) {
    try {
        const res = await fetch(`/api/customers/${customerId}/history`);
        const data = await res.json();
        if (data.success) {
            const content = document.getElementById('history-content');
            if (data.history.length === 0) {
                content.innerHTML = '<p style="color: var(--text-muted);">No purchase history found for this customer.</p>';
            } else {
                content.innerHTML = `
                <table class="modern-table">
                    <thead><tr><th>Bill ID</th><th>Date</th><th>Total Amount</th></tr></thead>
                    <tbody>
                        ${data.history.map(h => `<tr>
                            <td style="font-weight:500;">#${h.bill_id}</td>
                            <td>${new Date(h.bill_date).toLocaleDateString()} ${new Date(h.bill_date).toLocaleTimeString()}</td>
                            <td style="font-weight:bold; color:var(--primary);">$${h.total_amount}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
            }
            openModal('historyModal');
        } else {
            showToast(data.error, 'error');
        }
    } catch (err) {
        showToast('Error fetching history', 'error');
    }
};

let currentCart = [];
let currentCustomers = [];
let currentMedicines = [];

function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Attach listener to medicine form
document.addEventListener('DOMContentLoaded', () => {
    const medForm = document.getElementById('medicineForm');
    if (medForm) {
        medForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(medForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const res = await fetch('/api/medicines/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Medicine added successfully');
                    closeModal('medicineModal');
                    medForm.reset();
                    loadPage('medicines'); // reload page
                } else {
                    showToast(result.error, 'error');
                }
            } catch (err) {
                showToast('Error adding medicine: ' + err.message, 'error');
            }
        });
    }

    const custForm = document.getElementById('customerForm');
    if (custForm) {
        custForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(custForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const res = await fetch('/api/customers/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Customer added successfully');
                    closeModal('customerModal');
                    custForm.reset();
                    loadPage('customers');
                } else {
                    showToast(result.error, 'error');
                }
            } catch (err) {
                showToast('Error adding customer: ' + err.message, 'error');
            }
        });
    }

    const suppForm = document.getElementById('supplierForm');
    if (suppForm) {
        suppForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(suppForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const res = await fetch('/api/suppliers/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Supplier added successfully');
                    closeModal('supplierModal');
                    suppForm.reset();
                    loadPage('suppliers');
                } else {
                    showToast(result.error, 'error');
                }
            } catch (err) {
                showToast('Error adding supplier: ' + err.message, 'error');
            }
        });
    }
});

// For Billing Add item:
function addToCart(medId) {
    const med = currentMedicines.find(m => m.medicine_id == medId);
    if (!med) return;
    if (med.stock_quantity <= 0) return showToast('Out of stock!', 'error');
    
    const existing = currentCart.find(i => i.medicine_id == medId);
    if (existing) {
        if (existing.quantity >= med.stock_quantity) {
            return showToast('Cannot add more than available stock', 'error');
        }
        existing.quantity += 1;
        existing.subtotal = existing.quantity * parseFloat(med.price);
    } else {
        currentCart.push({
            medicine_id: med.medicine_id,
            medicine_name: med.medicine_name,
            price: parseFloat(med.price),
            quantity: 1,
            subtotal: parseFloat(med.price)
        });
    }
    renderCart();
}

window.deleteItem = async function(type, id) {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
        const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Deleted successfully');
            loadPage(type);
        } else {
            showToast(data.error || 'Cannot delete item because it is referenced elsewhere', 'error');
        }
    } catch (err) {
        showToast('Error deleting item', 'error');
    }
}

function removeFromCart(medId) {
    currentCart = currentCart.filter(i => i.medicine_id != medId);
    renderCart();
}

function renderCart() {
    const cartDiv = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    if (!cartDiv || !totalDiv) return;

    if (currentCart.length === 0) {
        cartDiv.innerHTML = `<div style="min-height: 200px; display:flex; align-items:center; justify-content:center; color: var(--text-muted); border: 2px dashed rgba(0,0,0,0.1); border-radius: var(--radius-lg); margin-bottom: 1rem;">No items added yet.</div>`;
        totalDiv.textContent = '$0.00';
        return;
    }

    let total = 0;
    cartDiv.innerHTML = `
        <table class="modern-table" style="margin-bottom: 1rem;">
            <thead><tr><th>Item</th><th>Qty</th><th>Sub</th><th></th></tr></thead>
            <tbody>
                ${currentCart.map(item => {
                    total += item.subtotal;
                    return `
                    <tr>
                        <td style="font-size:0.9rem;">${item.medicine_name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.subtotal.toFixed(2)}</td>
                        <td><button onclick="removeFromCart(${item.medicine_id})" style="color:red; border:none; background:none; cursor:pointer;"><i data-feather="x-circle" style="width:16px;"></i></button></td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    totalDiv.textContent = `$${total.toFixed(2)}`;
    if (typeof feather !== 'undefined') feather.replace();
}

async function processPayment() {
    if (currentCart.length === 0) return showToast('Cart is empty!', 'error');
    const customerSelect = document.getElementById('billing-customer');
    if (!customerSelect.value) return showToast('Select a customer!', 'error');

    const totalAmount = currentCart.reduce((sum, item) => sum + item.subtotal, 0);

    try {
        const res = await fetch('/api/billing/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: customerSelect.value,
                items: currentCart,
                total_amount: totalAmount,
                payment_method: 'Cash'
            })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Payment processed! Bill ID: ' + result.bill_id);
            currentCart = [];
            loadPage('billing');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (err) {
        showToast('Payment failed: ' + err.message, 'error');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if(window.salesChart) {
        window.salesChart.options.scales.x.ticks.color = isDark ? '#94a3b8' : '#64748b';
        window.salesChart.options.scales.y.ticks.color = isDark ? '#94a3b8' : '#64748b';
        window.salesChart.options.plugins.legend.labels.color = isDark ? '#94a3b8' : '#64748b';
        window.salesChart.update();
    }
}



window.currentPage = '';

async function loadPage(page, navElement = null) {
	const content = document.getElementById("content")
    
    // Clear search if changing pages
    if (window.currentPage !== page) {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = '';
            // Don't dispatch event here, we are about to re-render anyway
        }
        window.currentPage = page;
    }

    // Handle navigation active state
    if (navElement) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        navElement.classList.add('active');
    }

    if (page === 'settings') {
        content.innerHTML = renderPage(page, null);
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

	try {
        // Add loading state
        content.innerHTML = `<div class="glass-card" style="display:flex; align-items:center; justify-content:center; padding: 3rem; gap: 1rem;"><i data-feather="loader" class="spin"></i> Loading...</div>`;
        if (typeof feather !== 'undefined') feather.replace();

        const simDate = localStorage.getItem('simDate') || '';
		const response = await fetch(`/api/${page}${simDate ? '?simDate=' + simDate : ''}`)
		const data = await response.json()
		
        // Add slight delay for smooth transition effect
        setTimeout(() => {
            content.innerHTML = renderPage(page, data)
            content.classList.remove('fade-in');
            void content.offsetWidth; // trigger reflow
            content.classList.add('fade-in');
            if (typeof feather !== 'undefined') feather.replace();
            
            // Re-trigger global search if active
            const searchInput = document.getElementById('global-search');
            if (searchInput && searchInput.value) {
                searchInput.dispatchEvent(new Event('input'));
            }
        }, 150);
	} catch (error) {
		content.innerHTML = `<div class="glass-card"><h3 style="color:var(--danger)">Error</h3><p>${error.message}</p></div>`
	}
}

function renderPage(page, data) {
	switch (page) {
		case "dashboard":
			return `
            <h1 class="page-title">Dashboard</h1>
            <div class="stats-grid">
                <div class="glass-card stat-card">
                    <span class="stat-title">Total Medicines</span>
                    <span class="stat-value">${data.totalMedicines}</span>
                </div>
                <div class="glass-card stat-card">
                    <span class="stat-title">Total Sales</span>
                    <span class="stat-value">$${Number(data.totalSales).toFixed(2)}</span>
                </div>
                <div class="glass-card stat-card">
                    <span class="stat-title">Low Stock Alerts</span>
                    <span class="stat-value" style="color: #F59E0B">${data.lowStockCount || 0}</span>
                </div>
                <div class="glass-card stat-card">
                    <span class="stat-title">Expiring Soon</span>
                    <span class="stat-value" style="color: #EF4444">${data.expiringCount || 0}</span>
                </div>
            </div>
            
            <div class="glass-card">
                <h3 style="margin-bottom: 1rem;">Recent Transactions</h3>
                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Bill ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(data.recentBills || []).map(b => `
                            <tr>
                                <td>#${b.bill_id}</td>
                                <td style="font-weight: 500;">${b.customer_name}</td>
                                <td>${new Date(b.bill_date).toLocaleDateString()}</td>
                                <td style="font-weight: 600;">$${b.total_amount}</td>
                                <td><span class="badge success">Paid</span></td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

		case "medicines":
            const supplierSelect = document.getElementById('medicine-supplier-select');
            if (supplierSelect && data.suppliers) {
                supplierSelect.innerHTML = `<option value="">-- Select Supplier --</option>` + 
                    data.suppliers.map(s => `<option value="${s.supplier_id}">${s.supplier_name}</option>`).join('');
            }
			return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h1 class="page-title" style="margin: 0;">Inventory</h1>
                <button onclick="openModal('medicineModal')" class="btn btn-primary">+ Add Medicine</button>
            </div>
            <div class="glass-card">
                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th>Expiry</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.medicines.map((m) => {
                                const today = new Date(localStorage.getItem('simDate') || new Date().toISOString().split('T')[0]);
                                const expiryDate = new Date(m.expiry_date);
                                const isExpired = expiryDate < today;
                                const expiryStyle = isExpired ? 'color: #EF4444; font-weight: bold;' : '';

                                let stockBadge = m.stock_quantity > 20 ? '<span class="badge success">In Stock</span>' : 
                                                (m.stock_quantity > 0 ? '<span class="badge warning">Low Stock</span>' : '<span class="badge danger">Out of Stock</span>');
                                
                                if (isExpired) stockBadge = '<span class="badge danger">Expired</span>';

                                return `
                            <tr>
                                <td style="font-weight: 500;">${m.medicine_name}</td>
                                <td>${m.category}</td>
                                <td>${m.stock_quantity} units</td>
                                <td>$${m.price}</td>
                                <td style="${expiryStyle}">${new Date(m.expiry_date).toLocaleDateString()}</td>
                                <td>${stockBadge}</td>
                            </tr>`}).join("")}
                        </tbody>
                    </table>
                </div>
            </div>`

		case "suppliers":
			return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h1 class="page-title" style="margin: 0;">Suppliers</h1>
                <button onclick="openModal('supplierModal')" class="btn btn-primary">+ Add Supplier</button>
            </div>
            <div class="stats-grid">
                ${data.suppliers.map((s) => `
                <div class="glass-card hover-lift">
                    <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="background: var(--bg-gradient-end); padding: 1rem; border-radius: 50%; color: var(--primary);">
                            <i data-feather="truck"></i>
                        </div>
                        <div>
                            <h3 style="margin:0;">${s.supplier_name}</h3>
                            <span class="badge info">Active</span>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
                        <span style="color: var(--text-muted);"><i data-feather="map-pin" style="width:14px;"></i> ${s.address || 'N/A'}</span>
                        <button onclick="deleteItem('suppliers', ${s.supplier_id})" style="border:none; background:none; color: var(--danger); cursor:pointer;"><i data-feather="trash-2" style="width:16px;"></i></button>
                    </div>
                </div>
                `).join("")}
            </div>`

		case "customers":
			return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h1 class="page-title" style="margin: 0;">Customers</h1>
                <button onclick="openModal('customerModal')" class="btn btn-primary">+ Add Customer</button>
            </div>
            <div class="glass-card">
                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Age</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.customers.map((c) => `
                            <tr>
                                <td style="font-weight: 500;">${c.customer_name}</td>
                                <td>${c.phone}</td>
                                <td>${c.age || 'N/A'}</td>
                                <td>
                                    <button onclick="viewHistory(${c.customer_id})" class="btn" style="padding: 4px 12px; font-size: 0.85rem; background: rgba(79, 70, 229, 0.1); color: var(--primary);">View History</button>
                                    <button onclick="deleteItem('customers', ${c.customer_id})" class="btn" style="padding: 4px 12px; font-size: 0.85rem; background: rgba(239, 68, 68, 0.1); color: var(--danger); margin-left: 0.5rem;">Delete</button>
                                </td>
                            </tr>`).join("")}
                        </tbody>
                    </table>
                </div>
            </div>`

		case "billing":
            currentMedicines = data.medicines;
            currentCustomers = data.customers;
            currentCart = [];
			return `
            <h1 class="page-title">Billing & POS</h1>
            <div class="two-col">
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Available Medicines</h3>
                    <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Stock</th>
                                    <th>Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.medicines.map((m) => `
                                <tr>
                                    <td style="font-weight: 500;">${m.medicine_name}</td>
                                    <td>${m.stock_quantity}</td>
                                    <td>$${m.price}</td>
                                    <td><button onclick="addToCart(${m.medicine_id})" style="padding: 0.25rem 0.5rem; border-radius:4px; border:none; background:var(--primary); color:white; cursor:pointer;">Add</button></td>
                                </tr>`).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Current Order</h3>
                    <div class="form-group">
                        <label>Customer</label>
                        <select id="billing-customer" class="form-input">
                            <option value="">-- Select Customer --</option>
                            ${data.customers.map(c => `<option value="${c.customer_id}">${c.customer_name} (${c.phone})</option>`).join('')}
                        </select>
                    </div>
                    <div id="cart-items">
                        <div style="min-height: 200px; display:flex; align-items:center; justify-content:center; color: var(--text-muted); border: 2px dashed rgba(0,0,0,0.1); border-radius: var(--radius-lg); margin-bottom: 1rem;">
                            No items added yet.
                        </div>
                    </div>
                    <div style="display:flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
                        <span>Total:</span>
                        <span id="cart-total">$0.00</span>
                    </div>
                    <button onclick="processPayment()" style="width: 100%; padding: 1rem; border-radius:var(--radius-lg); border:none; background:var(--secondary); color:white; font-weight:700; font-size:1.1rem; cursor:pointer;">Process Payment</button>
                </div>
            </div>`

		case "reports":
            setTimeout(() => {
                const isDark = document.body.classList.contains('dark-mode');
                const textColor = isDark ? '#f8fafc' : '#1e293b';
                const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

                // Bar Chart - Sales
                const salesCtx = document.getElementById('salesChart');
                if (salesCtx && data.sales_dates && data.sales_dates.length > 0) {
                    new Chart(salesCtx, {
                        type: 'bar',
                        data: {
                            labels: data.sales_dates.map(d => new Date(d).toLocaleDateString()),
                            datasets: [{
                                label: 'Daily Revenue ($)',
                                data: data.sales_totals,
                                backgroundColor: '#4F46E5',
                                borderRadius: 6,
                                barThickness: 24
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                                x: { grid: { display: false }, ticks: { color: textColor } }
                            }
                        }
                    });
                }

                // Doughnut Chart - Top Medicines
                const medsCtx = document.getElementById('medsChart');
                if (medsCtx && data.med_names && data.med_names.length > 0) {
                    new Chart(medsCtx, {
                        type: 'doughnut',
                        data: {
                            labels: data.med_names,
                            datasets: [{
                                data: data.med_sold,
                                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'],
                                borderWidth: 0,
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            cutout: '70%',
                            plugins: {
                                legend: { position: 'bottom', labels: { color: textColor, padding: 20, font: { family: 'Outfit' } } }
                            }
                        }
                    });
                }
            }, 150);

			return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1 class="page-title" style="margin: 0;">Analytics Dashboard</h1>
            </div>
            
            <div class="stats-grid">
                <div class="glass-card stat-card" style="border-left: 4px solid #EF4444; cursor: pointer;" onclick="loadPage('medicines'); setTimeout(() => { const s=document.getElementById('global-search'); s.value='Expired'; s.dispatchEvent(new Event('input'))}, 200);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-title">Expired Items</span>
                        <div style="padding: 8px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; color: #EF4444;"><i data-feather="alert-octagon"></i></div>
                    </div>
                    <span class="stat-value">${(data.expired || []).length}</span>
                </div>
                <div class="glass-card stat-card" style="border-left: 4px solid #F59E0B; cursor: pointer;" onclick="loadPage('medicines'); setTimeout(() => { const s=document.getElementById('global-search'); s.value='Low Stock'; s.dispatchEvent(new Event('input'))}, 200);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-title">Expiring Soon</span>
                        <div style="padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; color: #F59E0B;"><i data-feather="clock"></i></div>
                    </div>
                    <span class="stat-value">${(data.expiring_soon || []).length}</span>
                </div>
                <div class="glass-card stat-card" style="border-left: 4px solid #3B82F6; cursor: pointer;" onclick="loadPage('medicines'); setTimeout(() => { const s=document.getElementById('global-search'); s.value='Low Stock'; s.dispatchEvent(new Event('input'))}, 200);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-title">Low Stock</span>
                        <div style="padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; color: #3B82F6;"><i data-feather="trending-down"></i></div>
                    </div>
                    <span class="stat-value">${(data.low_stock || []).length}</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div class="glass-card">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;"><i data-feather="bar-chart-2" style="color: var(--primary);"></i> Revenue Trend (Last 7 Days)</h3>
                    <canvas id="salesChart" height="120"></canvas>
                </div>
                <div class="glass-card" style="display: flex; flex-direction: column; align-items: center;">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; width: 100%;"><i data-feather="pie-chart" style="color: #10B981;"></i> Top Selling Units</h3>
                    <div style="width: 100%; max-width: 250px;">
                        <canvas id="medsChart"></canvas>
                    </div>
                </div>
            </div>`
            
        case "settings":
            const isDark = document.body.classList.contains('dark-mode');
            const currentSimDate = localStorage.getItem('simDate') || new Date().toISOString().split('T')[0];
            return `
            <h1 class="page-title">Settings</h1>
            <div class="glass-card" style="max-width: 600px;">
                <h3 style="margin-bottom: 1.5rem;">Appearance</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
                    <div>
                        <h4 style="margin:0; font-size:1.1rem; color:var(--text-main);">Dark Mode</h4>
                        <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">Toggle dark theme for the application</p>
                    </div>
                    <label style="position:relative; display:inline-block; width:60px; height:34px;">
                        <input type="checkbox" style="opacity:0; width:0; height:0;" onchange="toggleTheme()" ${isDark ? 'checked' : ''}>
                        <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color: var(--text-muted); transition:.4s; border-radius:34px;" class="slider">
                            <span style="position:absolute; content:''; height:26px; width:26px; left:4px; bottom:4px; background-color:white; transition:.4s; border-radius:50%;" class="slider-btn"></span>
                        </span>
                    </label>
                </div>

                <h3 style="margin-bottom: 1.5rem;">Simulation</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                    <div>
                        <h4 style="margin:0; font-size:1.1rem; color:var(--text-main);">Current Date Override</h4>
                        <p style="margin:0; color:var(--text-muted); font-size:0.9rem;">Simulate dates for expiry logic demo</p>
                    </div>
                    <div>
                        <input type="date" class="form-input" value="${currentSimDate}" onchange="localStorage.setItem('simDate', this.value); showToast('Simulation date updated'); loadPage('settings')">
                    </div>
                </div>
            </div>
            <style>
                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider .slider-btn { transform: translateX(26px); }
            </style>
            `

		default:
			return `<h2>${page}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`
	}
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("PharmaLink initialized.")
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark') document.body.classList.add('dark-mode');
    
    // Global search functionality
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.modern-table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Load dashboard by default if content is empty
    setTimeout(() => {
        const content = document.getElementById('content');
        if (content && !content.innerHTML.trim()) {
            const firstNav = document.querySelector('.nav-item');
            if (firstNav) {
                loadPage('dashboard', firstNav);
            } else {
                loadPage('dashboard');
            }
        }
    }, 100);
})
