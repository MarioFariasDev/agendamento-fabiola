document.addEventListener("DOMContentLoaded", function () {
  // Agendamento inteligente no formulário
  const formAgendamento = document.getElementById("form-agendamento");
  if (formAgendamento) {
    formAgendamento.addEventListener("submit", function (e) {
      e.preventDefault();
      const nome = document.getElementById("nome").value;
      const data = document.getElementById("data").value;
      const hora = document.getElementById("hora").value;

      const msg = `Olá! Meu nome é ${nome}. Gostaria de agendar um horário para o dia ${data}, às ${hora}.`;
      const numeroWhatsApp = "559295370896";
      window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  // Sorteio / Captura de leads
  const formSorteio = document.getElementById("form-sorteio");
  if (formSorteio) {
    formSorteio.addEventListener("submit", function (e) {
      e.preventDefault();
      const nome = formSorteio.querySelector("input[type='text']").value;
      const telefone = formSorteio.querySelector("input[type='tel']").value;

      const leads = JSON.parse(localStorage.getItem("leads_sorteio")) || [];
      leads.push({ nome, telefone });
      localStorage.setItem("leads_sorteio", JSON.stringify(leads));

      alert("Cadastro realizado com sucesso! Boa sorte no sorteio 🎉");
      formSorteio.reset();
    });
  }

  // Chatbot
  const chatbot = document.getElementById("chatbot");
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");

  let step = 0;
  let agendamento = { nome: "", data: "", hora: "" };
  const numeroWhatsApp = "559295370896";

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
    chatSendBtn.addEventListener("click", () => {
      const userMsg = chatInput.value.trim();
      if (!userMsg) return;
      userSendMessage(userMsg);
      chatInput.value = "";

      if (step === 0) {
        agendamento.nome = userMsg;
        botSendMessage(`Oi, ${agendamento.nome}! Qual data você gostaria para o agendamento? (ex: 31/07/2025)`);
        step++;
      } else if (step === 1) {
        agendamento.data = userMsg;
        botSendMessage("E qual horário? (ex: 14:00)");
        step++;
      } else if (step === 2) {
        agendamento.hora = userMsg;
        const msg = `Olá! Meu nome é ${agendamento.nome}. Gostaria de agendar um horário para o dia ${agendamento.data}, às ${agendamento.hora}.`;
        botSendMessage(
            `Perfeito! Clique no link para confirmar seu agendamento no WhatsApp:<br>` +
            `<a href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}" target="_blank" style="color:#b83280;">Confirmar Agendamento</a>`
        );
        step++;
      } else {
        botSendMessage("Se precisar de mais alguma coisa, é só chamar!");
      }
    });

    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        chatSendBtn.click();
      }
    });
  }

  // Agenda visual - integração com WhatsApp
  const horarios = document.querySelectorAll(".horario");
  horarios.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("indisponivel")) return;
      const dia = btn.dataset.dia;
      const hora = btn.dataset.hora;
      const msg = `Olá! Gostaria de agendar um horário na ${dia}, às ${hora}.`;
      const link = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}`;
      window.open(link, "_blank");
    });
  });
});
