<?php

$data = [
    'nombre' => 'Hotel Test',
    'direccion' => 'Test 123', 
    'ciudad' => 'Test City',
    'nit' => '123456789',
    'numero_habitaciones' => 10,
    'room_types' => [
        [
            'type' => 'ESTANDAR',
            'quantity' => 2,
            'accommodation' => 'Sencilla'
        ],
        [
            'type' => 'JUNIOR',
            'quantity' => 3, 
            'accommodation' => 'Sencilla'
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/hotels');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
