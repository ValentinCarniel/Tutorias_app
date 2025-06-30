<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

include("conn.php");
// el resto del código...

try {
    $stmt = $conn->prepare("SELECT id_materia, nombre_materia FROM materias");
    $stmt->execute();
    $materias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($materias);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
