<?php
require 'conn.php';
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secretKey = 'clave_super_secreta_para_TUTORIA';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

try {
  $headers = getallheaders();
  $authHeader = $headers['Authorization'] ?? '';
  if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) throw new Exception("Token no válido.");
  $jwt = $matches[1];
  $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
  $id_tutor = $decoded->sub;

  $data = json_decode(file_get_contents("php://input"), true);
  $id_tutoria   = $data['id_tutoria'] ?? null;
  $titulo       = $data['titulo'] ?? 'Sin título';
  $descripcion  = $data['descripcion'] ?? null;
  $precio       = $data['precio'] ?? null;
  $referencias  = $data['referencias'] ?? [];

  if (!$id_tutoria || !$descripcion || !$precio) throw new Exception("Faltan campos.");

  // Verificar autor
  $check = $conn->prepare("SELECT id_tutor FROM TUTORIA WHERE id_tutoria = ?");
  $check->execute([$id_tutoria]);
  $owner = $check->fetchColumn();
  if ($owner != $id_tutor) throw new Exception("No podés editar tutorías de otro usuario.");

  // Actualizar tutoría
  $stmt = $conn->prepare("UPDATE TUTORIA SET titulo = ?, descripcion = ?, precio = ? WHERE id_tutoria = ?");
  $stmt->execute([$titulo, $descripcion, $precio, $id_tutoria]);

  // Limpiar y actualizar referencias
  $conn->prepare("DELETE FROM REFERENCIA WHERE id_tutoria = ?")->execute([$id_tutoria]);
  $rStmt = $conn->prepare("INSERT INTO REFERENCIA (id_tutoria, texto) VALUES (?, ?)");
  foreach ($referencias as $ref) {
    $ref = trim($ref);
    if ($ref !== '') $rStmt->execute([$id_tutoria, $ref]);
  }

  echo json_encode(["success" => true, "message" => "Tutoría actualizada."]);

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
