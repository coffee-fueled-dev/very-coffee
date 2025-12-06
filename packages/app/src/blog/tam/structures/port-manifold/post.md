# Port Manifold

The core TAM model treats ports as elements of a set $\mathcal{P}$. This section enriches that set with smooth geometric structure, enabling continuous modes of interaction while preserving the discrete case.

## Motivation

Some agents have continuous modes of interaction:

- Neural latent spaces
- Continuous action selectors
- Low-rank adapter parameters
- Control surfaces

Similar ports should form neighborhoods. Refinement operations should move smoothly through port space. The manifold formalism is optional and layered on top of the core model.

## Port Manifold Definition

We endow $\mathcal{P}$ with the structure of a smooth manifold:

$$
\mathcal{P} \equiv \mathcal{M}
$$

A port manifold is a smooth, second-countable, Hausdorff manifold $\mathcal{M}$. Each point $p \in \mathcal{M}$ represents a distinct mode of interaction.

No constraints on dimensionality. The core TAM model remains intact; $\mathcal{M}$ is optional structure on $\mathcal{P}$.

## Port-Indexed Fields

In the manifold formalism, TAM structures become port-indexed fields.

Port actuator map:

$$
\phi : \mathcal{X} \times \mathcal{M} \times \mathcal{C}^* \to \mathcal{U}
$$

Each port $p$ selects a control signal from control space $\mathcal{U}$.

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

This is unchanged from the core model. Only the indexing changes.

## Riemannian Structure

Equip $\mathcal{M}$ with a Riemannian metric $g$, inducing a distance function $d_{\mathcal{M}}$.

Ports $p$ and $q$ are similar when $d_{\mathcal{M}}(p, q)$ is small. Refinement operations move ports via gradient-like updates. Narrowing in port space corresponds to shrinking neighborhoods.

## Port Neighborhoods

For $\epsilon > 0$:

$$
N_\epsilon(p) := \{ q \in \mathcal{M} \mid d_{\mathcal{M}}(p, q) \le \epsilon \}
$$

Port neighborhoods support:

- Continuous affordance shrinkage
- Specialization of port regions
- Port proliferation via geometric splitting

## Regularity Assumptions

Optionally, require:

- $\mathsf{Infer}(x, \vec{c}, p)$ is continuous in $p$
- $\chi(\tau, x, \vec{c}, p)$ is locally constant or Lipschitz in $p$
- $\Phi_p(x, \vec{c})$ varies upper-semicontinuously in $p$

These are not required but yield smoothness results.

## Stratified Port Manifolds

The continuous theory includes the discrete case.

A stratified port manifold:

$$
\mathcal{M} = \bigsqcup_{i \in I} \mathcal{M}_i
$$

where each $\mathcal{M}_i$ is a manifold. Discrete ports are recovered as zero-dimensional strata:

$$
\mathcal{M}_i = \{ p_i \}, \quad \dim \mathcal{M}_i = 0
$$
