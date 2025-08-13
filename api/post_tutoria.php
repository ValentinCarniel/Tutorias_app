<?php
require 'conn.php';

// Headers CORS (antes de cualquier salida)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Responder al preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==============================
// Configuración JWT
// ==============================
$secretKey = 'clave_super_secreta_para_TUTORIA';

if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo json_encode(['success'=>false,'message'=>'Falta composer/vendor/autoload.php para JWT']);
    exit();
}
require __DIR__ . '/vendor/autoload.php';

// ==============================
// Leer token JWT y datos
// ==============================
try {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception("Token no proporcionado.");
    }

    $jwt = $matches[1];
    $decoded = \Firebase\JWT\JWT::decode($jwt, new \Firebase\JWT\Key($secretKey, 'HS256'));
    $id_tutor = $decoded->sub;

    $data = json_decode(file_get_contents("php://input"), true);
    $titulo      = $data['titulo'] ?? 'Sin título';
    $descripcion = $data['descripcion'] ?? null;
    $precio      = $data['precio'] ?? null;
    $referencias = $data['referencias'] ?? [];

    if (!$descripcion || !$precio) {
        throw new Exception("Faltan campos obligatorios.");
    }

    // Insertar tutoría
    $stmt = $conn->prepare("INSERT INTO TUTORIA (id_tutor, titulo, descripcion, precio, fecha_publicacion)
                            VALUES (:id_tutor, :titulo, :descripcion, :precio, NOW())");
    $stmt->execute([
        ':id_tutor' => $id_tutor,
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':precio' => $precio
    ]);

    $id_tutoria = $conn->lastInsertId();

    // Insertar referencias
    $rStmt = $conn->prepare("INSERT INTO REFERENCIA (id_tutoria, texto) VALUES (:id_tutoria, :texto)");
    foreach ($referencias as $ref) {
        $ref = trim($ref);
        if ($ref !== '') {
            $rStmt->execute([
                ':id_tutoria' => $id_tutoria,
                ':texto' => $ref
            ]);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Tutoría publicada exitosamente.",
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
