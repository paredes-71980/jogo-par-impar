// script.js

let currentUser = null;

// Salva e carrega dados do LocalStorage
const getUsers = () => JSON.parse(localStorage.getItem('game_users')) || {};
const saveUsers = (users) => localStorage.setItem('game_users', JSON.stringify(users));

function switchScreen(id) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;
    const dob = document.getElementById('reg-date').value;

    if (!name || pass.length < 4 || !dob) return alert("Preencha os dados corretamente!");
    if (pass !== confirm) return alert("As passwords não coincidem!");

    let users = getUsers();
    if (users[name]) return alert("Utilizador já existe!");

    users[name] = { password: pass, dob: dob, balance: 1000 };
    saveUsers(users);
    alert("Conta criada! 1000₮ adicionados.");
    switchScreen('screen-login');
}

function handleLogin() {
    const name = document.getElementById('login-name').value;
    const pass = document.getElementById('login-pass').value;
    let users = getUsers();

    if (users[name] && users[name].password === pass) {
        currentUser = name;
        updateUI();
        switchScreen('screen-game');
    } else {
        alert("Dados incorretos!");
    }
}

function updateUI() {
    let users = getUsers();
    document.getElementById('user-display').innerText = currentUser;
    document.getElementById('balance-display').innerText = users[currentUser].balance;
}

function startMatch() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    let users = getUsers();

    if (isNaN(bet) || bet <= 0) return alert("Insira um valor válido!");
    if (users[currentUser].balance < bet) return alert("Saldo insuficiente!");

    document.getElementById('bet-area').classList.add('hidden');
    document.getElementById('match-area').classList.remove('active');
    document.getElementById('match-area').classList.remove('hidden');

    // Simulação: Escolher quem seleciona (P1 ou P2)
    const decider = Math.random() > 0.5 ? "Você" : "Oponente";
    document.getElementById('match-status').innerText = `${decider} foi selecionado para escolher Par ou Ímpar!`;

    if (decider === "Você") {
        document.getElementById('player-choice-controls').classList.remove('hidden');
    } else {
        // Simulação automática do oponente
        setTimeout(() => playMove(Math.random() > 0.5 ? 'par' : 'impar'), 1500);
    }
}

function playMove(choice) {
    document.getElementById('player-choice-controls').classList.add('hidden');
    const drawnNumber = Math.floor(Math.random() * 16) + 1;
    const isEven = drawnNumber % 2 === 0;
    const result = isEven ? 'par' : 'impar';
    
    const win = (choice === result);
    const bet = parseInt(document.getElementById('bet-amount').value);
    let users = getUsers();

    if (win) {
        users[currentUser].balance += bet;
        document.getElementById('final-msg').innerText = `Ganhou! Saiu ${result}. +${bet}₮`;
        document.getElementById('final-msg').style.color = "#00b894";
    } else {
        users[currentUser].balance -= bet;
        document.getElementById('final-msg').innerText = `Perdeu! Saiu ${result}. -${bet}₮`;
        document.getElementById('final-msg').style.color = "#ff7675";
    }

    saveUsers(users);
    updateUI();
    
    document.getElementById('number-circle').innerText = drawnNumber;
    document.getElementById('result-display').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('bet-area').classList.remove('hidden');
    document.getElementById('match-area').classList.add('hidden');
    document.getElementById('result-display').classList.add('hidden');
}

function logout() {
    currentUser = null;
    switchScreen('screen-login');
}