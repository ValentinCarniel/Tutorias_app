<?php
require_once 'conn.php';
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secretKey = 'clave_super_secreta_para_TUTORIA';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

try {
  $headers = getallheaders();
  $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

  if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    throw new Exception("Token no proporcionado.");
  }

  $jwt = $matches[1];
  $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
  $alumno_id = $decoded->sub;

  // ⏱️ Marcar clases vencidas como finalizadas
  $finalizar = $conn->prepare("
    UPDATE clases_programadas
    SET estado = 'finalizada'
    WHERE fecha_hora < NOW() AND estado = 'pendiente' AND alumno_id = ?
  ");
  $finalizar->execute([$alumno_id]);

  // 🔁 Volver a poner la conexión como "pendiente" si la clase ya finalizó
  $reset = $conn->prepare("
    UPDATE tutorias_contactadas
    SET estado = 'pendiente'
    WHERE id IN (
      SELECT contacto_id
      FROM clases_programadas
      WHERE fecha_hora < NOW() AND estado = 'finalizada' AND alumno_id = ?
    )
  ");
  $reset->execute([$alumno_id]);

  // 📦 Obtener todas las conexiones del alumno
  $stmt = $conn->prepare("
    SELECT 
      tc.id AS contacto_id,
      tc.estado,
      tc.fecha_conexion,
      t.titulo AS tutoria_titulo,
      u.nombre AS tutor_nombre,
      cp.fecha_hora,
      cp.sala_jitsi
    FROM tutorias_contactadas tc
    JOIN TUTORIA t ON tc.tutoria_id = t.id_tutoria
    JOIN USUARIO u ON tc.tutor_id = u.id_usuario
    LEFT JOIN clases_programadas cp ON cp.contacto_id = tc.id AND cp.estado = 'pendiente'
WHERE tc.alumno_id = ? AND cp.id IS NULL
    ORDER BY tc.fecha_conexion DESC
  ");
  $stmt->execute([$alumno_id]);
  $conexiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "conexiones" => $conexiones
  ]);

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "error" => $e->getMessage()
  ]);
}