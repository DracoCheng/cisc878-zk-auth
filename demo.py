from __future__ import annotations

import argparse
import json

from zk_auth import PasswordlessAuthClient, PasswordlessAuthServer


def run_demo(mode: str, user_id: str) -> dict[str, object]:
    server = PasswordlessAuthServer()
    client = PasswordlessAuthClient(user_id=user_id)
    server.register_user(user_id, client.public_key)

    if mode == "interactive":
        commitment = client.start_interactive_login()
        session_id, challenge = server.start_interactive_login(user_id, commitment.commitment)
        response = client.answer_interactive_challenge(challenge)
        token = server.finish_interactive_login(session_id, response)
        return {
            "mode": "interactive",
            "user_id": user_id,
            "public_key": client.public_key,
            "commitment": commitment.commitment,
            "challenge": challenge,
            "response": response.response,
            "session_token": token,
        }

    login_nonce = server.start_fiat_shamir_login(user_id)
    proof = client.create_fiat_shamir_proof(login_nonce)
    token = server.finish_fiat_shamir_login(user_id, proof)
    return {
        "mode": "fiat-shamir",
        "user_id": user_id,
        "public_key": client.public_key,
        "login_nonce": login_nonce,
        "commitment": proof.commitment,
        "challenge": proof.challenge,
        "response": proof.response,
        "session_token": token,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Demonstrate passwordless Schnorr authentication in an application setting."
    )
    parser.add_argument(
        "--mode",
        choices=["interactive", "fiat-shamir"],
        default="interactive",
        help="Authentication mode to run.",
    )
    parser.add_argument("--user", default="alice", help="User identifier to register and authenticate.")
    args = parser.parse_args()

    result = run_demo(mode=args.mode, user_id=args.user)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
