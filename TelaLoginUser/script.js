// Esperar o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pegar os campos
    const nome = document.getElementById('nome').value.trim();
    
    
    const senha = document.getElementById('senha').value;
 

    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';


    let erros = [];

    // Validações básicas
    if (!nome || !senha) {
      erros.push('Preencha todos os campos! ⚠️');
    }


    
   

   if (erros.length > 0) {
      errorDiv.innerHTML = erros.join('<br><br>');
      errorDiv.style.display = 'block';
      return;
    }

    errorDiv.style.display = 'none';
    const dadosUsuario = { nome: nome, senha: senha };


    // Chamar o back-end (caiaques)
    fetch('https://ronronar.onrender.com/login/user', { // tocer pra esse funcionar
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