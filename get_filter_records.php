<?php
session_start();
require_once 'db_connect.php';

// Set proper JSON header
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode([
        'draw' => 1,
        'recordsTotal' => 0,
        'recordsFiltered' => 0,
        'data' => []
    ]);
    exit;
}

$username = $_SESSION['username'];

try {
    // Get the last 10 filter records for the user
    $stmt = $conn->prepare("
        SELECT filtername, created_at 
        FROM filter_record 
        WHERE username = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    
    if (!$stmt) {
        throw new Exception("Prepare statement failed: " . $conn->error);
    }
    
    $stmt->bind_param("s", $username);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $records = [];
    
    while ($row = $result->fetch_assoc()) {
        $records[] = [
            'filter' => $row['filtername'],
            'timestamp' => $row['created_at']
        ];
    }
    
    // Format response according to DataTables requirements
    echo json_encode([
        'draw' => isset($_GET['draw']) ? intval($_GET['draw']) : 1,
        'recordsTotal' => count($records),
        'recordsFiltered' => count($records),
        'data' => $records
    ]);

} catch (Exception $e) {
    echo json_encode([
        'draw' => 1,
        'recordsTotal' => 0,
        'recordsFiltered' => 0,
        'data' => [],
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?> 