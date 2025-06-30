document.addEventListener("DOMContentLoaded", () => {
  const nomeUsuario = localStorage.getItem("usuarioLogado");
  const areaUsuario = document.getElementById("areaUsuario");

  if (nomeUsuario && areaUsuario) {
    areaUsuario.innerHTML = `
      <span>Olá, ${nomeUsuario}</span>
      <button onclick="logout()" class="btn-sair" style="margin-left: 10px;">Sair</button>
    `;
  }
});

function logout() {
  localStorage.clear();
  window.location.href = "../TelaLoginUser/index.html";
}
