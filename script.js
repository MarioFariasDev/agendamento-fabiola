// script.js

document.addEventListener("DOMContentLoaded", function () {
  // AGENDAMENTO INTELIGENTE
  const formAgendamento = document.getElementById("form-agendamento");
  if (formAgendamento) {
    formAgendamento.addEventListener("submit", function (e) {
      e.preventDefault();
      const nome = document.getElementById("nome").value;
      const data = document.getElementById("data").value;
      const hora = document.getElementById("hora").value;

      const msg = `Olá! Meu nome é ${nome}. Gostaria de agendar um horário para o dia ${data}, às ${hora}.`;
      const numeroWhatsApp = "559295370896"; // Substitua por DDD + número sem espaços ou traços
      window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  // SORTEIO / CAPTURA DE LEADS
  const formSorteio = document.getElementById("form-sorteio");
  if (formSorteio) {
    formSorteio.addEventListener("submit", function (e) {
      e.preventDefault();
      const nome = formSorteio.querySelector("input[type='text']").value;
      const telefone = formSorteio.querySelector("input[type='tel']").value;

      // Salva no localStorage (simples)
      const leads = JSON.parse(localStorage.getItem("leads_sorteio")) || [];
      leads.push({ nome, telefone });
      localStorage.setItem("leads_sorteio", JSON.stringify(leads));

      alert("Cadastro realizado com sucesso! Boa sorte no sorteio 🎉");
      formSorteio.reset();
    });
  }
});