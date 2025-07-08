import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDVV1_HKs21YNDtHoDCiHLFKjl-FIrqMCk",
  authDomain: "agendamentossobrancelha.firebaseapp.com",
  databaseURL: "https://agendamentossobrancelha-default-rtdb.firebaseio.com",
  projectId: "agendamentossobrancelha",
  storageBucket: "agendamentossobrancelha.firebasestorage.app",
  messagingSenderId: "702935577172",
  appId: "1:702935577172:web:b369bdd6c86052623df3c1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const numeroWhatsApp = "559295370896";

  // === 1. Formulário de Agendamento ===
  const form = document.getElementById("form-agendamento");
  const lista = document.getElementById("agendamentos-lista");

  async function atualizarLista() {
    const agRef = ref(db, "agendamentos");
    onValue(agRef, (snapshot) => {
      lista.innerHTML = "";
      if (!snapshot.exists()) {
        lista.innerHTML = "<li>Nenhum agendamento ainda.</li>";
        return;
      }

      const dados = snapshot.val();
      Object.values(dados).forEach(({ nome, servico, data, hora }) => {
        const li = document.createElement("li");
        li.textContent = `⛔ ${data} às ${hora} - ${servico} (por ${nome})`;
        lista.appendChild(li);
      });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("nome").value.trim();
      const servico = document.getElementById("servico").value;
      const data = document.getElementById("data").value;
      const hora = document.getElementById("hora").value;
      const id = `${data}-${hora}`.replace(/[:\/]/g, "-");

      if (!nome || !servico || !data || !hora) {
        alert("Preencha todos os campos!");
        return;
      }

      const agRef = ref(db, `agendamentos/${id}`);
      const snapshot = await get(agRef);
      if (snapshot.exists()) {
        alert("Horário indisponível!");
        return;
      }

      await set(agRef, { nome, servico, data, hora });

      const msg = `Olá! Meu nome é ${nome}. Gostaria de agendar "${servico}" no dia ${data}, às ${hora}.`;
      window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}`, "_blank");

      form.reset();
    });

    atualizarLista();
  }

  // === 2. Captura de Leads (Sorteio) ===
  const formSorteio = document.getElementById("form-sorteio");
  if (formSorteio) {
    formSorteio.addEventListener("submit", function (e) {
      e.preventDefault();
      const nome = formSorteio.querySelector("input[type='text']").value;
      const telefone = formSorteio.querySelector("input[type='tel']").value;

      const leadsRef = ref(db, `leads/${Date.now()}`);
      set(leadsRef, { nome, telefone });

      alert("Cadastro realizado! Boa sorte no sorteio 🎉");
      formSorteio.reset();
    });
  }

  // === 3. Chatbot ===
  const chatbot = document.getElementById("chatbot");
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");

  let step = 0;
  let agendamento = { nome: "", data: "", hora: "" };

  function botSendMessage(message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("bot-message");
    msgDiv.innerHTML = message;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function userSendMessage(message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("user-message");
    msgDiv.textContent = message;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function startChat() {
    step = 0;
    agendamento = { nome: "", data: "", hora: "" };
    chatMessages.innerHTML = "";
    botSendMessage("Olá! Qual seu nome?");
  }

  if (chatToggleBtn) {
    chatToggleBtn.addEventListener("click", () => {
      chatbot.classList.toggle("hidden");
      if (!chatbot.classList.contains("hidden")) {
        startChat();
      }
    });
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", async () => {
      const userMsg = chatInput.value.trim();
      if (!userMsg) return;
      userSendMessage(userMsg);
      chatInput.value = "";

      if (step === 0) {
        agendamento.nome = userMsg;
        botSendMessage(`Oi ${agendamento.nome}! Qual data deseja? (ex: 2025-07-10)`);
        step++;
      } else if (step === 1) {
        agendamento.data = userMsg;
        botSendMessage("E o horário? (ex: 14:00)");
        step++;
      } else if (step === 2) {
        agendamento.hora = userMsg;
        const id = `${agendamento.data}-${agendamento.hora}`.replace(/[:\/]/g, "-");
        const snapshot = await get(ref(db, `agendamentos/${id}`));

        if (snapshot.exists()) {
          botSendMessage("Esse horário já está agendado 😞. Tente outro.");
        } else {
          await set(ref(db, `agendamentos/${id}`), {
            nome: agendamento.nome,
            data: agendamento.data,
            hora: agendamento.hora,
            servico: "Via Chatbot"
          });

          const msg = `Olá! Meu nome é ${agendamento.nome}. Gostaria de agendar no dia ${agendamento.data}, às ${agendamento.hora}.`;
          botSendMessage(`✅ Agendamento salvo! <a href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}" target="_blank" style="color:#b83280;">Confirmar no WhatsApp</a>`);
          step++;
        }
      } else {
        botSendMessage("Se precisar de mais alguma coisa, estou aqui 💖");
      }
    });

    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") chatSendBtn.click();
    });
  }
});
