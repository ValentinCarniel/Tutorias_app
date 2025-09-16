<?php
// Conexión PDO
try {
    $conn = new PDO('mysql:host=45.235.98.42;dbname=cesara_6835', 'cesara_6835', 'H4YLRJ37aGdHFPcY');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "message" => "❌ Conexión fallida: " . $e->getMessage()
    ]));
}
?>
