from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from statistics import mean
import time

from zk_auth import PasswordlessAuthClient, PasswordlessAuthServer


def _wire_bytes(payload: dict[str, object]) -> int:
    return len(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"))


def benchmark_interactive(trials: int) -> dict[str, float]:
    auth_times_ms: list[float] = []
    comm_bytes: list[int] = []

    for i in range(trials):
        user_id = f"user_i_{i}"
        server = PasswordlessAuthServer()
        client = PasswordlessAuthClient(user_id=user_id)
        server.register_user(user_id, client.public_key)

        start = time.perf_counter()
        commitment = client.start_interactive_login()
        session_id, challenge = server.start_interactive_login(user_id, commitment.commitment)
        response = client.answer_interactive_challenge(challenge)
        server.finish_interactive_login(session_id, response)
        auth_times_ms.append((time.perf_counter() - start) * 1000.0)

        c2s_1 = _wire_bytes(
            {"user_id": user_id, "commitment": commitment.commitment}
        )
        s2c = _wire_bytes({"session_id": session_id, "challenge": challenge})
        c2s_2 = _wire_bytes(
            {"session_id": session_id, "commitment": response.commitment, "response": response.response}
        )
        comm_bytes.append(c2s_1 + s2c + c2s_2)

    return {
        "avg_time_ms": mean(auth_times_ms),
        "avg_comm_bytes": float(mean(comm_bytes)),
        "round_trips": 2.0,
    }


def benchmark_fiat_shamir(trials: int) -> dict[str, float]:
    auth_times_ms: list[float] = []
    comm_bytes: list[int] = []

    for i in range(trials):
        user_id = f"user_fs_{i}"
        server = PasswordlessAuthServer()
        client = PasswordlessAuthClient(user_id=user_id)
        server.register_user(user_id, client.public_key)

        start = time.perf_counter()
        login_nonce = server.start_fiat_shamir_login(user_id)
        proof = client.create_fiat_shamir_proof(login_nonce)
        server.finish_fiat_shamir_login(user_id, proof)
        auth_times_ms.append((time.perf_counter() - start) * 1000.0)

        s2c = _wire_bytes({"user_id": user_id, "login_nonce": login_nonce})
        c2s = _wire_bytes(
            {
                "user_id": user_id,
                "login_nonce": proof.login_nonce,
                "commitment": proof.commitment,
                "challenge": proof.challenge,
                "response": proof.response,
            }
        )
        comm_bytes.append(s2c + c2s)

    return {
        "avg_time_ms": mean(auth_times_ms),
        "avg_comm_bytes": float(mean(comm_bytes)),
        "round_trips": 1.0,
    }


def render_markdown_table(results: dict[str, dict[str, float]]) -> str:
    header = "| Mode | Avg auth time (ms) | Avg communication (bytes) | Round trips |"
    sep = "|---|---:|---:|---:|"
    rows = []
    for mode in ("interactive", "fiat-shamir"):
        r = results[mode]
        rows.append(
            f"| {mode} | {r['avg_time_ms']:.4f} | {r['avg_comm_bytes']:.2f} | {r['round_trips']:.0f} |"
        )
    return "\n".join([header, sep, *rows])


def write_csv(path: Path, results: dict[str, dict[str, float]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["mode", "avg_time_ms", "avg_comm_bytes", "round_trips"])
        for mode in ("interactive", "fiat-shamir"):
            r = results[mode]
            writer.writerow([mode, f"{r['avg_time_ms']:.6f}", f"{r['avg_comm_bytes']:.2f}", int(r["round_trips"])])


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark interactive Schnorr vs Fiat-Shamir authentication."
    )
    parser.add_argument("--trials", type=int, default=200, help="Number of trials per mode.")
    parser.add_argument(
        "--csv",
        type=Path,
        default=None,
        help="Optional CSV output path, e.g. results/benchmark.csv",
    )
    args = parser.parse_args()

    if args.trials <= 0:
        raise ValueError("trials must be positive")

    results = {
        "interactive": benchmark_interactive(args.trials),
        "fiat-shamir": benchmark_fiat_shamir(args.trials),
    }
    print(f"Trials per mode: {args.trials}")
    print(render_markdown_table(results))
    if args.csv is not None:
        args.csv.parent.mkdir(parents=True, exist_ok=True)
        write_csv(args.csv, results)
        print(f"\nSaved CSV to: {args.csv}")


if __name__ == "__main__":
    main()
