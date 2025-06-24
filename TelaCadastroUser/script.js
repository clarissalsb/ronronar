// Esperar o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.cadastro-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pegar os campos
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    // Validações básicas
    if (!nome || !email || !telefone || !senha) {
      alert('Preencha todos os campos! ⚠️');
      return;
    }
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem! ❌');
      return;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email inválido! 📧');
      return;
    }

    // validação simples de senha
    // (Depois mete um regex pra deixar mais complexa)
    if (senha.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres! 🔐');
      return;
    }


    const dadosUsuario = { nome, email, telefone, senha };

    // Chamar o back-end (caiaques)
    fetch('https://sua-api.com/cadastro', { // mudar o link para o back-end real mais tarde
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosUsuario),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Usuário cadastrado:', data);
        alert(`Cadastro concluído com sucesso, ${nome}! 🎉`);
        form.reset();
      })
      .catch((err) => {
        console.error(err);
        alert('Ops! Ocorreu um erro no cadastro. Tente novamente mais tarde. 😟');
      });
  });
});
