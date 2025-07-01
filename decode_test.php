<?php
$response = '{"message":"The given data was invalid.","errors":{"room_types.1.accommodation":["\ud83d\udeab ACOMODACI\u00d3N DUPLICADA: La acomodaci\u00f3n \'Sencilla\' est\u00e1 repetida en esta solicitud. Ya est\u00e1 asignada al tipo \'ESTANDAR\' en la posici\u00f3n 1. Cada acomodaci\u00f3n debe ser \u00fanica por hotel."]}}';

$data = json_decode($response, true);
echo "Mensaje decodificado:\n";
echo $data['errors']['room_types.1.accommodation'][0];
echo "\n";
