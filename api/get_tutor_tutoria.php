<?php
// ==============================
// Headers CORS
// ==============================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: application/json');

// Responder al preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==============================
// Requerir dependencias
// ==============================
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    echo json_encode(['success' => false, 'message' => 'Falta composer/vendor/autoload.php']);
    exit();
}
require $autoload;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require __DIR__ . '/conn.php';

// ==============================
// Clave secreta JWT
// ==============================
$secretKey = 'clave_super_secreta_para_TUTORIA';

// ==============================
// Autenticación y obtención de tutorías
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

    $stmt = $conn->prepare("SELECT * FROM TUTORIA WHERE id_tutor = ? ORDER BY fecha_publicacion DESC");
    $stmt->execute([$id_tutor]);
    $tutorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $resultado = [];

    foreach ($tutorias as $t) {
        $refStmt = $conn->prepare("SELECT texto FROM REFERENCIA WHERE id_tutoria = ?");
        $refStmt->execute([$t['id_tutoria']]);
        $refs = $refStmt->fetchAll(PDO::FETCH_COLUMN);

        $resultado[] = [
            "id_tutoria" => $t['id_tutoria'],
            "titulo" => $t['titulo'],
            "descripcion" => $t['descripcion'],
            "precio" => $t['precio'],
            "fecha_publicacion" => $t['fecha_publicacion'],
            "referencias" => $refs
        ];
    }

    echo json_encode([
        "success" => true,
        "tutorias" => $resultado
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
