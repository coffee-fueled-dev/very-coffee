# Port Manifold

The core TA model treats ports as elements of a set $\mathcal{P}$. This section enriches that set with geometric structure, enabling continuous modes of interaction while preserving the discrete case.

## Motivation

Some agents have continuous modes of interaction:

- Neural latent spaces
- Continuous action selectors
- Low-rank adapter parameters
- Control surfaces

Similar ports should form neighborhoods. Refinement operations should move smoothly through port space. The manifold formalism is optional and layered on top of the core model.

## Port Space as Manifold

We endow $\mathcal{P}$ with the structure of a smooth manifold:

$$
\mathcal{P} \equiv \mathcal{M}
$$

Each point $p \in \mathcal{M}$ represents a distinct mode of interaction. The manifold structure provides:

- **Neighborhoods**: Ports near $p$ behave similarly to $p$
- **Paths**: Continuous interpolation between ports
- **Tangent structure**: Directions of change in port space

No specific metric or Riemannian structure is required. The essential property is that port space admits a notion of locality and continuous variation.

## Port-Indexed Fields

In the manifold formalism, TA structures become port-indexed fields.

Port inference map:

$$
\mathsf{Infer} : \mathcal{X} \times \mathcal{C}^* \times \mathcal{M} \to \mathcal{T}(\mathcal{X})
$$

where $\mathsf{Infer}(x, \vec{c}, p) = \mathsf{Infer}_p(x, \vec{c})$.

Port affordance predicate:

$$
\chi : \mathcal{T}(\mathcal{X}) \times \mathcal{X} \times \mathcal{C}^* \times \mathcal{M} \to \{0, 1\}
$$

The affordance cone remains:

$$
\Phi_p(x, \vec{c}) = \{ \tau \in \mathcal{T}(x) \mid \chi(\tau, x, \vec{c}, p) = 1 \}
$$

This is unchanged from the core model. Only the indexing gains geometric structure.

## Port Neighborhoods

For any notion of distance or topology on $\mathcal{M}$, define neighborhoods:

$$
N_\epsilon(p) := \{ q \in \mathcal{M} \mid d(p, q) \le \epsilon \}
$$

Port neighborhoods support:

- Continuous affordance variation
- Specialization of port regions
- Port proliferation via geometric splitting

The specific metric (if any) is domain-dependent.

## Regularity Assumptions

For smooth optimization and coherent learning, one may assume:

- $\chi(\tau, x, \vec{c}, p)$ varies continuously in $p$
- $\Phi_p(x, \vec{c})$ varies upper-semicontinuously in $p$

These are not required by the architecture but enable gradient-based methods.

## Discrete Case

The continuous theory includes discrete ports as a special case.

A discrete port set is a zero-dimensional manifold:

$$
\mathcal{M} = \{ p_1, p_2, \dots, p_n \}
$$

Each port is an isolated point. Neighborhoods contain only the port itself. The core TA model is recovered exactly.
