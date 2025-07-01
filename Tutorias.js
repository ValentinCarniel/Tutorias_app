// ==============================
// ❤️ Me gusta en publicaciones
// ==============================
function likePost(button) {
  const isLiked = button.classList.toggle("liked");

  const heartSpan = button.querySelector(".heart");
  heartSpan.style.color = isLiked ? "red" : "black";

  button.textContent = isLiked ? "¡Te gusta!" : "Me gusta";
  button.prepend(heartSpan); // Mantener el icono al inicio del texto

  button.style.backgroundColor = isLiked ? "var(--morado)" : "";
  button.style.color = isLiked ? "#fff" : "";
}

// ==============================
// 🧪 Buscador de publicaciones (básico)
// ==============================
document.getElementById("searchTutores").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const posts = document.querySelectorAll(".post");

  posts.forEach(post => {
    const contenido = post.textContent.toLowerCase();
    post.style.display = contenido.includes(query) ? "block" : "none";
  });
});

// ==============================
// ✨ Animación de entrada en publicaciones
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const posts = document.querySelectorAll(".post");
  posts.forEach((post, i) => {
    post.style.opacity = "0";
    post.style.transform = "translateY(20px)";
    setTimeout(() => {
      post.style.transition = "all 0.4s ease";
      post.style.opacity = "1";
      post.style.transform = "translateY(0)";
    }, i * 150);
  });
});
