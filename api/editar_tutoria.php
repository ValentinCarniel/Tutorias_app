<?php
// ==============================
// Headers CORS
// ==============================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

// Responder al preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==============================
// Requerir dependencias
// ==============================
require __DIR__ . '/conn.php';
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo json_encode(['success'=>false,'message'=>'Falta composer/vendor/autoload.php para JWT']);
    exit();
}
require __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// ==============================
// Clave secreta JWT
// ==============================
$secretKey = 'clave_super_secreta_para_TUTORIA';

// ==============================
// Leer token y datos JSON
// ==============================
try {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception("Token no proporcionado.");
    }

    $jwt = $matches[1];
    $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
    $id_tutor = $decoded->sub;

    $data = json_decode(file_get_contents("php://input"), true);
    $id_tutoria = $data['id_tutoria'] ?? null;
    $titulo      = $data['titulo'] ?? 'Sin título';
    $descripcion = $data['descripcion'] ?? null;
    $precio      = $data['precio'] ?? null;
    $referencias = $data['referencias'] ?? [];

    if (!$id_tutoria || !$descripcion || !$precio) {
        throw new Exception("Faltan campos obligatorios.");
    }

    // ==============================
    // Actualizar tutoría
    // ==============================
    $stmt = $conn->prepare("UPDATE TUTORIA SET titulo = ?, descripcion = ?, precio = ? WHERE id_tutoria = ? AND id_tutor = ?");
    $stmt->execute([$titulo, $descripcion, $precio, $id_tutoria, $id_tutor]);

    // ==============================
    // Actualizar referencias
    // ==============================
    // Borrar existentes
    $delStmt = $conn->prepare("DELETE FROM REFERENCIA WHERE id_tutoria = ?");
    $delStmt->execute([$id_tutoria]);

    // Insertar nuevas
    $rStmt = $conn->prepare("INSERT INTO REFERENCIA (id_tutoria, texto) VALUES (?, ?)");
    foreach ($referencias as $ref) {
        $ref = trim($ref);
        if ($ref !== '') {
            $rStmt->execute([$id_tutoria, $ref]);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Tutoría actualizada correctamente.",
        "id_tutoria" => $id_tutoria
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
