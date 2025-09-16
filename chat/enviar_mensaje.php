<?php
require 'conn.php'; // tu archivo de conexión MySQL

$data = json_decode(file_get_contents("php://input"), true);

$emisor_id = intval($data['emisor_id']);
$receptor_id = intval($data['receptor_id']);
$mensaje = $conn->real_escape_string($data['mensaje']);

$sql = "INSERT INTO mensajes (emisor_id, receptor_id, mensaje) 
        VALUES ($emisor_id, $receptor_id, '$mensaje')";

if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
