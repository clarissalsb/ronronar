document.addEventListener("DOMContentLoaded", () => {
  // ==== TEMA: Alto contraste ====
  if (localStorage.getItem("temaContraste") === "ativo") {
    document.body.classList.add("alto-contraste");
  }

  // ==== CABEÇALHO / LOGIN ====
  const nomeUsuario = localStorage.getItem("usuarioLogado");
  const areaUsuario = document.getElementById("areaUsuario");

  if (areaUsuario) {
    if (nomeUsuario) {
      // Usuário logado
      areaUsuario.innerHTML = `
        <div class="usuario-wrapper">
        <button id="btn-contraste" class="btn-contraste-icon" title="Ativar alto contraste">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#9B2AA6" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18V4a8 8 0 0 1 0 16Z" />
            </svg>
          </button>
          <div class="usuario-dropdown">
            <button id="btn-usuario">${nomeUsuario}
              <svg class="seta-baixo" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div id="menu-usuario" class="menu-usuario">
              <a href="#">Perfil</a>
              <a href="#">Meus Apadrinhamentos</a>
              <a href="#" onclick="logout()">Sair</a>
            </div>
          </div>
          
        </div>
      `;

      const btnUsuario = document.getElementById("btn-usuario");
      const menu = document.getElementById("menu-usuario");

      btnUsuario.addEventListener("click", () => {
        const aberto = menu.style.display === "block";
        menu.style.display = menu.style.display = aberto ? "none" : "block";
        btnUsuario.classList.toggle("aberto", !aberto);
      });

      window.addEventListener("click", (event) => {
        if (!btnUsuario.contains(event.target)) {
          menu.style.display = "none";
          btnUsuario.classList.remove("aberto");
        }
      });

    } else {
      // Usuário não logado
      areaUsuario.innerHTML = `
        <div class="usuario-wrapper">
          <button id="btn-contraste" class="btn-contraste-icon" title="Ativar alto contraste">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#9B2AA6" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18V4a8 8 0 0 1 0 16Z" />
            </svg>
          </button>
          <a href="../TelaLoginUser/index.html" class="btn-login">Entrar</a>
          <a href="../TelaCadastroUser/index.html" class="btn-cadastro">Cadastrar</a>
        </div>
      `;
    }

    // Botão de contraste (sempre presente)
    const btnContraste = document.getElementById("btn-contraste");
    if (btnContraste) {
      btnContraste.addEventListener("click", () => {
        document.body.classList.toggle("alto-contraste");
        const contrasteAtivo = document.body.classList.contains("alto-contraste");
        localStorage.setItem("temaContraste", contrasteAtivo ? "ativo" : "inativo");
      });
    }
  }

  // ==== TELA DE CADASTRO ====
  const formCadastro = document.querySelector('.cadastro-form');
  if (formCadastro) {
    const errorDiv = document.getElementById('error-message');
    const inputTelefone = document.getElementById('telefone');

    if (inputTelefone) {

      // Função que formata e mantém o cursor no lugar certo
      function formatarTelefoneComCursor(input) {
        let posicao = input.selectionStart;
        let valorOriginal = input.value;
        let numeros = valorOriginal.replace(/\D/g, '');

        // Limita a 11 dígitos
        numeros = numeros.slice(0, 11);

        // Formata
        let novoValor = '';
        if (numeros.length > 0) novoValor = '(' + numeros.slice(0, 2);
        if (numeros.length >= 3) novoValor += ') ' + numeros.slice(2, 7);
        if (numeros.length >= 8) novoValor += '-' + numeros.slice(7);
        else if (numeros.length > 2 && numeros.length <= 7) novoValor += numeros.slice(7);

        // Define nova posição do cursor
        let deslocamento = 0;
        if (valorOriginal.length < novoValor.length) {
          deslocamento = novoValor.length - valorOriginal.length;
        }

        input.value = novoValor;

        // Só reposiciona se o cursor não estiver no final
        if (posicao < novoValor.length) {
          input.setSelectionRange(posicao + deslocamento, posicao + deslocamento);
        }
      }

      // Listener que chama a função ao digitar
      inputTelefone.addEventListener('input', () => {
        formatarTelefoneComCursor(inputTelefone);
      });
    }

    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const senha = document.getElementById('senha').value;
      const confirmarSenha = document.getElementById('confirmar-senha').value;

      errorDiv.style.display = 'none';
      errorDiv.innerHTML = '';

      let erros = [];

      if (!nome || !email || !telefone || !senha) {
        erros.push('Preencha todos os campos! ⚠️');
      }

      if (senha !== confirmarSenha) {
        erros.push('As senhas não coincidem! ❌');
      }

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

      const dadosUsuario = { nome, email, telefone, senha };

      fetch('http://localhost:3001/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosUsuario),
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            localStorage.setItem("usuarioLogado", nome);
            window.location.href = "../TelaInicial/index.html";
          } else {
            errorDiv.innerHTML = response.message || 'Erro ao cadastrar.';
            errorDiv.style.display = 'block';
          }
        })
        .catch(error => {
          errorDiv.innerHTML = 'Erro ao enviar dados.';
          errorDiv.style.display = 'block';
          console.error('Erro ao enviar dados:', error);
        });
    });
  }

  // ==== TELA DE LOGIN ====
  const formLogin = document.querySelector('.login-form');
  if (formLogin) {
    const errorDiv = document.getElementById('error-message');

    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value;

      errorDiv.style.display = 'none';
      errorDiv.innerHTML = '';

      let erros = [];

      if (!email || !senha) {
        erros.push('⚠ Preencha todos os campos!');
      }

      if (erros.length > 0) {
        errorDiv.innerHTML = erros.join('<br><br>');
        errorDiv.style.display = 'block';
        return;
      }

      const dadosUsuario = { email, senha };

      try {
        const response = await fetch('http://localhost:3001/login/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosUsuario),
        });

        const resultado = await response.json();

        if (resultado.success) {
          localStorage.setItem("usuarioLogado", resultado.nome);
          if (resultado.token) {
           localStorage.setItem("token", resultado.token); // ← Aqui você salva o token
          }
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
    });
  }

  // ==== CARDS E MODAL DOS PETS ====
  if (document.getElementById('tela-inicial') || document.getElementById('tela-apadrinhamento')){
    const container = document.querySelector('.cards-container');
    const modal = document.getElementById('pet-modal');
    const closeBtn = document.querySelector('.modal-close');

    // Elementos do modal
    const modalImg = document.getElementById('modal-img');
    const modalNome = document.getElementById('modal-nome');
    const modalGenero = document.getElementById('modal-genero');
    const modalSaude = document.getElementById('modal-saude');
    const modalOutros = document.getElementById('modal-outros');
    const modalDesc = document.getElementById('modal-desc'); 

    fetch('http://localhost:3001/pets/listagem')
    .then(res => res.json())
    .then(data => {
  data.pets.forEach(pet => {
    // aqui continua normal
  
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
          <img src="${pet.imagem}" alt="${pet.nome}">
          <p class="nome-gato">${pet.nome}</p>
        `;

       // Evento para abrir o modal
        card.addEventListener('click', () => {
          modalImg.src = pet.imagem;
          modalNome.textContent = `${pet.nome}, ${pet.idade}`;
          modalGenero.textContent = pet.genero;
          modalSaude.textContent = pet.saude;
          modalOutros.textContent = pet.caracteristicas || '';
          modalDesc.textContent = pet.descricao || '';
          modal.classList.remove('hidden');
        });

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Erro ao carregar pets:', err);
    });

    // Fecha o modal
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  // ==== TELA DE ADMIN ====
  // ==== Função para carregar usuários ====
  function carregarUsuarios() {
    fetch("http://localhost:3001/api/user", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json();
    })
    .then(dados => {
      const tabela = document.getElementById("user-table-body");
      tabela.innerHTML = "";

      dados.users.forEach(usuario => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${usuario.nome}</td>
          <td>${usuario.email}</td>
          <td>${usuario.telefone || '---'}</td>
          <td>${usuario.isAdmin ? 'Admin' : 'Usuário'}</td>
          <td> 
            <div class="user-actions">
              <button class="action-toggle">⋮</button>
              <div class="action-menu">
                <button class="action-item btn-remover">Remover</button>
                <button class="action-item btn-promover">Tornar Admin</button>
              </div>
            </div>
          </td>
        `;
        linha.dataset.userid = usuario.id;
        tabela.appendChild(linha);
      });

      ativarBotoesAcoes();

      // Botões de ação
      document.querySelectorAll('.btn-promover').forEach(botao => {
        botao.addEventListener('click', function () {
          const idUsuario = this.closest('tr').dataset.userid;
          promoverUsuario(idUsuario);
        });
      });

      document.querySelectorAll('.btn-remover').forEach(botao => {
        botao.addEventListener('click', function () {
          const idUsuario = this.closest('tr').dataset.userid;
          removerUsuario(idUsuario);
        });
      });

    })
    .catch(err => console.error("Erro ao carregar usuários:", err));
  }

  // ==== Função para promover usuário ====
  async function promoverUsuario(id) {
    try {
      const response = await fetch(`http://localhost:3001/promoveradmin/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isAdmin: true })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Erro ao promover usuário");

      alert(result.message);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao promover usuário.");
    }
  }

  // ==== Função para remover usuário ====
async function removerUsuario(id) {
  try {
    const response = await fetch(`http://localhost:3001/user/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Erro ao remover usuário");

    alert(result.message);
    carregarUsuarios();
  } catch (err) {
    console.error(err);
    alert("Erro ao remover usuário.");
  }
}


  // ==== Função para ativar botões de ação (⋮) ====
  function ativarBotoesAcoes() {
    const botoes = document.querySelectorAll(".action-toggle");

    botoes.forEach(botao => {
      botao.addEventListener("click", (e) => {
        e.stopPropagation();

        document.querySelectorAll(".action-menu.aberto").forEach(menu => {
          if (menu !== botao.nextElementSibling) {
            menu.classList.remove("aberto");
          }
        });

        const menu = botao.nextElementSibling;
        menu.classList.toggle("aberto");
      });
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(".action-menu.aberto").forEach(menu => {
        menu.classList.remove("aberto");
      });
    });
  }

  // ==== Executar apenas se for a tela de admin ====
  if (document.getElementById("user-table-body")) {
    carregarUsuarios();
  }

});

// ==== FUNÇÃO GLOBAL ====
function logout() {
  localStorage.clear();
  window.location.href = "../TelaLoginUser/index.html";
}
