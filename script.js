import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  push,
  query,
  ref
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADhEERMf_qURcrMzTPwPatpKjDR777KcI",
  authDomain: "agendadesignsobrancelhas-ddb64.firebaseapp.com",
  projectId: "agendadesignsobrancelhas-ddb64",
  storageBucket: "agendadesignsobrancelhas-ddb64.appspot.com",
  messagingSenderId: "182046606434",
  appId: "1:182046606434:web:2e6148120c0d848fb1fd3b",
  databaseURL: "https://agendadesignsobrancelhas-ddb64-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos do DOM
const form = document.getElementById("formAgendamento");
const horarioSelect = document.getElementById("horario");
const dataInput = document.getElementById("data");
const mensagem = document.getElementById("mensagem");

// Bloqueia datas passadas no input
const hoje = new Date().toISOString().split("T")[0];
dataInput.setAttribute("min", hoje);

// Bloqueia domingo no input
dataInput.addEventListener("input", (e) => {
  const dia = new Date(e.target.value).getDay();
  if (dia === 0) {
    alert("Domingo não há atendimento. Por favor, escolha outro dia.");
    e.target.value = "";
  }
});

// Gera horários formatados corretamente
function gerarHorarios(diaDaSemana) {
  const horarios = [];

  function add(h, m) {
    const hora = h.toString().padStart(2, "0");
    const minuto = m.toString().padStart(2, "0");
    horarios.push(`${hora}:${minuto}`);
  }

  if (diaDaSemana >= 1 && diaDaSemana <= 5) {
    for (let h = 7; h <= 11; h++) {
      add(h, 30);
      if (h !== 11) add(h + 1, 0);
    }
    for (let h = 13; h < 18; h++) {
      add(h, 0);
      add(h, 30);
    }
  } else if (diaDaSemana === 6) {
    for (let h = 7; h <= 11; h++) {
      add(h, 30);
      if (h !== 11) add(h + 1, 0);
    }
    add(12, 30);
  }

  return horarios;
}

// Quando a data muda
dataInput.addEventListener("change", async () => {
  const dataSelecionada = dataInput.value;
  const diaSemana = new Date(dataSelecionada).getDay();

  // Validação
  const hojeStr = new Date().toISOString().split("T")[0];
  if (!dataSelecionada || dataSelecionada < hojeStr || diaSemana === 0) {
    horarioSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.textContent = diaSemana === 0
        ? "Domingo não há atendimento"
        : "Data inválida (já passou)";
    opt.disabled = true;
    opt.selected = true;
    horarioSelect.appendChild(opt);
    return;
  }

  // Gera os horários possíveis
  const todosHorarios = gerarHorarios(diaSemana);

  // Consulta horários agendados no Firebase
  const agendadosRef = query(
      ref(db, "agendamentos"),
      orderByChild("data"),
      equalTo(dataSelecionada)
  );
  const snapshot = await get(agendadosRef);

  const horariosOcupados = [];
  if (snapshot.exists()) {
    snapshot.forEach(child => horariosOcupados.push(child.val().horario));
  }

  // Preenche os horários disponíveis
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

// Submissão do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const agendamento = {
    nome: form.nome.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    servico: form.servico.value,
    data: form.data.value,
    horario: form.horario.value
  };

  await push(ref(db, "agendamentos"), agendamento);

  mensagem.classList.remove("hidden");
  setTimeout(() => mensagem.classList.add("hidden"), 5000);

  const texto = `Olá, me chamo *${agendamento.nome}* e gostaria de confirmar o agendamento para *${agendamento.servico}* no dia *${agendamento.data}* às *${agendamento.horario}h*.`;
  window.location.href = `https://wa.me/559295370896?text=${encodeURIComponent(texto)}`;
});
