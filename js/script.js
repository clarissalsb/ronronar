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
          <div class="usuario-dropdown">
            <button id="btn-usuario">${nomeUsuario}</button>
            <div id="menu-usuario" class="menu-usuario">
              <a href="#">Perfil</a>
              <a href="#">Meus Apadrinhamentos</a>
              <a href="#" onclick="logout()">Sair</a>
            </div>
          </div>
          <button id="btn-contraste" class="btn-contraste">Alto contraste</button>
        </div>
      `;

      const btnUsuario = document.getElementById("btn-usuario");
      const menu = document.getElementById("menu-usuario");

      btnUsuario.addEventListener("click", () => {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
      });

      window.addEventListener("click", (event) => {
        if (!btnUsuario.contains(event.target)) {
          menu.style.display = "none";
        }
      });

    } else {
      // Usuário não logado
      areaUsuario.innerHTML = `
        <div class="usuario-wrapper">
          <button id="btn-contraste" class="btn-contraste">Alto contraste</button>
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

      const inputTelefone = document.getElementById('telefone');

      if (inputTelefone) {
        inputTelefone.addEventListener('input', function (e) {
            let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito

            // Formatação: (XX) 9XXXX-XXXX
            if (valor.length > 11) valor = valor.slice(0, 11); // Limita a 11 dígitos

            if (valor.length > 6) {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
            } else if (valor.length > 2) {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
            } else if (valor.length > 0) {
                valor = `(${valor}`;
            }

            e.target.value = valor;
        });
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

  // ==== TELA DE ADMIN ====
  if (document.getElementById("user-table-body")) {
    function ativarBotoesAcoes () {
      const botoes = document.querySelectorAll(".action-toggle");

      botoes.forEach((botao) => {
        botao.addEventListener("click", (e) => {
          e.stopPropagation();

          document.querySelectorAll(".action-menu").forEach(menu => {
            if (menu !== botao.nextElementSibling) {
              menu.classList.remove("aberto");
            }
          });

          const menu = botao.nextElementSibling;
          menu.classList.toggle("aberto");
        });
      });

      document.addEventListener("click", () => {
        document.querySelectorAll(".action-menu").forEach(menu => {
          menu.classList.remove("aberto");
        });
      });
    }

    function carregarUsuarios() {
      fetch("http://localhost:3001/usuarios")
        .then(res => {
          if (!res.ok) throw new Error("Erro ao buscar usuários");
          return res.json();
        })
        .then(usuarios => {
          const tabela = document.getElementById("user-table-body");
          tabela.innerHTML = "";

          usuarios.forEach(usuario => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
              <td>${usuario.nome}</td>
              <td>${usuario.email}</td>
              <td>${usuario.telefone}</td>
              <td>${usuario.senha}</td>
              <td>${usuario.status}</td>
              <td> 
                <div class="user-actions">
                    <button class="action-toggle">⋮</button>
                    <div class="action-menu">
                        <button class="action-item">Remover</button>
                        <button class="action-item">Tornar Admin</button>
                    </div>
                </div>
              </td>
            `;
            tabela.appendChild(linha);
          });

          ativarBotoesAcoes();
        })
        .catch(err => console.error("Erro ao carregar usuários:", err));
    }

    carregarUsuarios();
  }
});

// ==== FUNÇÃO GLOBAL ====
function logout() {
  localStorage.clear();
  window.location.href = "../TelaLoginUser/index.html";
}
