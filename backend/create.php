<?php
// Set specific CORS headers
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400"); // cache for 1 day
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if events table exists
    $tableCheck = $db->query("SHOW TABLES LIKE 'events'");
    if ($tableCheck->rowCount() === 0) {
        // Create events table if it doesn't exist
        $createTable = "CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            date DATETIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) DEFAULT 0.00,
            available_tickets INT DEFAULT 0,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $db->exec($createTable);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit();
}

$input = file_get_contents("php://input");
if (!$input) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "No input data provided"]);
    exit();
}

$data = json_decode($input);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["status" => false, "message" => "Invalid JSON: " . json_last_error_msg()]);
    exit();
}

// Log the received data
error_log("Received data: " . print_r($data, true));

if(!empty($data->title) && !empty($data->description) && !empty($data->date) && 
   !empty($data->time) && !empty($data->location) && !empty($data->category)) {
    $query = "INSERT INTO events (title, description, date, location, category, price, available_tickets, user_id) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);

    // Sanitize input
    $title = htmlspecialchars(strip_tags($data->title));
    $description = htmlspecialchars(strip_tags($data->description));
    $date = $data->date . ' ' . $data->time;
    $location = htmlspecialchars(strip_tags($data->location));
    $category = htmlspecialchars(strip_tags($data->category));
    $price = floatval($data->price) ?? 0;
    $available_tickets = intval($data->available_tickets) ?? 0;
    $user_id = 1; // Default to 1 for now

    // Bind parameters
    $stmt->bindParam(1, $title);
    $stmt->bindParam(2, $description);
    $stmt->bindParam(3, $date);
    $stmt->bindParam(4, $location);
    $stmt->bindParam(5, $category);
    $stmt->bindParam(6, $price);
    $stmt->bindParam(7, $available_tickets);
    $stmt->bindParam(8, $user_id);

    if($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array(
            "status" => true,
            "message" => "Event created successfully",
            "event_id" => $db->lastInsertId()
        ));
    } else {
        $error = $stmt->errorInfo();
        http_response_code(503);
        echo json_encode(["status" => false, "message" => "Unable to create event: " . ($error[2] ?? 'Unknown error')]);
        error_log("Database error: " . print_r($error, true));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
