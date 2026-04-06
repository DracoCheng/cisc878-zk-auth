from __future__ import annotations

from dataclasses import dataclass
import hashlib
import secrets


def _int_to_bytes(value: int) -> bytes:
    length = max(1, (value.bit_length() + 7) // 8)
    return value.to_bytes(length, "big")


@dataclass(frozen=True)
class GroupParameters:
    """A subgroup of prime order q in Z_p* for the Schnorr protocol."""

    p: int
    q: int
    g: int

    @classmethod
    def demo_group(cls) -> "GroupParameters":
        # Safe-prime parameters generated for this project.
        p = 274860070933202416027577796628374266687
        q = 137430035466601208013788898314187133343
        g = 4
        return cls(p=p, q=q, g=g)

    def validate(self) -> None:
        if self.p <= 2 or self.q <= 2:
            raise ValueError("Group parameters must be positive primes.")
        if (self.p - 1) % self.q != 0:
            raise ValueError("q must divide p - 1.")
        if not (1 < self.g < self.p - 1):
            raise ValueError("g must be inside Z_p*.")
        if pow(self.g, self.q, self.p) != 1:
            raise ValueError("g must generate a subgroup of order q.")

    def is_member(self, value: int) -> bool:
        """Checks that value is a non-trivial member of the order-q subgroup."""
        return 1 < value < self.p and pow(value, self.q, self.p) == 1


@dataclass(frozen=True)
class KeyPair:
    secret: int
    public: int


@dataclass(frozen=True)
class InteractiveCommitment:
    nonce: int
    commitment: int


@dataclass(frozen=True)
class InteractiveResponse:
    commitment: int
    response: int


@dataclass(frozen=True)
class FiatShamirProof:
    login_nonce: str
    commitment: int
    challenge: int
    response: int


class SchnorrProver:
    def __init__(self, group: GroupParameters) -> None:
        group.validate()
        self.group = group

    def generate_keypair(self) -> KeyPair:
        secret = secrets.randbelow(self.group.q - 1) + 1
        public = pow(self.group.g, secret, self.group.p)
        return KeyPair(secret=secret, public=public)

    def create_commitment(self) -> InteractiveCommitment:
        nonce = secrets.randbelow(self.group.q - 1) + 1
        commitment = pow(self.group.g, nonce, self.group.p)
        return InteractiveCommitment(nonce=nonce, commitment=commitment)

    def respond(self, secret: int, nonce: int, challenge: int) -> int:
        return (nonce + challenge * secret) % self.group.q

    def prove_fiat_shamir(
        self,
        user_id: str,
        secret: int,
        public: int,
        login_nonce: str,
    ) -> FiatShamirProof:
        commitment_data = self.create_commitment()
        challenge = SchnorrVerifier(self.group).hash_challenge(
            user_id=user_id,
            public=public,
            commitment=commitment_data.commitment,
            login_nonce=login_nonce,
        )
        response = self.respond(secret, commitment_data.nonce, challenge)
        return FiatShamirProof(
            login_nonce=login_nonce,
            commitment=commitment_data.commitment,
            challenge=challenge,
            response=response,
        )


class SchnorrVerifier:
    def __init__(self, group: GroupParameters) -> None:
        group.validate()
        self.group = group

    def hash_challenge(
        self,
        *,
        user_id: str,
        public: int,
        commitment: int,
        login_nonce: str,
    ) -> int:
        payload = b"|".join(
            [
                user_id.encode("utf-8"),
                login_nonce.encode("utf-8"),
                _int_to_bytes(public),
                _int_to_bytes(commitment),
            ]
        )
        digest = hashlib.sha256(payload).digest()
        return int.from_bytes(digest, "big") % self.group.q

    def verify(self, public: int, commitment: int, challenge: int, response: int) -> bool:
        if not self.group.is_member(public):
            return False
        if not self.group.is_member(commitment):
            return False
        if not (0 <= challenge < self.group.q):
            return False
        if not (0 <= response < self.group.q):
            return False

        left = pow(self.group.g, response, self.group.p)
        right = (commitment * pow(public, challenge, self.group.p)) % self.group.p
        return left == right
