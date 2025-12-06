## 1. TAM-Learn as monotone refinement on the lattice

### 1.1 Affordance structures as points in the lattice

For each port $p$, instead of thinking of $\chi_p$ as a bare predicate, we now think of its induced cones as a structured element:

$$
\Phi*p(\cdot, \cdot) \in \mathcal{H} = \prod*{x} \mathcal{P}(\mathcal{T}(x)).
$$

TAM-Learn updates these cones after each binding based on observed $\hat{\tau}$.

### 1.2 Define refinement operators

Define for each port $p$ a refinement operator:

$$
F_p : \mathcal{H} \to \mathcal{H}
$$

that maps a current cone assignment $\Phi_p$ to a new cone assignment $\Phi'\_p$ after incorporating one episode (or a batch of experience).

You want:

- **Monotonicity:**  
  For any $\Phi \subseteq \Psi$ pointwise (i.e. $\Phi(x) \subseteq \Psi(x)$ for all $x$),

$$
F_p(\Phi) \subseteq F_p(\Psi)
$$

(pointwise).

Intuition: if one affordance structure is “weaker” (admits more trajectories) than another, updating both with the same evidence should preserve that order.

Example refinements in this language:

- **Widen** at $x$:

$$
\Phi'\_p(x) = \Phi_p(x) \cup E(x)
$$

where $E(x)$ is the set of newly observed trajectories to admit.

- **Narrow** at $x$:

$$
\Phi'\_p(x) = \Phi_p(x) \cap S(x)
$$

where $S(x)$ excludes trajectories now judged incompatible.

- **Proliferation**:  
  Create a new port $p'$ whose cone is a subset of $\Phi_p$ on some region of $(x,\vec c)$. Algebraically this is like splitting $\Phi_p$ into multiple elements in the product lattice; you don’t need to formalize that immediately for the basic theorem, but it fits the same picture.

All of these are monotone operations over $\mathcal{H}$.

### 1.3 Grounding as a fixed point of Fₚ

We call an affordance structure $\Phi_p^\*$ **grounded** if:

$$
F_p(\Phi_p^_) = \Phi_p^_.
$$

Intuition: after updating with world evidence, the cone no longer changes; all expected trajectories match the world’s behavior and vice versa (up to your chosen learning rule).

Because $\mathcal{H}$ is a complete lattice and $F_p$ is monotone, you can now bring in:

---

## 2. The grounding fixed-point theorem (Knaster–Tarski style)

**Theorem (Grounding Fixed Point).**  
Let $\mathcal{H}$ be a complete lattice of affordance structures and $F_p : \mathcal{H} \to \mathcal{H}$ a monotone refinement operator induced by TAM-Learn for port $p$. Then:

1. The set of fixed points of $F_p$ is non-empty and forms a complete lattice.
2. There exists a **least fixed point**:

$$
\mathrm{lfp}(F_p) = \bigcap \{ X \in \mathcal{H} \mid F_p(X) \subseteq X \}
$$

3. There exists a **greatest fixed point**:

$$
\mathrm{gfp}(F_p) = \bigcup \{ X \in \mathcal{H} \mid X \subseteq F_p(X) \}.
$$

You then **define grounding** as the (or a) fixed point the learning procedure converges to — usually you’ll want to interpret the **least fixed point** as:

> “The most conservative (smallest) affordance structure that is self-consistent under refinement.”

### 2.1 Operational intuition

- If you iterate $F_p$ starting from a very wide cone (⊤: everything is allowed), you get a descending sequence:

$$
\Phi^{(0)} = \top,\quad \Phi^{(1)} = F_p(\Phi^{(0)}),\quad \Phi^{(2)} = F_p(\Phi^{(1)}), \dots
$$

- In many reasonable designs (continuous-enough Fₚ), this converges to $\mathrm{lfp}(F_p)$.
- That fixed point is exactly where further episodes don’t force structural change.

That’s the rigorous backend for what you were calling grounding of expectations.

You can keep this theorem in a short “Algebraic TAM-Learn” section: it’s 100% on top of the existing TAM, not a replacement.
