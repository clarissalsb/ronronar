document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Pegar campos
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    // Resetar mensagens de erro
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';

    let erros = [];

    // Validações básicas
    if (!email || !senha) {
      erros.push('⚠ Preencha todos os campos!');
    }

    if (erros.length > 0) {
      errorDiv.innerHTML = erros.join('<br><br>');
      errorDiv.style.display = 'block';
      return;
    }

    const dadosUsuario = { email, senha };

    // Função para tentar login
    async function tentarLogin(dados) {
      try {
        const response = await fetch('http://localhost:3001/login/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dados),
        });

        const resultado = await response.json();

       if (resultado.success) {
          localStorage.setItem("usuarioLogado", resultado.nome); // aqui tava o erro antes
          window.location.href = "../TelaInicial/index.html";
        } else {
          errorDiv.innerHTML = resultado.message || 'Login falhou. Verifique seus dados.';
          errorDiv.style.display = 'block';
        }
      } catch (erro) {
        errorDiv.innerHTML = 'Erro ao enviar dados. Tente novamente mais tarde.';
        errorDiv.style.display = 'block';
        console.error('Erro ao enviar dados:', erro);
      }
    }

    // Chamada da função após a definição
    await tentarLogin(dadosUsuario);
  });
});
