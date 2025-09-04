<?php
require 'vendor/autoload.php';
require 'conn.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$campos = ['nombre', 'apellido', 'email', 'password', 'fecha_nacimiento', 'rol', 'provincia', 'departamento', 'ciudad'];

foreach ($campos as $campo) {
  if (empty($data[$campo])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => "Falta el campo '$campo'."]);
    exit;
  }
}

$nombre = trim($data['nombre']);
$apellido = trim($data['apellido']);
$email = trim($data['email']);
$password = $data['password'];
$fecha_nacimiento = $data['fecha_nacimiento'];
$rol = $data['rol'];
$provincia = $data['provincia'];
$departamento = $data['departamento'];
$ciudad = $data['ciudad'];

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
  $stmt = $conn->prepare('INSERT INTO USUARIOS (nombre, apellido, email, password, fecha_nacimiento, rol, provincia, departamento, ciudad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([$nombre, $apellido, $email, $passwordHash, $fecha_nacimiento, $rol, $provincia, $departamento, $ciudad]);

  echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente.']);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
