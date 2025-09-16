<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Responder preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Requerir conn.php desde la carpeta padre
require __DIR__ . '/../conn.php';

$emisor = intval($_GET['emisor']);
$receptor = intval($_GET['receptor']);

try {
    $stmt = $conn->prepare("SELECT * FROM mensajes 
        WHERE (emisor_id=:emisor AND receptor_id=:receptor)
           OR (emisor_id=:receptor AND receptor_id=:emisor)
        ORDER BY fecha ASC");
    $stmt->execute([
        ':emisor' => $emisor,
        ':receptor' => $receptor
    ]);
    $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($mensajes);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
