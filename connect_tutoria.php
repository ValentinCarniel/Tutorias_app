<?php
require_once 'conn.php';
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secretKey = 'clave_super_secreta_para_TUTORIA';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

header("Content-Type: application/json");

// 🔐 Función para obtener el token desde cualquier fuente
function obtenerTokenDesdeHeader() {
  $headers = getallheaders();
  if (isset($headers['Authorization'])) return $headers['Authorization'];
  if (isset($headers['authorization'])) return $headers['authorization'];
  if (isset($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
  return null;
}

try {
  // 🔐 Leer y validar token
  $authHeader = obtenerTokenDesdeHeader();
  if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    throw new Exception("Token no proporcionado.");
  }

  $jwt = $matches[1];
  $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
  $alumno_id = $decoded->sub;

  // 📥 Leer ID de tutoría desde el body
  $data = json_decode(file_get_contents("php://input"), true);
  $tutoria_id = $data['tutoria_id'] ?? null;

  if (!$tutoria_id) {
    throw new Exception("ID de tutoría no recibido.");
  }

  // 🔍 Buscar tutor asociado
  $stmt = $conn->prepare("SELECT id_tutor FROM TUTORIAS WHERE id_tutoria = ?");
  $stmt->execute([$tutoria_id]);
  $tutor = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$tutor) {
    throw new Exception("Tutoría no encontrada.");
  }

  $tutor_id = $tutor['id_tutor'];

  // 🔁 Verificar si ya existe la conexión
  $stmt = $conn->prepare("SELECT COUNT(*) FROM TUTORIAS_CONTACTADAS WHERE alumno_id = ? AND tutoria_id = ?");
  $stmt->execute([$alumno_id, $tutoria_id]);
  if ($stmt->fetchColumn() > 0) {
    throw new Exception("Ya te conectaste con esta tutoría.");
  }

  // ✅ Insertar nueva conexión
  $stmt = $conn->prepare("INSERT INTO TUTORIAS_CONTACTADAS (alumno_id, tutor_id, tutoria_id, fecha_conexion) VALUES (?, ?, ?, NOW())");
  $stmt->execute([$alumno_id, $tutor_id, $tutoria_id]);

  echo json_encode([
    "success" => true,
    "message" => "Conexión registrada exitosamente.",
    "tutoria_id" => $tutoria_id,
    "tutor_id" => $tutor_id
  ]);

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "error" => $e->getMessage()
  ]);
}