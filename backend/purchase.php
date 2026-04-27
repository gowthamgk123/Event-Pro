<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->event_id) && !empty($data->user_id) && !empty($data->quantity)) {
    try {
        // Start transaction
        $db->beginTransaction();

        // Check ticket availability
        $check_query = "SELECT available_tickets, price FROM events WHERE id = ? FOR UPDATE";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(1, $data->event_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() > 0) {
            $event = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            if($event['available_tickets'] >= $data->quantity) {
                // Create ticket purchase
                $purchase_query = "INSERT INTO tickets (event_id, user_id, quantity, total_price, purchase_date) 
                                 VALUES (?, ?, ?, ?, NOW())";
                $purchase_stmt = $db->prepare($purchase_query);
                
                $total_price = $event['price'] * $data->quantity;
                
                $purchase_stmt->bindParam(1, $data->event_id);
                $purchase_stmt->bindParam(2, $data->user_id);
                $purchase_stmt->bindParam(3, $data->quantity);
                $purchase_stmt->bindParam(4, $total_price);
                
                $purchase_stmt->execute();
                
                // Update available tickets
                $update_query = "UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(1, $data->quantity);
                $update_stmt->bindParam(2, $data->event_id);
                $update_stmt->execute();
                
                // Commit transaction
                $db->commit();
                
                http_response_code(201);
                echo json_encode(array(
                    "status" => true,
                    "message" => "Tickets purchased successfully",
                    "ticket_id" => $db->lastInsertId(),
                    "total_price" => $total_price
                ));
            } else {
                throw new Exception("Not enough tickets available");
            }
        } else {
            throw new Exception("Event not found");
        }
    } catch(Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        http_response_code(400);
        echo json_encode(array("message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
