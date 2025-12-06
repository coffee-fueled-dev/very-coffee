# Affordance Lattices

Affordance cones in TA are subsets of trajectories. This structure admits a natural algebraic treatment: powersets of trajectories form a Heyting algebra.

## The Semantic Domain

For any internal state $x \in \mathcal{X}$, the set of trajectories from $x$ is:

$$
\mathcal{T}(x) \subseteq \bigcup_{k \ge 0} \{(x_0, \dots, x_k) \mid x_i \in \mathcal{X}, x_0 = x\}
$$

Affordance cones are subsets of this space:

$$
\Phi_p(x, \vec{c}) \subseteq \mathcal{T}(x)
$$

The natural semantic domain is the powerset:

$$
\mathcal{H}_x := \mathcal{P}(\mathcal{T}(x))
$$

ordered by subset inclusion $\subseteq$.

## Heyting Algebra Structure

$\mathcal{H}_x$ is a complete Boolean algebra, hence a Heyting algebra, with:

- Meet $\wedge$ (intersection): $A \wedge B = A \cap B$
- Join $\vee$ (union): $A \vee B = A \cup B$
- Implication $\Rightarrow$: $A \Rightarrow B = A^c \cup B$

Each affordance cone is an element of this algebra. Formulas in a TA-logic would denote these cones.

## Global Structure

The full affordance lattice over all states is the product:

$$
\mathcal{H} := \prod_{x \in \mathcal{X}} \mathcal{P}(\mathcal{T}(x))
$$

An affordance structure is a function $x \mapsto \text{cone over } \mathcal{T}(x)$. The product $\mathcal{H}$ is a complete Heyting algebra with operations defined pointwise.

## Agency as Functional

The Heyting order $\subseteq$ captures logical strength:

- Larger cone (more trajectories) = weaker condition
- Smaller cone (fewer trajectories) = stronger condition

Agency is not part of the lattice order. It is an external numeric functional on $\mathcal{H}_x$:

$$
\text{agency}(p, x, \vec{c}) = 1 - \frac{|\Phi_p(x, \vec{c})|}{|\mathcal{T}(x)|}
$$

Higher agency corresponds to smaller cones (more specific commitments), which are lower in the Heyting order.
