<?php
include("conn.php");

$stmt = $conn->prepare("SELECT id_materia, nombre_materia FROM MATERIAS");
$stmt->execute();
$materias = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($materias);
?>
