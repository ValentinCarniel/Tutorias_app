<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

include("conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit("Solo POST permitido");
}

$id_tutoria = $_POST['id_tutoria'] ?? null;

if (!$id_tutoria) {
    http_response_code(400);
    exit("Falta id_tutoria");
}

$stmt = $conn->prepare("DELETE FROM tutorias WHERE id_tutoria = ?");
$ok = $stmt->execute([$id_tutoria]);

echo $ok ? 'ok' : 'error';
?>
