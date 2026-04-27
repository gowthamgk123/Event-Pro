<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit();
}

// Get category filter if provided
$category = isset($_GET['category']) ? $_GET['category'] : null;

$query = "SELECT e.*, u.name as organizer_name 
          FROM events e 
          JOIN users u ON e.user_id = u.id 
          WHERE 1=1";

if($category) {
    $query .= " AND category = :category";
}

$query .= " ORDER BY date ASC";

$stmt = $db->prepare($query);

if($category) {
    $stmt->bindParam(":category", $category);
}

$stmt->execute();

if($stmt->rowCount() > 0) {
    $events_arr = array();

    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $event_item = array(
            "id" => $row['id'],
            "title" => $row['title'],
            "description" => $row['description'],
            "date" => $row['date'],
            "location" => $row['location'],
            "category" => $row['category'],
            "price" => $row['price'],
            "available_tickets" => $row['available_tickets'],
            "organizer_name" => $row['organizer_name']
        );
        array_push($events_arr, $event_item);
    }

    http_response_code(200);
    echo json_encode($events_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No events found."));
}
?>
