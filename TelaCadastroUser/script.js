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
    const dadosUsuario = { nome, email, telefone, senha };
    return;


    // Chamar o back-end (caiaques)
//    fetch('https://sua-api.com/cadastro', { // mudar o link para o back-end real mais tarde
//      method: 'POST',
//      headers: {
//        'Content-Type': 'application/json',
//      },
//      body: JSON.stringify(dadosUsuario),
//    })
//      .then((res) => {
//        if (!res.ok) {
//          throw new Error(`Erro ${res.status}: ${res.statusText}`);
//        }
//        return res.json();
//      })
//      .then((data) => {
//        console.log('Usuário cadastrado:', data);
//        alert(`Cadastro concluído com sucesso, ${nome}! 🎉`);
//        form.reset();
//      })
//      .catch((err) => {
//        console.error(err);
//        alert('Ops! Ocorreu um erro no cadastro. Tente novamente mais tarde. 😟');
//      });
  });
});
