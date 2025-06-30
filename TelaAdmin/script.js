function carregarUsuarios() {
        fetch("http://localhost:3000/usuarios")
            .then(res => res.json())
            .then(usuarios => {
              const tbody = document.getElementById("user-table-body");
              tbody.innerHTML = ""; // Limpa antes de adicionar

              usuarios.forEach(usuario => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${usuario.nome}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.telefone}</td>
                    <td>${usuario.senha}</td>
                    <td>${usuario.status}</td>
                    <td>
                        <div class="user-actions">
                            <button class="action-toggle">⋮</button>
                            <div class="action-menu">
                                <button class="action-item" onclick="removerUsuario(${usuario.id})">Remover</button>
                                <button class="action-item" onclick="toggleAdmin(${usuario.id}, '${usuario.status}')">
                                    ${usuario.status === "Admin" ? "Remover Admin" : "Tornar Admin"}
                                </button>
                            </div>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            // Reativa os botões de toggle do menu após carregar usuários
             ativarBotoesAcoes();
        })
        .catch(err => {
            console.error("Erro ao buscar usuários:", err);
        });
    }

document.addEventListener('DOMContentLoaded', (carregarUsuarios) => {
    document.querySelectorAll('.action-toggle').forEach(button => {
        button.addEventListener('click', function (event) {
        event.stopPropagation();
        document.querySelectorAll('.action-menu').forEach(menu => {
            if (menu !== this.nextElementSibling) {
            menu.style.display = 'none';
            }
        });
        const menu = this.nextElementSibling;
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.action-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    });
});