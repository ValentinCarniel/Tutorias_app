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
  $tutor_id = $decoded->sub;

  // ⏱️ Marcar como finalizadas las clases que ya pasaron
  $actualizar = $conn->prepare("
    UPDATE CLASES_PROGRAMADAS
    SET estado = 'finalizada'
    WHERE fecha_hora < NOW() AND estado = 'pendiente' AND tutor_id = ?
  ");
  $actualizar->execute([$tutor_id]);

  // 🔁 Volver a poner la conexión como "pendiente" si la clase ya finalizó
  $reset = $conn->prepare("
    UPDATE TUTORIAS_CONTACTADAS
    SET estado = 'pendiente'
    WHERE id IN (
      SELECT contacto_id
      FROM  CLASES_PROGRAMADAS
      WHERE fecha_hora < NOW() AND estado = 'finalizada' AND tutor_id = ?
    )
  ");
  $reset->execute([$tutor_id]);

  // 📦 Obtener clases agendadas
  $stmt = $conn->prepare("
    SELECT 
      cp.fecha_hora,
      cp.sala_jitsi,
      a.nombre AS alumno_nombre,
      t.titulo AS tutoria_titulo
    FROM CLASES_PROGRAMADAS cp
    JOIN USUARIOS a ON cp.alumno_id = a.id_usuario
    JOIN TUTORIAS t ON cp.tutoria_id = t.id_tutoria
    WHERE cp.tutor_id = ?
    ORDER BY cp.fecha_hora DESC
  ");
  $stmt->execute([$tutor_id]);
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