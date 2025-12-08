# Multi-Agent Composition

Grounded TA agents compose via lattice meet. This can be organized into a category of agents with a monoidal structure under suitable coherence assumptions.

## Grounded Agents

A grounded agent $A$ consists of:

- A port set $\mathcal{P}_A$
- Grounded affordance structures $\Phi_p^*$ for each $p \in \mathcal{P}_A$

Grounding means each $\Phi_p^*$ is a fixed point of the refinement operator:

$$
F_p(\Phi_p^*) = \Phi_p^*
$$

The agent's expectations are stable under world evidence.

## Shared World

Fix a common world $W$ with trajectory space $\mathcal{T}(\mathcal{X})$ and affordance lattice:

$$
\mathcal{H} = \prod_{x \in \mathcal{X}} \mathcal{P}(\mathcal{T}(x))
$$

All agents interact with the same world. Their affordance structures live in the same lattice.

## Composition via Meet

For grounded agents $A$ and $B$, define the composite agent $A \otimes B$ by:

$$
\Phi_{A \otimes B}^* = \Phi_A^* \wedge \Phi_B^*
$$

where $\wedge$ is the lattice meet (pointwise intersection of cones).

The composite admits only trajectories acceptable to both agents. This is parallel composition: both agents operate simultaneously, each constraining the shared world.

## Compatibility

Agents $A$ and $B$ are compositionally compatible when:

$$
\Phi_A^* \wedge \Phi_B^* \neq \bot
$$

There exist trajectories satisfying both agents' constraints. Incompatible agents have contradictory expectations; no world behavior satisfies both.

Even when agents are compatible, meet-based composition only guarantees that some jointly acceptable trajectories exist; it does not by itself resolve how agents select among them or align their preferences.

## The Category of Grounded Agents

Objects are grounded agents. Each object carries a port set and grounded affordance structures.

Morphisms $f : A \to B$ are structure-preserving maps between affordance lattices. A refinement morphism satisfies:

$$
f(\Phi_A^*) \preceq \Phi_B^*
$$

Agent $A$ refines to agent $B$ when $A$'s grounded affordances imply $B$'s.

## Monoidal Structure

The tensor product $\otimes$ is meet-based composition:

$$
A \otimes B := (A, B, \Phi_A^* \wedge \Phi_B^*)
$$

The unit object $I$ is the trivial agent with $\Phi_I^* = \top$ (all trajectories allowed).

This gives a symmetric monoidal category:

- $(A \otimes B) \otimes C \cong A \otimes (B \otimes C)$
- $A \otimes I \cong A$
- $A \otimes B \cong B \otimes A$

## Interpretation

Composition is constraint conjunction. Each agent narrows what the world may do. The composite is the most permissive system satisfying all constraints.

The lattice order captures refinement: smaller cones are stronger constraints. Meet is the least upper bound of constraints (most permissive satisfying both).

Grounding ensures agents are world-consistent before composition. Composing ungrounded agents may yield contradictions that resolve only after joint refinement.

---

TO FIX:

This is a sophisticated and highly original body of work. You have effectively synthesized concepts from **ecological psychology** (affordances), **control theory** (closed-loop/open-loop), **reinforcement learning** (binding/refinement), and **formal logic** (lattices) into a coherent architecture for agency.

Here is my evaluation of the Trajectory-Affordance (TA) model and the specific Navigation Demo specification.

### Part 1: Opinion on the Trajectory-Affordance (TA) Model

The core strength of this model is its definition of **Agency as accountability to expectations**.

Most current agent frameworks (especially in the LLM space) view "agency" as simply "the ability to call tools." Your model goes deeper: it asserts that an actor is only an agent if it can _predict_ the causal result of its actions and _update_ that prediction when reality diverges.

**Key Strengths:**

1.  **The "Cone" as the Atomic Unit of Trust:** By separating the _action_ (Port) from the _expectation_ (Cone), you allow the agent to distinguish between "I can do this" (Affordance) and "I know what will happen" (Agency). This solves the "hallucinating tool use" problem in LLMs by making uncertainty explicit in the cone's width.
2.  **Refinement > Reward:** Replacing a scalar reward signal with a structural refinement cycle (Widen/Narrow/Proliferate) allows for much richer learning. The agent doesn't just learn "that was bad"; it learns _why_ it was bad (the cone was too narrow) or _that_ it needs a new distinction (proliferation).
3.  **Lattice-Theoretic Grounding:** Framing affordances as a lattice provides a rigorous mathematical foundation for merging knowledge (meet/join) and defining "grounding" as a fixed point.

**Theoretical Risks:**

- **The Proliferation Problem:** In the discrete case (LLMs), creating a new tool wrapper (`send-email-to-boss`) is easy. In the continuous case (manifolds), "proliferation" implies breaking a continuous topology into discontinuous charts or regions. This is mathematically non-trivial and is the hardest part to implement robustly without falling back to simple discretization (grid worlds).

---

### Part 2: Evaluation of the Navigation Demo Spec

The specification (`spec.md`) is a strong, concrete translation of the theory into a buildable artifact. It avoids the "infinite regress" of pure theory by anchoring the agent in a recognizable domain (2D navigation) with specific data structures.

#### 1. The "Cone" Representation (Categorical $\times$ Gaussian)

**Verdict: Excellent Pragmatism.**
Using a hybrid distribution (Categorical for outcome type, Gaussian for details) is the perfect engineering choice for this demo.

- **Why it works:** It captures the bi-modal nature of navigation (you either hit the wall or you don't) which a single Gaussian would smear into a useless average.
- **Recommendation:** Ensure your Gaussian implementation uses **Multivariate** logic (even if diagonal covariance) for the visualization. An ellipse representing the variance of the endpoint $(x, y)$ is a powerful visual for "Agency" (small ellipse = high agency).

#### 2. The Port Manifold ($S^1 \times \mathbb{R}^+$)

**Verdict: Clear and Effective.**
Treating the action space as a manifold allowing for gradient-based optimization ($\nabla V$) rather than discrete sampling is a "killer feature" that distinguishes this from standard Gridworld Q-learning.

- **Critique:** You need to handle the topology at $d=0$. In $S^1 \times \mathbb{R}^+$, the entire circle $S^1$ at $d=0$ collapses to a single physical action (stay still). This is a singularity.
- **Fix:** Ensure your gradient optimizer handles the $d \to 0$ case gracefully, perhaps by dampening $\Delta \theta$ updates as $d$ gets small, to avoid "spinning" in place.

#### 3. The Exploration vs. Exploitation Paradox (Critical Logic Check)

**Verdict: Potential Logical Flaw in Value Function.**
The spec attempts to derive exploration from "indifference," but the proposed value function appears to structurally **penalize** exploration once any safe path is found.

- **Your Formula:** `Score = ... + w_agency * Agency - w_risk * Risk`
- **Your Definition:** `Agency` $\approx$ Confidence (Narrow Cone).
- **The Problem:** If `w_agency` is positive, the agent is incentivized to choose actions it is _already sure about_.
  - **Scenario:** The agent knows a "safe but mediocre" path (High Agency). It knows nothing about a "risky but potentially short" path (Low Agency).
  - **Result:** The formula scores the High Agency path higher. The agent will never explore the unknown path because it is "low agency."
- **Comparison to UCB:** UCB (Upper Confidence Bound) adds a **bonus** for uncertainty: $\mu + \sqrt{\frac{\ln t}{N}}$. Your formula effectively does $\mu + \text{Certainty}$. This is the opposite of UCB; it is risk-averse.
- **Fix:** To get emergent exploration, you must either:
  1.  **Flip the sign:** Reward _Low_ Agency (Curiosity) in the early phases.
  2.  **Add an Information Gain term:** The spec mentions `+ EXPLORATION_WEIGHT * infoGain` but marks it as optional. For this architecture to learn, **Information Gain is mandatory**, not optional. It must outweigh the "comfort" of high agency.

#### 4. State Representation and "The Situation"

**Verdict: Needs Clarification on Storage.**
The spec says `Φ: M × Situation → Cone`.

- **The Question:** How is $\Phi$ stored?
  - If it's a Neural Network: `Net(situation, theta, d) -> ConeParams`, then it generalizes well but forgets easily (catastrophic interference).
  - If it's a Lookup Table (Grid): `Grid[x][y][theta][d] -> Cone`, then it doesn't generalize at all.
- **Implication:** The "Update Algorithm" (Snippet 7) uses Welford's algorithm, which updates a _specific stateful object_. This implies a tabular/grid-based storage for the cones.
- **Critique:** If you are using a grid to store cones, the "Continuous Navigation" claim is slightly weakened—it's continuous actions on a discrete state map. Be explicit about this "Spatial Indexing" in the implementation phase. If you use a KD-Tree or distinct "Situation Nodes" to store these cones, specify that.

#### 5. The "Closed-Loop" & `tkn` Macro Discovery

**Verdict: The "Wow" Factor.**
This is the most impressive part of the spec.

- **Why:** Most nav demos are "Plan $\to$ Execute". By integrating `tkn` (token sequencing) to discover macros _from the feedback stream_, you bridge the gap between **sub-symbolic control** (steering) and **symbolic reasoning** (macros).
- **Implementation Tip:** Ensure the "Macro Cone" competes fairly with the "Manifold Optimization". The agent needs a meta-selector: "Should I optimize a new move on the manifold, or execute this known macro?" The value functions must be comparable (same units).

### Summary Recommendation for the Demo

The spec is **ready to build** with one major adjustment: **Fix the Exploration Reward**.

Do not rely on "indifference." Implement a specific **Intrinsic Motivation** signal.

- **Intrinsic Reward:** $\approx$ `Variance of Cone` (The wider the cone, the more I want to test it to narrow it).
- **Agency Reward:** $\approx$ `1 / Variance` (The narrower the cone, the more I trust it for the goal).

You need to balance these dynamically. A simple way is:
$$V(\theta, d) = \text{GoalProgress} - \text{CollisionRisk} + \lambda (\text{ConeWidth})$$
Where $\lambda$ decays over time (or depends on how desperate the agent is).

### Visual Suggestion

For the "Port Manifold View" in the demo, visualize it as a **Heatmap on an Unrolled Cylinder**.

- **X-axis:** $\theta$ ($0$ to $2\pi$)
- **Y-axis:** $d$ ($0$ to $d_{max}$)
- **Overlay:** Arrows showing the Gradient Descent flow. This will visually prove that your agent is "sliding" towards the optimal solution, effectively demonstrating the "Manifold" concept to the user.
