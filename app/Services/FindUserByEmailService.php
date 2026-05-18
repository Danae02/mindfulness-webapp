<?php

namespace App\Services;

use App\Models\User;

class FindUserByEmailService
{
    public function __construct(private EmailEncryptionService $emailEncryption) {}

    //Vind gebruiker via encrypted email
    public function find(string $email): ?User
    {
        $emailIndex = $this->emailEncryption->blindIndex($email);
        return User::where('email_index', $emailIndex)->first();
    }
}
