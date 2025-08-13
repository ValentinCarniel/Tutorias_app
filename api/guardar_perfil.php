<?php
include '../conn.php';
header('Content-Type: application/json');

// Obtener JSON del cuerpo del request
$data = json_decode(file_get_contents("php://input"), true);

// Validar datos recibidos
$tutor_id = isset($data['tutor_id']) ? intval($data['tutor_id']) : 0;
$descripcion = $data['descripcion'] ?? '';
$materias = $data['materias'] ?? [];

if ($tutor_id === 0 || empty($materias)) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

// Convertir array de materias a string separado por coma
$materias_str = implode(',', $materias);

// Verificar si ya existe un perfil
$stmt = $conn->prepare("SELECT id FROM perfil_tutor WHERE tutor_id = ?");
$stmt->execute([$tutor_id]);

if ($stmt->rowCount() > 0) {
    // Actualizar perfil existente
    $stmt = $conn->prepare("UPDATE perfil_tutor SET descripcion = ?, materias = ? WHERE tutor_id = ?");
    $stmt->execute([$descripcion, $materias_str, $tutor_id]);
} else {
    // Insertar nuevo perfil
    $stmt = $conn->prepare("INSERT INTO perfil_tutor (tutor_id, descripcion, materias) VALUES (?, ?, ?)");
    $stmt->execute([$tutor_id, $descripcion, $materias_str]);
}

echo json_encode(['success' => true]);
?>
