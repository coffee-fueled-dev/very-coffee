# TA-Learn

TA-Learn extends TA with dynamics for port evolution.

## Invariants

The inference map $\mathsf{Infer}_p$ is fixed for each port. Learning operates only on the affordance predicate $\chi_p$

## Refinement

After binding resolves to success or failure, the agent must evaluate whether its affordance cone remains consistent with the observed episode. Binding failures are epistemic evidence that the affordance cone was overly narrow or structurally incomplete. In the case of failure, the agent must perform at least one of:

1. Widen the cone of the bound port
2. Narrow the cone of the bound port
3. Proliferate

If the evidence supports that the current cone already captures the observed trajectory appropriately, no structural change is required and the identity function is permissible:

$$
\Phi'_p = \Phi_p
$$

### Widening

$$
\Phi'_p \supsetneq \Phi_p
$$

### Narrowing

$$
\Phi'_p \subsetneq \Phi_p
$$

## Port Proliferation

New ports may be added to $\mathcal{P}$ provided they define:

- $\mathsf{Infer}_{p'} : \mathcal{X} \times \mathcal{C}^* \to \mathcal{T}(\mathcal{X})$
- $\chi_{p'} : \mathcal{T}(\mathcal{X}) \times \mathcal{X} \times \mathcal{C}^* \to \{\mathsf{true}, \mathsf{false}\}$
