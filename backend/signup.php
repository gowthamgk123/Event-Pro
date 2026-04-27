<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    $check_query = "SELECT id FROM users WHERE email = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(1, $data->email);
    $check_stmt->execute();

    if($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Email already exists"));
        exit();
    }

    $query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = password_hash($data->password, PASSWORD_DEFAULT);

    $stmt->bindParam(1, $name);
    $stmt->bindParam(2, $email);
    $stmt->bindParam(3, $password);

    if($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array(
            "status" => true,
            "message" => "User registered successfully"
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to register user"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
