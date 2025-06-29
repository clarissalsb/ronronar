// Esperar o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    //pegar campos
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    
    // Resetar mensagens de erro
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';
  
    let erros = [];

    // Validações básicas
    if (!email || !senha) {
      erros.push('⚠️ Preencha todos os campos!');
    }

    if (erros.length > 0) {
      errorDiv.innerHTML = erros.join('<br><br>');
      errorDiv.style.display = 'block';
      return;
    }
    
    const dadosUsuario = { email, senha };

    fetch('http://localhost:3001/login/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json','Autorization':'Bearer'+ 'JWT_SECRET'
      },
      body: JSON.stringify(dadosUsuario),
    })
    .then(response =>{
      if (!response.ok){
      throw new Error('Erro na autenticação:'+response.status)
      } return response.json()
    })
      .then((data) => {
        console.log('Dados recebidos:'+data)
  })
      .catch((error) => {
       
        console.error('Erro:', error.message);
      });

})


})