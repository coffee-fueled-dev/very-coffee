# TAM-Learn

TAM-Learn extends TAM with dynamics for port evolution.

## Invariants

The inference map $\mathsf{Infer}_p$ is fixed for each port.

Learning operates only on the affordance predicate $\chi_p$.

## Refinement

After binding resolves to success or failure, the agent must do at least one of one of:

1. Widen the cone of the bound port
2. Narrow the cone of the bound port
3. Proliferate

### Widening

$$
\Phi'_p \supsetneq \Phi_p
$$

### Narrowing

$$
\Phi'_p \subsetneq \Phi_p
$$

## Port Proliferation

New ports may be added to $\mathcal{P}$.

Each new port $p'$ must define:

- $\mathsf{Infer}_{p'} : \mathcal{X} \times \mathcal{C}^* \to \mathcal{T}(\mathcal{X})$
- $\chi_{p'} : \mathcal{T}(\mathcal{X}) \times \mathcal{X} \times \mathcal{C}^* \to \{\mathsf{true}, \mathsf{false}\}$
