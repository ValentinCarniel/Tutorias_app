<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Para CORS si usas frontend en otro origen

require_once "conn.php"; // tu conexión PDO

try {
    $sql = "SELECT t.id_tutoria, t.descripcion, t.precio, t.fecha_publicacion, t.id_materia, m.nombre_materia 
            FROM tutorias t 
            JOIN materias m ON t.id_materia = m.id_materia
            ORDER BY t.fecha_publicacion DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
