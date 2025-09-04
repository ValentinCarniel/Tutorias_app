<?php
require_once 'conn.php';
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secretKey = 'clave_super_secreta_para_TUTORIA';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
  $authHeader = obtenerTokenDesdeHeader();
  if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    throw new Exception("Token no proporcionado.");
  }

  $jwt = $matches[1];
  $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
  $tutor_id = $decoded->sub;

$stmt = $conn->prepare("
  SELECT 
    tc.tutoria_id,
    tc.alumno_id,
    a.nombre AS alumno_nombre,
    t.titulo AS tutoria_titulo,
    tc.fecha_conexion
  FROM TUTORIAS_CONTACTADAS tc
  JOIN USUARIOS a ON tc.alumno_id = a.id_usuario
  JOIN TUTORIAS t ON tc.tutoria_id = t.id_tutoria
  LEFT JOIN CLASES_PROGRAMADAS cp ON cp.contacto_id = tc.id
  WHERE tc.tutor_id = ? AND cp.id IS NULL
  ORDER BY tc.fecha_conexion DESC
");
  $stmt->execute([$tutor_id]);
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