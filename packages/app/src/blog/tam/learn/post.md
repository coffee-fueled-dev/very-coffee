# TAM-Learn: Adaptation Dynamics for the Trajectory-Affordance Model

TAM-Learn extends TAM with dynamics for port evolution and selection. It specifies how agents adapt to their environment through affordance cone adjustment and port proliferation.

## Invariants

The inference map $\mathsf{Infer}_p$ is fixed for each port. It represents the agent's perceptual apparatus — how the port interprets episodes as trajectories. Like color blindness: the agent perceives the world a certain way and adapts to that perception. Learning does not alter inference.

Learning operates only on the affordance predicate $\chi_p$, which determines the shape of the affordance cone $\Phi_p$.

## Cone Dynamics

### Widening on Failure

When binding fails, the inferred trajectory $\hat{\tau}_n$ fell outside the affordance cone:

$$
\hat{\tau}_n \notin \Phi_{p_n}(x_n, \vec{c}^{\,\text{post}}_n)
$$

This is evidence that the cone was too narrow — it excluded a trajectory that actually occurred. The cone must widen to accommodate:

$$
\Phi'_p \supseteq \Phi_p \cup \{\hat{\tau}_n\}
$$

The exact widening (how much context to generalize from) is unspecified. The constraint is: the failed trajectory must now be admissible.

### No Narrowing from Learning

Success provides no evidence about what to remove from the cone. The trajectory was in the cone and occurred — this confirms the cone but doesn't suggest narrowing.

Narrowing is possible only as a strategic choice (accepting higher failure risk for higher agency) or through port proliferation.

### Success Leaves Cone Unchanged

When binding succeeds:

$$
\hat{\tau}_n \in \Phi_{p_n}(x_n, \vec{c}^{\,\text{post}}_n)
$$

No update to the cone is required. The expectation was met.

## Strategic Choice: Widen or Abandon

After failure, the agent faces a choice:

1. **Widen the cone** — accommodate the unexpected trajectory, retain the port
2. **Abandon the port** — stop using this port, rely on others or create new ones

This choice is strategic, not determined by TAM-Learn. Factors influencing the decision:

- How much would widening reduce agency?
- Are there alternative ports for this context?
- How frequently is this port used?

## Agency and Cone Width

Agency is inversely proportional to cone width:

$$
\text{agency}(p, x, \vec{c}) \propto \frac{1}{|\Phi_p(x, \vec{c})|}
$$

A narrow cone implies specific expectations — the agent can infer a definite outcome from choosing this port. A wide cone implies tolerance for many outcomes — the agent makes weak predictions.

A port whose cone contains all trajectories commits to no particular outcome and exercises no agency:

$$
\Phi_p(x, \vec{c}) = \mathcal{T}(x) \implies \text{no agency}
$$

This creates pressure against unbounded widening.

## Port Proliferation

When widening would reduce agency below acceptable levels, the agent may instead spawn a new specialized port.

Rather than widening "move" to accommodate all movement outcomes:

- Keep "move" with its current (possibly wide) cone
- Create "move-in-context-A" with a narrow cone for specific contexts

Port proliferation is the safe alternative to narrowing — the agent regains agency without ignoring evidence.

### Proliferation Dynamics

New ports may be created:

- After failure, as an alternative to widening
- Proactively, when the agent identifies a context where specialization would help
- By copying and narrowing an existing port (accepting risk)

TAM-Learn does not specify when or how ports are created. The constraint is: new ports must have well-defined inference maps and affordance predicates.

## Port Selection

At each offer $o_n$, multiple ports may be afforded:

$$
\mathsf{Ports}(o_n) = \{ p \in \mathcal{P} \mid \Phi_p(x_n, \vec{c}^{\,\text{prior}}_n) \neq \emptyset \}
$$

The agent selects one port to bind. TAM-Learn does not specify the selection mechanism, but notes the incentive structure:

- **Prefer narrow ports** — higher agency, stronger predictions
- **Avoid ports likely to fail** — based on recent experience, context similarity
- **Balance risk and agency** — the narrowest port that's unlikely to fail

This creates emergent hierarchy: ports are not explicitly nested, but the agent's preference ordering creates implicit structure from narrow (high agency, high risk) to wide (low agency, low risk).

## Emergent Properties

From the core mechanism — _failure widens cones, wide cones lose agency, lost agency motivates specialization_ — several properties emerge:

**Expertise**: Many narrow ports covering a domain. High agency, low failure rate. Achieved through repeated interaction and port proliferation.

**Novice state**: Few wide ports. Low agency, high tolerance. The starting condition before specialization.

**Transfer learning**: In new contexts, start with wide cones (exploration), narrow through proliferation as evidence accumulates.

**Adaptation to change**: Environment shift causes unexpected failures. Cones widen, agency drops. Pressure to re-specialize emerges.

**Skill decay**: Unused ports receive no updates. If the environment drifts, re-engagement may trigger failures and forced widening.

**Exploration vs. exploitation**: Narrow cone = exploit (specific intent). Wide cone = explore (see what happens). The agent manages a portfolio of ports with different widths.

**Generalist vs. specialist**: Portfolio choice. Few wide ports (generalist, robust, low agency) vs. many narrow ports (specialist, fragile, high agency).

## Summary

TAM-Learn adds to TAM:

| Aspect            | Specification                                               |
| ----------------- | ----------------------------------------------------------- |
| Learning signal   | Binding failure                                             |
| What adapts       | Affordance cone $\Phi_p$ (not inference $\mathsf{Infer}_p$) |
| Failure response  | Widen cone or abandon port                                  |
| Success response  | No change                                                   |
| Agency constraint | Agency ∝ 1/(cone width)                                     |
| Specialization    | Port proliferation                                          |
| Selection         | Preference for narrow-but-safe ports                        |

The framework specifies the tensions and constraints. The exact algorithms for widening, abandonment decisions, proliferation triggers, and selection are left to implementations.
