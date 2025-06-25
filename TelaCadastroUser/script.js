// Esperar o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.cadastro-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pegar os campos
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';


    let erros = [];

    // Validações básicas
    if (!nome || !email || !telefone || !senha) {
      erros.push('Preencha todos os campos! ⚠️');
    }


    if (senha !== confirmarSenha) {
      erros.push('As senhas não coincidem! ❌');
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      erros.push('Email inválido! ❌');
    }


   const senhaRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[$*&@#!])(?!.*(.)\1)[A-Za-z\d$*&@#!]{8,}$/;
   if (!senhaRegex.test(senha)) {
     erros.push(`
      <strong>A senha precisa ter:</strong> <br>
        - Pelo menos 8 caracteres<br>
        - Pelo menos uma letra maiúscula<br>
        - Pelo menos um número<br>
        - Pelo menos um caractere especial ($*&@#!)<br>
        - Não pode ter caracteres repetidos consecutivos<br>
    `);
   }

   if (erros.length > 0) {
      errorDiv.innerHTML = erros.join('<br><br>');
      errorDiv.style.display = 'block';
      return;
    }

    errorDiv.style.display = 'none';
    const dadosUsuario = { nome: nome, email: email, telefone: telefone, senha: senha };


    // Chamar o back-end (caiaques)
    fetch('https://ronronar.onrender.com/register/user', { // tocer pra esse funcionar
      method: 'POST',
     headers: {
        'Content-Type': 'application/json',
     },
      body: JSON.stringify(dadosUsuario),
    })
      .then(response => response.json())
      .then((resposta) => {
        if (resposta.success) {
          console.log('Usuário cadastrado com sucesso!');
        }
        else {
          errorDiv.innerHTML = resposta.message || 'Erro ao cadastrar usuário. Tente novamente mais tarde.';
          errorDiv.style.display = 'block';
        }
      })
      .catch((error) => {
        errorDiv.innerHTML = 'Erro ao enviar dados. Tente novamente mais tarde.';
        errorDiv.style.display = 'block';
        console.error('Erro ao enviar dados:', error);
      });
  });
});
