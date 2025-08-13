<?php
// NO pongas headers ni salidas aquí, solo conexión

try {
    // Conexión remota
    $conn = new PDO('mysql:host=45.235.98.42;dbname=cesara_6835', 'cesara_6835', 'H4YLRJ37aGdHFPcY');

    // Establecer modo de error PDO
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // NO imprimir nada aquí
} catch (PDOException $e) {
    // Manejo de error de conexión:
    http_response_code(500);
    // Mejor guardar este mensaje en log, o solo lanzar error para que los scripts lo manejen
    die(json_encode([
        "success" => false,
        "message" => "❌ Conexión fallida: " . $e->getMessage()
    ]));
}
