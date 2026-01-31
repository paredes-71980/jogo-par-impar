// CONFIGURAÇÃO DO FIREBASE (SUBSTITUI PELOS TEUS DADOS)
const firebaseConfig = {
  apiKey: "AIzaSyAAvZZ3hV07Gn0smESE0FB5LXctPEZ659c",
  authDomain: "dueloonline-35dd3.firebaseapp.com",
  databaseURL: "https://dueloonline-35dd3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dueloonline-35dd3",
  storageBucket: "dueloonline-35dd3.firebasestorage.app",
  messagingSenderId: "634259175209",
  appId: "1:634259175209:web:80344c12827fa75d832938",
  measurementId: "G-DMCENPEZ9S"
};

// Inicializar
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let meuUser = null;
let minhaSala = null;

// LOGIN E REGISTO
function loginOuRegistar() {
    const name = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (!name || !pass) return alert("Preenche os campos!");

    db.ref('usuarios/' + name).once('value', (snap) => {
        const user = snap.val();
        if (user) {
            if (user.pass === pass) entrarLobby(name, user.balance);
            else alert("Password incorreta!");
        } else {
            db.ref('usuarios/' + name).set({ pass: pass, balance: 1000 });
            entrarLobby(name, 1000);
        }
    });
}

function entrarLobby(name, balance) {
    meuUser = { name, balance };
    document.getElementById('user-display').innerText = name;
    document.getElementById('balance-display').innerText = balance;
    showScreen('lobby-screen');
}

// SALA ONLINE
function entrarNaSala() {
    const roomId = document.getElementById('room-id').value.trim();
    if (!roomId) return alert("Digita um ID!");
    minhaSala = roomId;

    const ref = db.ref('salas/' + roomId);
    ref.once('value', (snap) => {
        const sala = snap.val();
        if (!sala) {
            ref.set({ p1: meuUser.name, status: "esperando", turno: meuUser.name });
        } else if (!sala.p2 && sala.p1 !== meuUser.name) {
            ref.update({ p2: meuUser.name, status: "pronto" });
        }
        escutarSala();
        showScreen('game-screen');
    });
}

function escutarSala() {
    db.ref('salas/' + minhaSala).on('value', (snap) => {
        const sala = snap.val();
        if (!sala) return;

        document.getElementById('current-room-display').innerText = minhaSala;
        document.getElementById('game-balance-display').innerText = meuUser.balance;

        if (sala.p1 && sala.p2) {
            document.getElementById('waiting-msg').classList.add('hidden');
            document.getElementById('action-area').classList.remove('hidden');
            document.getElementById('turn-info').innerText = "Vez de escolher: " + (sala.turno === meuUser.name ? "TU" : sala.turno);
            
            if (sala.turno === meuUser.name) document.getElementById('choice-buttons').classList.remove('hidden');
            else document.getElementById('choice-buttons').classList.add('hidden');
        }

        if (sala.resultado) mostrarResultado(sala.resultado, sala.p1, sala.p2);
    });

    // Escutar Chat
    db.ref('salas/' + minhaSala + '/chat').limitToLast(10).on('value', (snap) => {
        const chatDiv = document.getElementById('chat-messages');
        chatDiv.innerHTML = '';
        snap.forEach(child => {
            const m = child.val();
            chatDiv.innerHTML += `<div><b>${m.user}:</b> ${m.texto}</div>`;
        });
        chatDiv.scrollTop = chatDiv.scrollHeight;
    });
}

function fazerJogada(escolha) {
    const aposta = parseInt(document.getElementById('bet-amount').value);
    if (!aposta || aposta > meuUser.balance || aposta <= 0) return alert("Aposta inválida!");

    const num = Math.floor(Math.random() * 16) + 1;
    const tipo = num % 2 === 0 ? 'par' : 'impar';
    
    db.ref('salas/' + minhaSala).update({
        resultado: {
            quemEscolheu: meuUser.name,
            escolha: escolha,
            numero: num,
            tipo: tipo,
            valor: aposta
        }
    });
}

function mostrarResultado(res, p1, p2) {
    document.getElementById('action-area').classList.add('hidden');
    document.getElementById('result-display').classList.remove('hidden');
    document.getElementById('drawn-number').innerText = res.numero;
    
    const euEscolhi = res.quemEscolheu === meuUser.name;
    const acertou = res.escolha === res.tipo;
    const venci = (euEscolhi && acertou) || (!euEscolhi && !acertou);

    document.getElementById('win-lose-msg').innerText = venci ? "GANHASTE " + res.valor + "₮!" : "PERDESTE...";
    document.getElementById('win-lose-msg').style.color = venci ? "#00b894" : "#ff7675";

    if (!window.lockSaldo) {
        meuUser.balance += (venci ? res.valor : -res.valor);
        db.ref('usuarios/' + meuUser.name).update({ balance: meuUser.balance });
        window.lockSaldo = true;
    }
}

function novaRodada() {
    window.lockSaldo = false;
    db.ref('salas/' + minhaSala).once('value', (snap) => {
        const sala = snap.val();
        const novoTurno = (sala.turno === sala.p1) ? sala.p2 : sala.p1;
        db.ref('salas/' + minhaSala).update({ turno: novoTurno, resultado: null });
    });
    document.getElementById('result-display').classList.add('hidden');
}

function enviarMensagem() {
    const msg = document.getElementById('chat-input').value;
    if (msg) {
        db.ref('salas/' + minhaSala + '/chat').push({ user: meuUser.name, texto: msg });
        document.getElementById('chat-input').value = '';
    }
}

function showScreen(id) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

