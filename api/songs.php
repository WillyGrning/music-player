<?php
// === API untuk Music Player ===
// Koneksi ke Supabase menggunakan REST API

// Set headers untuk CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// === CONFIG ===
// Di Vercel, akan diisi dari Environment Variables
$supabaseUrl = getenv('SUPABASE_URL') ?: '';
$supabaseKey = getenv('SUPABASE_SERVICE_KEY') ?: '';

// === FUNGSI UNTUK PANGGIL SUPABASE ===
function supabaseFetch($table, $query = '') {
    global $supabaseUrl, $supabaseKey;
    
    $url = $supabaseUrl . '/rest/v1/' . $table . '?select=*' . $query;
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey,
            'Content-Type: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return ['success' => true, 'data' => json_decode($response, true)];
    }
    
    return ['success' => false, 'error' => 'API error', 'code' => $httpCode];
}

// === HANDLE REQUEST ===
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // GET semua lagu
    $result = supabaseFetch('songs', '&order=created_at.desc');
    
    if ($result['success']) {
        echo json_encode($result['data']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch songs']);
    }
    
} elseif ($method === 'POST') {
    // POST lagu baru (untuk nanti, sekarang return demo)
    echo json_encode([
        'success' => true,
        'message' => 'POST endpoint ready',
        'note' => 'Implement later for upload feature'
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>