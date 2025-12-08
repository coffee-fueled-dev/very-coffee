## Representational Capacity

The state space and trajectory space are defined by the **support and topology** of the two manifolds, bounded by what the learned cones can collectively cover.

### State Space Support ($\text{supp}(\mathcal{X})$)

The set of distinct states the system is capable of representing is now formalized as the **topological support** of the Affordance Manifold ($\mathbf{T}$), which is constrained by the combined support of the learned cross-sections.

The set-theoretic definition:

$$
\mathcal{X} = \bigcup_{p \in \mathcal{P}, x \in \mathcal{X}, \vec{c} \in \mathcal{C}^*} \{ \tau[i] \mid \tau = \mathsf{Infer}_p(x, \vec{c}), \, 0 \le i < |\tau| \}
$$

Is formalized geometrically as the **closure** of the union of all state-points contained in the learned **Cone cross-sections** ($\mathbf{C}_m$):

$$
\text{supp}(\mathbf{T}) = \overline{\bigcup_{m \in \mathbf{M}, s \in S} \{ \text{State-Points contained in } \mathbf{C}_m(s) \}}
$$

### Trajectory Space Cover ($\mathbf{T}_{\text{covered}}$)

The trajectory space is the cumulative affordance across all possible ports, states, and contexts.

The set-theoretic definition:

$$
\mathcal{T}(\mathcal{X}) = \bigcup_{p \in \mathcal{P}, x \in \mathcal{X}, \vec{c} \in \mathcal{C}^*} \Phi_p(x, \vec{c})
$$

Is formalized geometrically as the **union of the learned Affordance Cones** within the Affordance Manifold ($\mathbf{T}$):

$$
\mathbf{T}_{\text{covered}} = \bigcup_{m \in \mathbf{M}, s \in S} \mathbf{C}_m(s)
$$

**Extension:** **Representational Completeness** is achieved when the **Cumulative Affordance $\mathbf{T}_{\text{covered}}$** equals the true **Affordance Manifold $\mathbf{T}$** (i.e., when $\mathbf{T}_{\text{covered}}$ is locally a **homeomorphism** to the true causal space). The system must learn to drive the difference $\mathbf{T} \setminus \mathbf{T}_{\text{covered}}$ to zero, minimizing the geometric region of **unafforded causality**.

---

## Agency

Agency is formalized as a **Measure-Theoretic Ratio** on the fiber $\mathbf{F}_m$, replacing cardinality with the continuous, differentiable concepts of volume and probability mass.

Agency correlates inversely with cone volume. A narrow cone commits to specific outcomes, which is now quantifiable by the continuous measure of the Cone.

The set-theoretic notion of the trivial case:

$$
\Phi_p(x, \vec{c}) = \mathcal{T}(x) \implies \text{agency} = 0
$$

Is formalized geometrically when the **Measure of the Cone equals the Measure of the entire Fiber** over that port:

$$
\mu(\mathbf{C}_m) = \mu(\mathbf{F}_m) \implies \text{agency} = 0
$$

### Agency Measure (The Differentiable Metric)

In continuous spaces, analogous measures can be derived from relative volumes or measure-theoretic properties of $\Phi_p$.

The set-theoretic cardinality ratio:

$$
\text{agency}(p, x, \vec{c}) = 1 - \frac{|\Phi_p(x, \vec{c})|}{|\mathcal{T}(x)|}
$$

Is formalized geometrically as the **Relative Measure of the Cone to the Fiber**:

$$
\text{Agency}(m, s) = 1 - \frac{\mu(\mathbf{C}_m(s))}{\mu(\mathbf{F}_m(s))}
$$

Where:

- $\mathbf{C}_m(s)$ is the learned Affordance Cone (a differentiable distribution/volume).
- $\mathbf{F}_m(s)$ is the full fiber (the total volume of possible outcomes) for that situation and port.
- $\mu(\cdot)$ is the measure (volume, probability mass) defined on the high-dimensional Causal Trajectory Space ($\mathbf{T}$).

**Extension:** This formulation provides the **differentiable metric** for the **Port Selector**. The agent maximizes Agency by performing **gradient ascent** on this continuous function over the Port Manifold $\mathbf{M}$:

$$\mathbf{M}^* = \underset{m \in \mathbf{M}}{\arg \max} \left[ \text{Agency}(m, s) \right]$$
