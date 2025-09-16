<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Responder preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Requerir conn.php desde la carpeta padre
require __DIR__ . '/../conn.php';

// Recibir JSON
$data = json_decode(file_get_contents("php://input"), true);

$emisor_id = intval($data['emisor_id']);
$receptor_id = intval($data['receptor_id']);
$mensaje = $data['mensaje'];

try {
    $stmt = $conn->prepare("INSERT INTO mensajes (emisor_id, receptor_id, mensaje) VALUES (:emisor, :receptor, :mensaje)");
    $stmt->execute([
        ':emisor' => $emisor_id,
        ':receptor' => $receptor_id,
        ':mensaje' => $mensaje
    ]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
