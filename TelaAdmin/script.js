function ativarBotoesAcoes (){
  const botoes = document.querySelectorAll(".action-toggle");

  botoes.forEach((botao) => {
    botao.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique feche o menu na hora

      // Fecha outros menus abertos
      document.querySelectorAll(".action-menu").forEach(menu => {
        if (menu !== botao.nextElementSibling) {
          menu.classList.remove("aberto");
        }
      });

      // Alterna o menu do botão clicado
      const menu = botao.nextElementSibling;
      menu.classList.toggle("aberto");
    });
  });

  // Fechar qualquer menu se clicar fora
  document.addEventListener("click", () => {
    document.querySelectorAll(".action-menu").forEach(menu => {
      menu.classList.remove("aberto");
    });
  });
}



function carregarUsuarios() {
  fetch("http://localhost:3000/usuarios") // substitua pela sua URL se for diferente
    .then(res => {
      if (!res.ok) {
        throw new Error("Erro ao buscar usuários");
      }
      return res.json();
    })
    .then(usuarios => {
      const tabela = document.getElementById("user-table-body");
      tabela.innerHTML = ""; // limpa antes de preencher

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

      ativarBotoesAcoes(); // reativa os botões nas novas linhas
    })
    .catch(err => {
      console.error("Erro ao carregar usuários:", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios();
  ativarBotoesAcoes();
});


