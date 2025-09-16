<?php
require 'conn.php';

$emisor = intval($_GET['emisor']);
$receptor = intval($_GET['receptor']);

$sql = "SELECT * FROM mensajes 
        WHERE (emisor_id=$emisor AND receptor_id=$receptor) 
           OR (emisor_id=$receptor AND receptor_id=$emisor)
        ORDER BY fecha ASC";

$result = $conn->query($sql);

$mensajes = [];
while($row = $result->fetch_assoc()) {
    $mensajes[] = $row;
}

header('Content-Type: application/json');
echo json_encode($mensajes);
?>
