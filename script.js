import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  get,
  query,
  orderByChild,
  equalTo
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADhEERMf_qURcrMzTPwPatpKjDR777KcI",
  authDomain: "agendadesignsobrancelhas-ddb64.firebaseapp.com",
  projectId: "agendadesignsobrancelhas-ddb64",
  storageBucket: "agendadesignsobrancelhas-ddb64.firebasestorage.app",
  messagingSenderId: "182046606434",
  appId: "1:182046606434:web:2e6148120c0d848fb1fd3b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("formAgendamento");
const horarioSelect = document.getElementById("horario");
const dataInput = document.getElementById("data");
const mensagem = document.getElementById("mensagem");

// Função para gerar horários por dia da semana
function gerarHorarios(diaDaSemana) {
  const horarios = [];
  const add = (h, m) =>
      horarios.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);

  if (diaDaSemana >= 1 && diaDaSemana <= 5) {
    // Segunda a sexta
    for (let h = 7; h < 12; h++) add(h, 30), add(h + 1, 0);
    for (let h = 13; h < 18; h++) add(h, 0), add(h, 30);
  } else if (diaDaSemana === 6) {
    // Sábado
    for (let h = 7; h <= 11; h++) add(h, 30), add(h + 1, 0);
    add(12, 30);
  }

  return horarios;
}

// Ao escolher uma data, carregar os horários disponíveis
dataInput.addEventListener("change", async () => {
  const dataSelecionada = dataInput.value;
  const diaSemana = new Date(dataSelecionada).getDay();
  const todosHorarios = gerarHorarios(diaSemana);

  const agendadosRef = query(ref(db, "agendamentos"), orderByChild("data"), equalTo(dataSelecionada));
  const snapshot = await get(agendadosRef);

  const horariosOcupados = [];
  if (snapshot.exists()) {
    snapshot.forEach(child => horariosOcupados.push(child.val().horario));
  }

  horarioSelect.innerHTML = "";
  todosHorarios.forEach(h => {
    if (!horariosOcupados.includes(h)) {
      const option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      horarioSelect.appendChild(option);
    }
  });

  if (horarioSelect.options.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.disabled = true;
    option.textContent = "Todos os horários estão preenchidos";
    horarioSelect.appendChild(option);
  }
});

// Submeter o formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const agendamento = {
    nome: form.nome.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    servico: form.servico.value,
    data: form.data.value,
    horario: form.horario.value
  };

  // Salvar no Firebase
  await push(ref(db, "agendamentos"), agendamento);

  // Mostrar mensagem de sucesso
  mensagem.classList.remove("hidden");
  setTimeout(() => mensagem.classList.add("hidden"), 5000);

  // Redirecionar para WhatsApp
  const texto = `Olá, me chamo *${agendamento.nome}* e gostaria de confirmar o agendamento para *${agendamento.servico}* no dia *${agendamento.data}* às *${agendamento.horario}h*.`;
  const linkWhatsApp = `https://wa.me/559295370896?text=${encodeURIComponent(texto)}`;
  window.location.href = linkWhatsApp;
});
