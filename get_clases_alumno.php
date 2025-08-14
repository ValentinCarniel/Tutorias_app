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

  // ⏱️ Marcar como finalizadas las clases que ya pasaron
  $actualizar = $conn->prepare("
    UPDATE clases_programadas
    SET estado = 'finalizada'
    WHERE fecha_hora < NOW() AND estado = 'pendiente' AND alumno_id = ?
  ");
  $actualizar->execute([$alumno_id]);

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

  // 📦 Obtener clases agendadas
  $stmt = $conn->prepare("
    SELECT 
      cp.fecha_hora,
      cp.sala_jitsi,
      t.nombre AS tutor_nombre,
      tu.titulo AS tutoria_titulo
    FROM clases_programadas cp
    JOIN USUARIO t ON cp.tutor_id = t.id_usuario
    JOIN TUTORIA tu ON cp.tutoria_id = tu.id_tutoria
    WHERE cp.alumno_id = ?
    ORDER BY cp.fecha_hora DESC
  ");
  $stmt->execute([$alumno_id]);
  $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "clases" => $clases
  ]);

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode([
    "success" => false,
    "error" => $e->getMessage()
  ]);
}