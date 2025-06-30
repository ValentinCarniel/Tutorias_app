function likePost(button) {
    const isLiked = button.classList.toggle("liked");

    const heartSpan = button.querySelector(".heart");
    heartSpan.style.color = isLiked ? "red" : "black";

    button.textContent = isLiked ? "¡Te gusta!" : "Me gusta";
    button.prepend(heartSpan); // Mantener el icono al inicio del texto

    button.style.backgroundColor = isLiked ? "#6f42c1" : "";
    button.style.color = isLiked ? "#fff" : "";
}