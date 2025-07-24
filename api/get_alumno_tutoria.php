<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'conn.php';

try {
  $stmt = $conn->prepare("
    SELECT 
      t.id_tutoria,
      t.titulo,
      t.descripcion,
      t.precio,
      t.fecha_publicacion,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre_tutor
    FROM TUTORIA t
    JOIN USUARIO u ON u.id_usuario = t.id_tutor
    ORDER BY t.fecha_publicacion DESC
  ");
  $stmt->execute();
  $tutorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($tutorias as &$tutoria) {
    $refStmt = $conn->prepare("
      SELECT texto 
      FROM REFERENCIA 
      WHERE id_tutoria = :id_tutoria
    ");
    $refStmt->execute([':id_tutoria' => $tutoria['id_tutoria']]);
    $tutoria['referencias'] = $refStmt->fetchAll(PDO::FETCH_COLUMN);
  }

  echo json_encode([
    "success" => true,
    "tutorias" => $tutorias
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Error al obtener tutorías: " . $e->getMessage()
  ]);
}
?>
