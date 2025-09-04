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

function obtenerTokenDesdeHeader() {
  $headers = getallheaders();
  return $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
}

try {
  // 🔐 Validar token
  $authHeader = obtenerTokenDesdeHeader();
  if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    throw new Exception("Token no proporcionado.");
  }

  $jwt = $matches[1];
  $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
  $tutor_id = $decoded->sub;

  // 📥 Leer datos del body
  $data = json_decode(file_get_contents("php://input"), true);
  $alumno_id = $data['alumno_id'] ?? null;
  $tutoria_id = $data['tutoria_id'] ?? null;
  $fecha_hora = $data['fecha_hora'] ?? null;
  $link = $data['link'] ?? null; // ✅ NUEVO: leer link personalizado

  if (!$alumno_id || !$tutoria_id || !$fecha_hora) {
    throw new Exception("Datos incompletos.");
  }

  // 🧪 Validar formato de fecha
  if (!strtotime($fecha_hora)) {
    throw new Exception("Formato de fecha inválido.");
  }

  // 📆 Derivar fecha_clase
  $fecha_clase = date('Y-m-d', strtotime($fecha_hora));

  // 🔍 Validar conexión previa
  $stmt = $conn->prepare("
    SELECT id FROM TUTORIAS_CONTACTADAS
    WHERE tutor_id = ? AND alumno_id = ? AND tutoria_id = ?
    LIMIT 1
  ");
  $stmt->execute([$tutor_id, $alumno_id, $tutoria_id]);
  $contacto = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$contacto) {
    throw new Exception("No se encontró la conexión previa.");
  }

  $contacto_id = $contacto['id'];

  // 🔁 Verificar si ya existe una clase pendiente para ese contacto
  $stmt = $conn->prepare("
    SELECT COUNT(*) 
    FROM CLASES_PROGRAMADAS 
    WHERE contacto_id = ? AND estado = 'pendiente'
  ");
  $stmt->execute([$contacto_id]);
  if ($stmt->fetchColumn() > 0) {
    throw new Exception("Ya hay una clase pendiente para esta conexión.");
  }

  // 🔗 Usar link personalizado o generar sala Jitsi
  $sala_jitsi = $link ?: 'TUTORIA_' . md5($tutor_id . $alumno_id . $tutoria_id . $fecha_hora);

  // ✅ Insertar clase programada
  $stmt = $conn->prepare("
    INSERT INTO CLASES_PROGRAMADAS (
      contacto_id, tutor_id, alumno_id, tutoria_id,
      fecha_hora, fecha_clase, sala_jitsi, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
  ");
  $stmt->execute([
    $contacto_id, $tutor_id, $alumno_id, $tutoria_id,
    $fecha_hora, $fecha_clase, $sala_jitsi
  ]);

  // 🔄 Actualizar estado de la conexión a "agendada"
  $update = $conn->prepare("
    UPDATE TUTORIAS_CONTACTADAS
    SET estado = 'agendada'
    WHERE id = ?
  ");
  $update->execute([$contacto_id]);

  echo json_encode([
    "success" => true,
    "message" => "Clase agendada correctamente.",
    "sala_jitsi" => $sala_jitsi
  ]);

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "error" => $e->getMessage()
  ]);
}