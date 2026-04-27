<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id, name, email, password FROM users WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->email);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(password_verify($data->password, $row['password'])) {
            http_response_code(200);
            echo json_encode(array(
                "status" => true,
                "message" => "Login successful",
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email']
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid password"));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
