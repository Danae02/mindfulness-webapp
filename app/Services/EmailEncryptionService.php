<?php

namespace App\Services;

class EmailEncryptionService
{
    private string $key;
    private string $pepper;

    public function __construct()
    {
        $this->key = hex2bin(config('app.sodium_key')); // encrypt uit .env
        $this->pepper = config('app.email_pepper'); // extra voor blind index
    }


    /**
     * Versleutel een e-mailadres
     *
     * @param string $email Het te versleutelen e-mailadres
     * @return string Base64-gecodeerde versleutelde string (nonce + ciphertext)
     */
    public function encrypt(string $email): string
    {
        // Voeg nonce toe aan het begin, zodat we die later nodig hebben voor decryptie
        $nonce = random_bytes(\SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        return base64_encode($nonce . sodium_crypto_secretbox($email, $nonce, $this->key));
    }


    /**
     * Ontsleutel een versleuteld e-mailadres
     *
     * @param string $encrypted De versleutelde string (base64)
     * @return string Het originele e-mailadres
     */
    public function decrypt(string $encrypted): string
    {
        $decoded = base64_decode($encrypted);
        $nonce = mb_substr($decoded, 0, \SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, '8bit');
        $ciphertext = mb_substr($decoded, \SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, null, '8bit');
        // Ontsleutel en retourneer het originele e-mailadres
        return sodium_crypto_secretbox_open($ciphertext, $nonce, $this->key);
    }

    /**
     * Maak zoekbare hash (blind index) van e-mailadres
     *
     * Dit is niet terug te draaien naar het origineel.
     * Gebruikt voor oa:
     * - Unieke email check bij registratie
     * - Inloggen
     * - Wachtwoord reset
     *
     * @param string $email Het e-mailadres
     * @return string De hash (blind index)
     */
    public function blindIndex(string $email): string
    {
        return hash_hmac('sha256', strtolower($email), $this->pepper);
    }
}
