# Exploration

Navigating continuous port spaces to test expectations across the action manifold.

## The Problem

In continuous port spaces, the manifold $\mathcal{M}$ represents a space of possible actions (motor commands, control signals, parameterized behaviors). Each point has an associated affordance cone.

**Optimization** finds high-value ports given current predictions. But current predictions may be wrong. Exploration samples the manifold to test whether expectations are accurate.

## Exploration as Expectation Testing

Unlike standard RL where exploration discovers rewards, TA exploration tests beliefs:

- Bind port $p$ in the manifold
- Observe whether trajectory lands in cone $\Phi_p$
- Binding success/failure is evidence about cone accuracy

You're not asking "what does this action do?" You're asking "is my prediction about this action correct?"

## Coherence Enables Generalization

The coherence property: nearby ports have related cones.

This means:

- Testing at point $p$ provides information about neighbors
- Smooth exploration is more efficient than random sampling
- You can generalize predictions across regions of the manifold

Exploration strategy should exploit this structure—sample to maximize information about the whole manifold, not just individual points.

## Balancing Optimization and Exploration

Two modes of port selection:

| Mode         | Goal             | Strategy                           |
| ------------ | ---------------- | ---------------------------------- |
| Optimization | Maximize value   | Gradient ascent on value landscape |
| Exploration  | Test predictions | Sample uncertain regions           |

A complete selection policy balances both:

- Exploit when predictions are confident and values are high
- Explore when predictions are uncertain or may be wrong

## Uncertainty in Continuous Spaces

Exploration targets uncertainty. In continuous port spaces, uncertainty has geometric structure:

- **Unvisited regions**: Areas of the manifold never sampled
- **Boundary uncertainty**: Near the edges of learned cones
- **High-variance regions**: Where binding outcomes have been inconsistent

The manifold structure lets you reason about uncertainty geometrically—which neighborhoods need more evidence?

## Connection to Refinement

Exploration generates the evidence that refinement policy acts on:

1. **Explore** → bind ports across the manifold
2. **Observe** → binding success/failure
3. **Refine** → update cones based on evidence

Without exploration, refinement only sees evidence from optimized (high-value) ports. This can leave large regions of the manifold with ungrounded predictions.
