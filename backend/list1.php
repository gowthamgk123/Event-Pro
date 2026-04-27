<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if(isset($_GET['user_id'])) {
    $user_id = intval($_GET['user_id']);
    
    $query = "SELECT t.*, e.title as event_title, e.date as event_date, e.location as event_location 
              FROM tickets t 
              JOIN events e ON t.event_id = e.id 
              WHERE t.user_id = ? 
              ORDER BY t.purchase_date DESC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $user_id);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $tickets = array();
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($tickets, array(
                "id" => $row['id'],
                "event_id" => $row['event_id'],
                "event_title" => $row['event_title'],
                "event_date" => $row['event_date'],
                "event_location" => $row['event_location'],
                "quantity" => $row['quantity'],
                "total_price" => $row['total_price'],
                "purchase_date" => $row['purchase_date']
            ));
        }
        
        http_response_code(200);
        echo json_encode($tickets);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "No tickets found for this user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "User ID is required."));
}
?>
