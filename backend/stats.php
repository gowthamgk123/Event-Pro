<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // cache for 1 day
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $stats = array();
    
    // Total events
    $events_query = "SELECT COUNT(*) as total_events FROM events";
    $events_stmt = $db->prepare($events_query);
    $events_stmt->execute();
    $stats['totalEvents'] = intval($events_stmt->fetch(PDO::FETCH_ASSOC)['total_events']) ?? 0;
    
    // Total tickets sold
    $tickets_query = "SELECT SUM(quantity) as total_tickets FROM tickets";
    $tickets_stmt = $db->prepare($tickets_query);
    $tickets_stmt->execute();
    $stats['totalTickets'] = intval($tickets_stmt->fetch(PDO::FETCH_ASSOC)['total_tickets']) ?? 0;
    
    // Total revenue
    $revenue_query = "SELECT SUM(total_price) as total_revenue FROM tickets";
    $revenue_stmt = $db->prepare($revenue_query);
    $revenue_stmt->execute();
    $stats['totalRevenue'] = floatval($revenue_stmt->fetch(PDO::FETCH_ASSOC)['total_revenue']) ?? 0;
    
    // Events by category
    $category_query = "SELECT category, COUNT(*) as count FROM events GROUP BY category";
    $category_stmt = $db->prepare($category_query);
    $category_stmt->execute();
    $categories = $category_stmt->fetchAll(PDO::FETCH_ASSOC);
    $stats['eventsByCategory'] = array();
    foreach ($categories as $cat) {
        $stats['eventsByCategory'][$cat['category']] = intval($cat['count']);
    }
    
    // Monthly ticket sales
    $monthly_sales_query = "SELECT MONTH(purchase_date) as month, COUNT(*) as count 
                           FROM tickets 
                           WHERE YEAR(purchase_date) = YEAR(CURRENT_DATE) 
                           GROUP BY MONTH(purchase_date)";
    $monthly_sales_stmt = $db->prepare($monthly_sales_query);
    $monthly_sales_stmt->execute();
    $monthly_sales = $monthly_sales_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Initialize all months with 0
    $stats['monthlySales'] = array_fill(0, 12, 0);
    
    // Fill in actual data
    foreach ($monthly_sales as $sale) {
        $month_index = intval($sale['month']) - 1; // Convert 1-based month to 0-based index
        $stats['monthlySales'][$month_index] = intval($sale['count']);
    }
    
    // Total attendees (assuming 1 ticket = 1 attendee)
    $stats['totalAttendees'] = $stats['totalTickets'];
    
    http_response_code(200);
    echo json_encode(array(
        'status' => true,
        'data' => $stats
    ));
} catch(Exception $e) {
    error_log("Analytics Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        'status' => false,
        'message' => 'Error fetching analytics data'
    ));
}
?>
