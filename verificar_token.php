<?php
require_once __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// 🔐 Clave secreta
$secretKey = 'clave_super_secreta_para_TUTORIA';

// Leer headers
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    echo json_encode([
        "logged_in" => false,
        "message" => "Token no proporcionado"
    ]);
    exit;
}

$authHeader = $headers['Authorization'];
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    echo json_encode([
        "logged_in" => false,
        "message" => "Formato del token incorrecto"
    ]);
    exit;
}

$jwt = $matches[1];

try {
    $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));

    require_once 'conn.php';
    $stmt = $conn->prepare('SELECT nombre FROM USUARIOS WHERE id_usuario = ? LIMIT 1');
    $stmt->execute([$decoded->sub]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

   echo json_encode([
    "logged_in" => true,
    "id_usuario" => $decoded->sub,
    "email" => $decoded->email,
    "rol" => strtolower($decoded->rol), // 👈 Aquí lo convertís a minúsculas
    "nombre" => $user['nombre'] ?? $decoded->email
]);
} catch (Exception $e) {
    echo json_encode([
        "logged_in" => false,
        "message" => "Token inválido o expirado"
    ]);
}
