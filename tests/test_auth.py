from __future__ import annotations

import pytest

from zk_auth.app import AuthenticationError, PasswordlessAuthClient, PasswordlessAuthServer, RegistrationError


def test_interactive_login_success() -> None:
    server = PasswordlessAuthServer()
    client = PasswordlessAuthClient("alice")
    server.register_user("alice", client.public_key)

    commitment = client.start_interactive_login()
    session_id, challenge = server.start_interactive_login("alice", commitment.commitment)
    response = client.answer_interactive_challenge(challenge)

    token = server.finish_interactive_login(session_id, response)

    assert token.startswith("session-alice-")


def test_interactive_login_rejects_modified_response() -> None:
    server = PasswordlessAuthServer()
    client = PasswordlessAuthClient("alice")
    server.register_user("alice", client.public_key)

    commitment = client.start_interactive_login()
    session_id, challenge = server.start_interactive_login("alice", commitment.commitment)
    response = client.answer_interactive_challenge(challenge)
    forged_response = type(response)(commitment=response.commitment, response=(response.response + 1) % client.group.q)

    with pytest.raises(AuthenticationError):
        server.finish_interactive_login(session_id, forged_response)


def test_fiat_shamir_login_success() -> None:
    server = PasswordlessAuthServer()
    client = PasswordlessAuthClient("alice")
    server.register_user("alice", client.public_key)

    login_nonce = server.start_fiat_shamir_login("alice")
    proof = client.create_fiat_shamir_proof(login_nonce)

    token = server.finish_fiat_shamir_login("alice", proof)

    assert token.startswith("session-alice-")


def test_fiat_shamir_nonce_blocks_replay() -> None:
    server = PasswordlessAuthServer()
    client = PasswordlessAuthClient("alice")
    server.register_user("alice", client.public_key)

    login_nonce = server.start_fiat_shamir_login("alice")
    proof = client.create_fiat_shamir_proof(login_nonce)
    server.finish_fiat_shamir_login("alice", proof)

    with pytest.raises(AuthenticationError):
        server.finish_fiat_shamir_login("alice", proof)


def test_reject_invalid_subgroup_public_key() -> None:
    server = PasswordlessAuthServer()
    # p - 1 is not in the order-q subgroup.
    invalid_public_key = server.group.p - 1
    with pytest.raises(RegistrationError):
        server.register_user("alice", invalid_public_key)


def test_reject_invalid_subgroup_commitment() -> None:
    server = PasswordlessAuthServer()
    client = PasswordlessAuthClient("alice")
    server.register_user("alice", client.public_key)

    invalid_commitment = server.group.p - 1
    with pytest.raises(AuthenticationError):
        server.start_interactive_login("alice", invalid_commitment)
