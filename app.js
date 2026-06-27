// State management
let balance = parseFloat(localStorage.getItem('ptg_balance')) || 0;
let transactions = JSON.parse(localStorage.getItem('ptg_transactions')) || [];

// Pending transaction for modal
let pendingAmount = 0;

// DOM Elements
const balanceEl = document.getElementById('balance');
const balanceContainer = document.getElementById('balance-container');
const creditInput = document.getElementById('credit-input');
const debitInput = document.getElementById('debit-input');
const addCreditBtn = document.getElementById('add-credit-btn');
const addDebitBtn = document.getElementById('add-debit-btn');
const notification = document.getElementById('notification');
const shortcuts = document.querySelectorAll('.shortcut');
const tabBtns = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');
const historyList = document.getElementById('history-list');

// Modal Elements
const activityModal = document.getElementById('activity-modal');
const activityNameInput = document.getElementById('activity-name-input');
const confirmActivityBtn = document.getElementById('confirm-activity-btn');
const cancelActivityBtn = document.getElementById('cancel-activity-btn');

// Initialize
updateUI();
updateHistoryUI();

// Functions
function updateUI() {
    balanceEl.textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(balance);

    localStorage.setItem('ptg_balance', balance.toString());

    if (balance < 0) {
        balanceContainer.classList.add('negative');
        notification.classList.remove('hidden');
    } else {
        balanceContainer.classList.remove('negative');
        notification.classList.add('hidden');
    }
}

function updateHistoryUI() {
    if (!historyList) return;
    
    if (transactions.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">Nenhuma transação registrada.</p>';
        return;
    }

    historyList.innerHTML = transactions.slice().reverse().map(t => `
        <div class="history-item ${t.type}">
            <div class="history-info">
                <span class="history-name">${t.name}</span>
                <span class="history-date">${t.date}</span>
            </div>
            <span class="history-amount ${t.type}">
                ${t.type === 'credit' ? '+' : '-'} ${new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(t.amount)}
            </span>
        </div>
    `).join('');
}

function recordTransaction(type, amount, name) {
    const date = new Date().toLocaleString('pt-BR');
    transactions.push({ type, amount, name, date });
    
    if (type === 'credit') {
        balance += amount;
    } else {
        balance -= amount;
    }
    
    localStorage.setItem('ptg_transactions', JSON.stringify(transactions));
    updateUI();
    updateHistoryUI();
}

function openActivityModal(amount, defaultName = '') {
    pendingAmount = amount;
    activityModal.classList.remove('hidden');
    activityNameInput.value = defaultName;
    setTimeout(() => activityNameInput.focus(), 100);
}

function closeActivityModal() {
    activityModal.classList.add('hidden');
    pendingAmount = 0;
}

// Event Listeners
addCreditBtn.addEventListener('click', () => {
    const val = parseFloat(creditInput.value);
    if (!isNaN(val) && val > 0) {
        openActivityModal(val);
        creditInput.value = '';
    }
});

addDebitBtn.addEventListener('click', () => {
    const val = parseFloat(debitInput.value);
    if (!isNaN(val) && val > 0) {
        recordTransaction('debit', val, 'Gasto Manual');
        debitInput.value = '';
    }
});

confirmActivityBtn.addEventListener('click', () => {
    const name = activityNameInput.value.trim() || 'Crédito';
    recordTransaction('credit', pendingAmount, name);
    closeActivityModal();
});

cancelActivityBtn.addEventListener('click', closeActivityModal);

activityNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmActivityBtn.click();
});

// Navigation
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        views.forEach(v => {
            if (v.id === target) {
                v.classList.remove('hidden');
            } else {
                v.classList.add('hidden');
            }
        });
    });
});

shortcuts.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.value);
        if (btn.classList.contains('credit')) {
            const defaultName = btn.querySelector('span')?.textContent || '';
            openActivityModal(val, defaultName);
        } else {
            const itemName = btn.querySelector('span')?.textContent || 'Gasto';
            recordTransaction('debit', val, itemName);
        }
    });
});

creditInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCreditBtn.click();
});

debitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDebitBtn.click();
});
