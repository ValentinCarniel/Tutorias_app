<?php
require 'vendor/autoload.php';
use Firebase\JWT\JWT;

require 'conn.php';

// 🔐 Clave secreta para firmar el token
$secretKey = 'clave_super_secreta_para_TUTORIA';

// Headers CORS (antes de cualquier salida)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

// Datos desde JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan email y/o contraseña.']);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

try {
    $stmt = $conn->prepare('SELECT * FROM USUARIOS WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciales inválidas.']);
        exit;
    }

    $payload = [
        'iss' => 'tutoria_auth',
        'iat' => time(),
        'exp' => time() + 3600, // 1 hora de validez
        'sub' => $user['id_usuario'],
        'email' => $user['email'],
        'rol' => $user['rol']
    ];

    $token = JWT::encode($payload, $secretKey, 'HS256');

    echo json_encode([
        'success' => true,
        'token' => $token,
        'rol' => $user['rol'],
        'nombre' => $user['nombre']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
