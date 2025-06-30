<?php
try {
    $conn = new PDO("mysql:host=localhost;dbname=app_tutorias", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES utf8"); // Para caracteres especiales
} catch(PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
