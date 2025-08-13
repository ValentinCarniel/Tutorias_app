<?php
// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

require __DIR__ . '/conn.php';

// 🔐 Clave secreta para firmar el token
$secretKey = 'clave_super_secreta_para_TUTORIA';

// ==============================
// Leer datos desde JSON
// ==============================
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan email y/o contraseña.']);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

// ==============================
// Autenticación
// ==============================
try {
    $stmt = $conn->prepare('SELECT * FROM USUARIO WHERE email = ? LIMIT 1');
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
        'exp' => time() + 3600, // 1 hora
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
