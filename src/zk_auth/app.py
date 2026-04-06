from __future__ import annotations

from dataclasses import dataclass
import secrets
from typing import Dict

from .schnorr import (
    FiatShamirProof,
    GroupParameters,
    InteractiveCommitment,
    InteractiveResponse,
    SchnorrProver,
    SchnorrVerifier,
)


class RegistrationError(ValueError):
    """Raised when registration data is invalid."""


class AuthenticationError(ValueError):
    """Raised when an authentication flow is invalid."""


@dataclass(frozen=True)
class RegisteredUser:
    user_id: str
    public_key: int


@dataclass(frozen=True)
class PendingInteractiveLogin:
    user_id: str
    commitment: int
    challenge: int


@dataclass(frozen=True)
class PendingFiatShamirLogin:
    user_id: str
    login_nonce: str


class PasswordlessAuthClient:
    def __init__(self, user_id: str, group: GroupParameters | None = None) -> None:
        self.user_id = user_id
        self.group = group or GroupParameters.demo_group()
        self.prover = SchnorrProver(self.group)
        self.keypair = self.prover.generate_keypair()

    @property
    def public_key(self) -> int:
        return self.keypair.public

    def start_interactive_login(self) -> InteractiveCommitment:
        self._interactive_commitment = self.prover.create_commitment()
        return self._interactive_commitment

    def answer_interactive_challenge(self, challenge: int) -> InteractiveResponse:
        commitment = getattr(self, "_interactive_commitment", None)
        if commitment is None:
            raise AuthenticationError("Client has not started an interactive login.")
        response = self.prover.respond(self.keypair.secret, commitment.nonce, challenge)
        del self._interactive_commitment
        return InteractiveResponse(commitment=commitment.commitment, response=response)

    def create_fiat_shamir_proof(self, login_nonce: str) -> FiatShamirProof:
        return self.prover.prove_fiat_shamir(
            user_id=self.user_id,
            secret=self.keypair.secret,
            public=self.keypair.public,
            login_nonce=login_nonce,
        )


class PasswordlessAuthServer:
    def __init__(self, group: GroupParameters | None = None) -> None:
        self.group = group or GroupParameters.demo_group()
        self.verifier = SchnorrVerifier(self.group)
        self._users: Dict[str, RegisteredUser] = {}
        self._interactive_sessions: Dict[str, PendingInteractiveLogin] = {}
        self._fiat_shamir_nonces: Dict[str, PendingFiatShamirLogin] = {}

    def register_user(self, user_id: str, public_key: int) -> None:
        if not user_id:
            raise RegistrationError("User ID cannot be empty.")
        if user_id in self._users:
            raise RegistrationError(f"User {user_id!r} is already registered.")
        if not self.group.is_member(public_key):
            raise RegistrationError("Public key must be in the order-q subgroup.")
        self._users[user_id] = RegisteredUser(user_id=user_id, public_key=public_key)

    def registered_public_key(self, user_id: str) -> int:
        return self._get_user(user_id).public_key

    def start_interactive_login(self, user_id: str, commitment: int) -> tuple[str, int]:
        self._get_user(user_id)
        if not self.group.is_member(commitment):
            raise AuthenticationError("Commitment must be in the order-q subgroup.")
        session_id = secrets.token_hex(16)
        challenge = secrets.randbelow(self.group.q)
        self._interactive_sessions[session_id] = PendingInteractiveLogin(
            user_id=user_id,
            commitment=commitment,
            challenge=challenge,
        )
        return session_id, challenge

    def finish_interactive_login(self, session_id: str, response: InteractiveResponse) -> str:
        pending = self._interactive_sessions.pop(session_id, None)
        if pending is None:
            raise AuthenticationError("Interactive login session is missing or expired.")
        if pending.commitment != response.commitment:
            raise AuthenticationError("Commitment mismatch in interactive login.")
        public_key = self._get_user(pending.user_id).public_key
        if not self.verifier.verify(public_key, response.commitment, pending.challenge, response.response):
            raise AuthenticationError("Interactive Schnorr proof verification failed.")
        return self._issue_session_token(pending.user_id)

    def start_fiat_shamir_login(self, user_id: str) -> str:
        self._get_user(user_id)
        login_nonce = secrets.token_hex(16)
        self._fiat_shamir_nonces[user_id] = PendingFiatShamirLogin(
            user_id=user_id,
            login_nonce=login_nonce,
        )
        return login_nonce

    def finish_fiat_shamir_login(self, user_id: str, proof: FiatShamirProof) -> str:
        pending = self._fiat_shamir_nonces.pop(user_id, None)
        if pending is None:
            raise AuthenticationError("Fiat-Shamir login nonce is missing or already used.")
        if proof.login_nonce != pending.login_nonce:
            raise AuthenticationError("Fiat-Shamir proof used the wrong login nonce.")
        public_key = self._get_user(user_id).public_key
        expected_challenge = self.verifier.hash_challenge(
            user_id=user_id,
            public=public_key,
            commitment=proof.commitment,
            login_nonce=proof.login_nonce,
        )
        if proof.challenge != expected_challenge:
            raise AuthenticationError("Fiat-Shamir challenge hash does not match.")
        if not self.verifier.verify(public_key, proof.commitment, proof.challenge, proof.response):
            raise AuthenticationError("Fiat-Shamir proof verification failed.")
        return self._issue_session_token(user_id)

    def _get_user(self, user_id: str) -> RegisteredUser:
        try:
            return self._users[user_id]
        except KeyError as exc:
            raise AuthenticationError(f"Unknown user {user_id!r}.") from exc

    def _issue_session_token(self, user_id: str) -> str:
        return f"session-{user_id}-{secrets.token_hex(8)}"
