<?php

return [
    'database' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'hades',
        'username' => 'root',
        'password' => '',
    ],
    'recovery' => [
        'reset_url' => 'hades://recuperar-password',
        'token_lifetime_minutes' => 30,
    ],
    'smtp' => [
        'host' => 'smtp.gmail.com',
        'port' => 465,
        'encryption' => 'ssl',
        'username' => '',
        'password' => '',
        'from_email' => '',
        'from_name' => 'HADES',
    ],
];
