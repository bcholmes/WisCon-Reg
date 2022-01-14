<?php
// Copyright 2021 BC Holmes
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// These functions provide support for handling JWTs

require_once('../vendor/autoload.php');

use Emarref\Jwt\Claim;

function jwt_from_header() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'];
	if (strpos($auth, 'Bearer ') === 0) {
		$auth = substr($auth, 7);
	}
    return $auth;
}

// We expect to use two types of JWT tokens. The "basic" tokens are
// signed and valid for a long period of time, but have no scopes
// and basically represent a valid mobile app sending requests (as
// opposed to a hacker in Russia). An authenticated user (i.e. someone
// who has logged in) has a token that includes a participant scope and
// the token's subject ("sub") references the user's badgeid.
function jwt_validate_token($token, $key, $role = null) {
    
    $jwt = new Emarref\Jwt\Jwt();

    $algorithm = new Emarref\Jwt\Algorithm\Hs512($key);
    $encryption = Emarref\Jwt\Encryption\Factory::create($algorithm);
	$context = new Emarref\Jwt\Verification\Context($encryption);

	try {
		$deserialized = $jwt->deserialize($token);

		// annoyingly, the $jwt->verify function wants to verify a specific subject.
		// so let's just call the individual verifiers.
		$verifiers = [
            new Emarref\Jwt\Verification\EncryptionVerifier($context->getEncryption(),  new Emarref\Jwt\Encoding\Base64()),
            new Emarref\Jwt\Verification\ExpirationVerifier(),
            new Emarref\Jwt\Verification\NotBeforeVerifier(),
        ];

		foreach ($verifiers as $verifier) {
            $verifier->verify($deserialized);
        }

        if ($role) {
            $scope = $deserialized->getPayload()->findClaimByName("scope");
            if ($scope === null || !in_array($role, $scope->getValue())) {
                return false;
            }
        }   

		return true;
	} catch (InvalidArgumentException $e) {
		return false;
	} catch (Emarref\Jwt\Exception\VerificationException $e) {
		return false;
	}
}

function jwt_extract_badgeid($token) {

	$jwt = new Emarref\Jwt\Jwt();

	$deserialized = $jwt->deserialize($token);
	$subject = $deserialized->getPayload()->findClaimByName("sub");
	return $subject != null ? $subject->getValue() : null;
}

function jwt_create_token($badgeid, $name, $roles, $issuer, $signingKey) {
    $token = new Emarref\Jwt\Token();

    // Standard claims are supported
    $token->addClaim(new Claim\Expiration(new DateTime('1 year')));
    $token->addClaim(new Claim\IssuedAt(new DateTime('now')));
    $token->addClaim(new Claim\Issuer($issuer));
    $token->addClaim(new Claim\NotBefore(new DateTime('now')));
    $token->addClaim(new Claim\Subject($badgeid));
    $token->addClaim(new Claim\PublicClaim('name', $name));
    $token->addClaim(new Claim\PublicClaim('scope', $roles));

    $jwt = new Emarref\Jwt\Jwt();

    $algorithm = new Emarref\Jwt\Algorithm\Hs512($signingKey);
    $encryption = Emarref\Jwt\Encryption\Factory::create($algorithm);
    $serializedToken = $jwt->serialize($token, $encryption);


    return $serializedToken;
}

?>