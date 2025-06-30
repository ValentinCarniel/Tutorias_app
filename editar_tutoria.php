
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

include("conn.php");
// el resto del código...

include("conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit("Solo POST permitido");
}

$id_tutor = 1;

$id_tutoria = $_POST['id_tutoria'] ?? null;
$id_materia = $_POST['id_materia'] ?? null;
$descripcion = $_POST['descripcion'] ?? '';
$precio = $_POST['precio'] ?? 0;

if (!$id_tutoria || !$id_materia || !$descripcion) {
    http_response_code(400);
    exit("Faltan datos obligatorios");
}

$stmt = $conn->prepare("UPDATE Tutorias SET id_materia = ?, descripcion = ?, precio = ? WHERE id_tutoria = ? AND id_tutor = ?");
$ok = $stmt->execute([$id_materia, $descripcion, $precio, $id_tutoria, $id_tutor]);

echo $ok ? 'ok' : 'error';
?>
