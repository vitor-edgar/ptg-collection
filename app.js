// State management
let balance = parseFloat(localStorage.getItem('ptg_balance')) || 0;
let transactions = JSON.parse(localStorage.getItem('ptg_transactions')) || [];
let tasks = JSON.parse(localStorage.getItem('ptg_tasks')) || [];
let tasksHistory = JSON.parse(localStorage.getItem('ptg_tasks_history')) || [];

// Migrate existing transactions to have IDs if they don't
let migrated = false;
transactions = transactions.map((t, i) => {
    if (!t.id) {
        t.id = Date.now() - i;
        migrated = true;
    }
    return t;
});
if (migrated) localStorage.setItem('ptg_transactions', JSON.stringify(transactions));

// Limit history to 10 items to save space and consolidate old balance
if (transactions.length > 10) {
    transactions = transactions.slice(-10);
    localStorage.setItem('ptg_transactions', JSON.stringify(transactions));
}

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

// Task Elements
const tasksList = document.getElementById('tasks-list');
const tasksHistoryList = document.getElementById('tasks-history-list');
const taskNameInput = document.getElementById('task-name-input');
const taskCategorySelect = document.getElementById('task-category-select');
const addTaskBtn = document.getElementById('add-task-btn');

// Modal Elements
const activityModal = document.getElementById('activity-modal');
const activityNameInput = document.getElementById('activity-name-input');
const confirmActivityBtn = document.getElementById('confirm-activity-btn');
const cancelActivityBtn = document.getElementById('cancel-activity-btn');

// Initialize
updateUI();
updateHistoryUI();
updateTasksUI();

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
            <div class="history-right">
                <span class="history-amount ${t.type}">
                    ${t.type === 'credit' ? '+' : '-'} ${new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(t.amount)}
                </span>
                <button class="delete-btn" data-id="${t.id}" title="Excluir">×</button>
            </div>
        </div>
    `).join('');
}

function recordTransaction(type, amount, name) {
    const date = new Date().toLocaleString('pt-BR');
    const id = Date.now();
    
    if (type === 'credit') {
        balance += amount;
    } else {
        balance -= amount;
    }

    transactions.push({ id, type, amount, name, date });
    
    // Keep only last 10 transactions
    if (transactions.length > 10) {
        transactions.shift();
    }
    
    localStorage.setItem('ptg_transactions', JSON.stringify(transactions));
    updateUI();
    updateHistoryUI();
}

function openActivityModal(amount, defaultName = '') {
    pendingAmount = amount;
    activityModal.classList.remove('hidden');
    activityNameInput.value = defaultName;
    setTimeout(() => {
        activityNameInput.focus();
        activityNameInput.select();
    }, 100);
}

function closeActivityModal() {
    activityModal.classList.add('hidden');
    pendingAmount = 0;
}

function deleteTransaction(id) {
    const index = transactions.findIndex(t => t.id == id);
    if (index !== -1) {
        const t = transactions[index];
        if (t.type === 'credit') {
            balance -= t.amount;
        } else {
            balance += t.amount;
        }
        transactions.splice(index, 1);
        localStorage.setItem('ptg_transactions', JSON.stringify(transactions));
        updateUI();
        updateHistoryUI();
    }
}

// Task Functions
function updateTasksUI() {
    if (!tasksList || !tasksHistoryList) return;

    // Render Pending Tasks
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-msg">Nenhuma tarefa pendente.</p>';
    } else {
        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item">
                <div class="task-info">
                    <span class="task-name">${task.name}</span>
                    <span class="task-category">${getCategoryName(task.value)}</span>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" data-id="${task.id}" title="Concluir">✓</button>
                    <button class="delete-btn" data-id="${task.id}" data-type="task" title="Excluir">×</button>
                </div>
            </div>
        `).join('');
    }

    // Render Completed Tasks (limit to 5 for the view)
    if (tasksHistory.length === 0) {
        tasksHistoryList.innerHTML = '<p class="empty-msg">Nenhuma tarefa concluída hoje.</p>';
    } else {
        tasksHistoryList.innerHTML = tasksHistory.slice().reverse().slice(0, 5).map(task => `
            <div class="task-item completed">
                <div class="task-info">
                    <span class="task-name">${task.name}</span>
                    <span class="task-category">${getCategoryName(task.value)} - R$ ${task.value}</span>
                </div>
                <div class="task-date" style="font-size: 0.7rem; opacity: 0.6;">${task.completedAt}</div>
            </div>
        `).join('');
    }
}

function getCategoryName(value) {
    const categories = {
        '2': '0. Muito Simples',
        '5': 'I. Simples',
        '15': 'II. Importante',
        '20': 'III. Prioritária',
        '50': 'IV. Suprema'
    };
    return categories[value] || 'Geral';
}

function addTask() {
    const name = taskNameInput.value.trim();
    const value = parseFloat(taskCategorySelect.value);

    if (name) {
        const newTask = {
            id: Date.now(),
            name: name,
            value: value,
            createdAt: new Date().toLocaleString('pt-BR')
        };
        tasks.push(newTask);
        saveTasks();
        taskNameInput.value = '';
        updateTasksUI();
    }
}

function completeTask(id) {
    const index = tasks.findIndex(t => t.id == id);
    if (index !== -1) {
        const task = tasks.splice(index, 1)[0];
        task.completedAt = new Date().toLocaleString('pt-BR');
        tasksHistory.push(task);
        
        // Record as a transaction
        recordTransaction('credit', task.value, `Tarefa: ${task.name}`);
        
        saveTasks();
        updateTasksUI();
    }
}

function deleteTask(id, type = 'pending') {
    if (type === 'task') {
        const index = tasks.findIndex(t => t.id == id);
        if (index !== -1) {
            tasks.splice(index, 1);
            saveTasks();
            updateTasksUI();
        }
    }
}

function saveTasks() {
    // Limit tasks history to last 50 items
    if (tasksHistory.length > 50) {
        tasksHistory = tasksHistory.slice(-50);
    }
    localStorage.setItem('ptg_tasks', JSON.stringify(tasks));
    localStorage.setItem('ptg_tasks_history', JSON.stringify(tasksHistory));
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

// Navigation and Content Loading
const loadedViews = {
    'regulations-view': false,
    'deck-guide-view': false
};

const viewFiles = {
    'regulations-view': { file: 'regulamento.html', container: 'regulations-content' },
    'deck-guide-view': { file: 'how_to_build_a_deck.html', container: 'deck-guide-content' }
};

async function loadViewContent(target) {
    if (viewFiles[target] && !loadedViews[target]) {
        const { file, container } = viewFiles[target];
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Erro ao carregar ${file}`);
            const html = await response.text();
            document.getElementById(container).innerHTML = html;
            loadedViews[target] = true;
        } catch (error) {
            console.error(error);
            document.getElementById(container).innerHTML = `<p class="error-msg">Erro ao carregar conteúdo: ${error.message}</p>`;
        }
    }
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Load content if needed
        loadViewContent(target);

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

// Task Event Listeners
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', addTask);
}

if (taskNameInput) {
    taskNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
}

if (tasksList) {
    tasksList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('complete-btn')) {
            completeTask(id);
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Deseja excluir esta tarefa?')) {
                deleteTask(id, 'task');
            }
        }
    });
}

// History Item Deletion
historyList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        if (confirm('Deseja excluir esta transação?')) {
            deleteTransaction(id);
        }
    }
});
