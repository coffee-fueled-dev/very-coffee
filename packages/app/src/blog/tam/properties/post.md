# TAM Properties

Derived properties and interpretations of the Trajectory-Affordance Model.

---

## Representational Capacity

The state space $\mathcal{X}$ contains exactly those states that could arise from some inference:

$$
\mathcal{X} = \bigcup_{p \in \mathcal{P}, x \in \mathcal{X}, \vec{c} \in \mathcal{C}^*} \{ \tau[i] \mid \tau = \mathsf{Infer}_p(x, \vec{c}), \, i \in \mathrm{dom}(\tau) \}
$$

The trajectory space $\mathcal{T}(\mathcal{X})$ is the cumulative affordance across all ports, states, and contexts:

$$
\mathcal{T}(\mathcal{X}) = \bigcup_{p \in \mathcal{P}, x \in \mathcal{X}, \vec{c} \in \mathcal{C}^*} \Phi_p(x, \vec{c})
$$

What is representable is bounded by what the ports can collectively infer and afford.

---

## Agency

Agency is inversely proportional to cone width:

$$
\text{agency}(p, x, \vec{c}) \propto \frac{1}{|\Phi_p(x, \vec{c})|}
$$

A port whose cone contains all trajectories exercises no agency:

$$
\Phi_p(x, \vec{c}) = \mathcal{T}(x) \implies \text{agency} = 0
$$

Choosing a port is exercising agency. The affordance cone represents the change $\mathsf{A}$ aims to impart on $\mathsf{W}$. A port whose cone contains all trajectories commits to no particular outcome.
