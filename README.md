# CISC 878 Project: Schnorr Zero-Knowledge Authentication

This repository implements a complete mini-project around Schnorr identification and its Fiat-Shamir variant, with a concrete authentication workflow and reproducible evaluation.

## Project objective

Demonstrate how a prover can prove knowledge of a secret key without revealing it, then compare interactive and non-interactive variants in terms of:

- runtime overhead
- communication overhead
- replay resistance behavior in an application setting

## What is implemented

- `src/zk_auth/schnorr.py`
  - Schnorr group parameters, prover, verifier, proof objects.
  - SHA-256 based challenge derivation for Fiat-Shamir.
  - subgroup checks to prevent malformed public keys/commitments.
- `src/zk_auth/app.py`
  - Application protocol logic:
  - user registration with public key
  - interactive login flow
  - Fiat-Shamir login flow with one-time server nonce
  - session token issuance on success
- `demo.py`
  - End-to-end demo runner for one authentication session.
- `benchmark.py`
  - Reproducible benchmark for communication and runtime comparison.
- `tests/test_auth.py`
  - correctness, forgery rejection, replay rejection, and subgroup validation tests.
- `report/PROJECT_REPORT.md`
  - submission-ready report draft (design, security analysis, evaluation framework).

## Quick start

From project root:

```bash
cd "/Applications/big four/Queen 研究生/2026Winter/CISC 878/Project878"
```

Run interactive mode demo:

```bash
PYTHONPATH=src python3 demo.py --mode interactive --user alice
```

Run Fiat-Shamir mode demo:

```bash
PYTHONPATH=src python3 demo.py --mode fiat-shamir --user alice
```

Run all tests:

```bash
PYTHONPATH=src pytest
```

## Evaluation reproduction

Run benchmarks for both modes:

```bash
PYTHONPATH=src python3 benchmark.py --trials 500 --csv results/benchmark.csv
```

This prints a Markdown table and writes CSV output for your report.

Reported metrics:

- average authentication time per session (ms)
- average communication cost per authentication (bytes, JSON wire approximation)
- round trips (interactive: 2, Fiat-Shamir: 1)

## Security properties demonstrated

- Completeness:
  - honest prover with correct secret key authenticates successfully.
- Soundness intuition:
  - modified/forged responses fail verification.
- Zero-knowledge intuition:
  - secret key is never sent to the server.
- Replay resistance at protocol/application layer:
  - interactive flow uses one-time session state.
  - Fiat-Shamir flow binds proof to one-time server nonce.
- Input validation hardening:
  - public keys and commitments must lie in the intended order-q subgroup.

## Deliverables in this repository

- runnable code implementation
- tests
- benchmark script and result export
- report draft

This is intentionally a teaching/demo implementation, not production cryptographic software.
