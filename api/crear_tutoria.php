<?php
// habilitar CORS para evitar problemas de origen cruzado
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Si es OPTIONS (preflight), solo salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'conn.php';

try {
    $id_materia = $_POST['id_materia'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $precio = $_POST['precio'] ?? null;

    if (!$id_materia || !$descripcion || !$precio) {
        throw new Exception("Faltan datos obligatorios.");
    }

    $sql = "INSERT INTO tutorias (id_materia, descripcion, precio, fecha_publicacion) VALUES (:id_materia, :descripcion, :precio, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id_materia', $id_materia);
    $stmt->bindParam(':descripcion', $descripcion);
    $stmt->bindParam(':precio', $precio);
    $stmt->execute();

    echo "ok";

} catch (Exception $e) {
    http_response_code(400);
    echo "error: " . $e->getMessage();
}
?>
