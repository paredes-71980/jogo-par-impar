let user1 = null;
let user2 = null;
let currentBet = 0;
let turnOwner = null;

const getDB = () => JSON.parse(localStorage.getItem('contas_duelo')) || {};
const saveDB = (db) => localStorage.setItem('contas_duelo', JSON.stringify(db));

function showScreen(id) {
    document.querySelectorAll('.auth-card, .game-container').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function uiRegister() {
    const name = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const conf = document.getElementById('reg-conf').value;
    
    if (name && pass === conf) {
        let db = getDB();
        if (db[name]) return alert("Utilizador já existe!");
        db[name] = { pass, balance: 1000 };
        saveDB(db);
        alert("Conta criada com 1000₮!");
        showScreen('screen-login');
    } else { alert("Dados inválidos!"); }
}

function uiLoginDuel() {
    const u1 = document.getElementById('login-u1').value;
    const p1 = document.getElementById('login-p1').value;
    const u2 = document.getElementById('login-u2').value;
    const p2 = document.getElementById('login-p2').value;
    
    let db = getDB();
    
    if (db[u1] && db[u1].pass === p1 && db[u2] && db[u2].pass === p2) {
        if (u1 === u2) return alert("Usa contas diferentes para o duelo!");
        user1 = { name: u1, ...db[u1] };
        user2 = { name: u2, ...db[u2] };
        updateUI();
        showScreen('screen-game');
    } else { alert("Um ou ambos os logins falharam!"); }
}

function updateUI() {
    document.getElementById('p1-name').innerText = user1.name;
    document.getElementById('p1-balance').innerText = user1.balance;
    document.getElementById('p2-name').innerText = user2.name;
    document.getElementById('p2-balance').innerText = user2.balance;
}

function startDuel() {
    currentBet = parseInt(document.getElementById('bet-val').value);
    if (!currentBet || currentBet > user1.balance || currentBet > user2.balance) {
        return alert("Aposta inválida ou saldo insuficiente!");
    }
    
    document.getElementById('setup-area').classList.add('hidden');
    turnOwner = Math.random() > 0.5 ? 1 : 2;
    document.getElementById(`p${turnOwner}-controls`).classList.remove('hidden');
}

function makeChoice(choice) {
    document.querySelectorAll('.controls').forEach(c => c.classList.add('hidden'));
    const num = Math.floor(Math.random() * 16) + 1;
    const result = (num % 2 === 0 ? 'par' : 'impar');
    const win = (choice === result);
    
    let db = getDB();

    // Se quem escolheu (turnOwner) ganhou a rodada
    if (win) {
        if (turnOwner === 1) { user1.balance += currentBet; user2.balance -= currentBet; }
        else { user2.balance += currentBet; user1.balance -= currentBet; }
    } else {
        if (turnOwner === 1) { user1.balance -= currentBet; user2.balance += currentBet; }
        else { user2.balance -= currentBet; user1.balance += currentBet; }
    }

    // Salvar no Banco de Dados
    db[user1.name].balance = user1.balance;
    db[user2.name].balance = user2.balance;
    saveDB(db);

    document.getElementById('drawn-num').innerText = num;
    document.getElementById('result-area').classList.remove('hidden');
    updateUI();
}

function resetBoard() {
    document.getElementById('result-area').classList.add('hidden');
    document.getElementById('setup-area').classList.remove('hidden');
}