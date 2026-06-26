// State management
let balance = parseFloat(localStorage.getItem('ptg_balance')) || 0;

// DOM Elements
const balanceEl = document.getElementById('balance');
const balanceContainer = document.getElementById('balance-container');
const creditInput = document.getElementById('credit-input');
const debitInput = document.getElementById('debit-input');
const addCreditBtn = document.getElementById('add-credit-btn');
const addDebitBtn = document.getElementById('add-debit-btn');
const notification = document.getElementById('notification');
const shortcuts = document.querySelectorAll('.shortcut');

// Initialize
updateUI();

// Functions
function updateUI() {
    // Format balance as R$
    balanceEl.textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(balance);

    // Persist
    localStorage.setItem('ptg_balance', balance.toString());

    // Negative balance check
    if (balance < 0) {
        balanceContainer.classList.add('negative');
        notification.classList.remove('hidden');
    } else {
        balanceContainer.classList.remove('negative');
        notification.classList.add('hidden');
    }
}

function addAmount(amount) {
    if (isNaN(amount) || amount === 0) return;
    balance += amount;
    updateUI();
}

// Event Listeners
addCreditBtn.addEventListener('click', () => {
    const val = parseFloat(creditInput.value);
    if (!isNaN(val)) {
        addAmount(val);
        creditInput.value = '';
    }
});

addDebitBtn.addEventListener('click', () => {
    const val = parseFloat(debitInput.value);
    if (!isNaN(val)) {
        addAmount(-val);
        debitInput.value = '';
    }
});

shortcuts.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.value);
        if (btn.classList.contains('credit')) {
            addAmount(val);
        } else {
            addAmount(-val);
        }
    });
});

// Handle Enter key on inputs
creditInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCreditBtn.click();
});

debitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDebitBtn.click();
});
