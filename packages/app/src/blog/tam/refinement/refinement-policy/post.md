# Refinement Policy

The third learned component: deciding how to update affordance predictions.

## The Problem

When binding fails—the observed trajectory exits the affordance cone—the agent must respond. It has four options:

- **Widen**: Admit the unexpected trajectory into the cone
- **Narrow**: Exclude similar trajectories from the cone
- **Proliferate**: Create a new port with a specialized cone
- **Noop**: Leave the cone unchanged (treat failure as noise)

The choice matters. Different choices lead to different fixed points, different generalization behavior, different final capabilities.

## The Refinement Policy

The refinement policy $\rho$ maps binding outcomes to refinement actions:

$$
\rho : (\text{port}, \text{state}, \text{trajectory}, \text{outcome}) \to \{\mathsf{widen}, \mathsf{narrow}, \mathsf{proliferate}, \mathsf{noop}\}
$$

This policy encodes the agent's **inductive bias**—its assumptions about how to generalize from evidence.

## Why It's Learned

A naive policy fails:

- Always widen → Cones expand to include everything (trivial, no predictive power)
- Always narrow → Cones collapse to exclude everything (overly conservative)
- Random → No coherent learning

A useful policy must be context-sensitive: widen when the unexpected trajectory represents genuine capability, narrow when it represents failure, proliferate when the port covers heterogeneous behaviors.

This judgment is itself learned. The refinement policy is a meta-learner: it learns _how to learn_ affordance predictions.

## Failure Analysis

Good refinement requires interpreting _why_ binding failed:

- Was the cone too narrow? (Widen)
- Was the cone too broad? (Narrow)
- Does this port conflate distinct behaviors? (Proliferate)
- Was this just noise? (Noop)

The agent must analyze failures to choose the right response.

## Meta-Learning

The refinement policy has its own training signal—presumably something like:

- Did the next binding succeed?
- Did predictions improve over time?
- Did the agent's overall performance increase?

Learning the refinement policy is learning at a higher level than learning affordance predictions. It's acquiring the inductive bias that makes affordance learning effective.

## What This Section Covers

- **Inductive Bias**: What the refinement policy encodes about generalization
- **Failure Analysis**: Interpreting binding failures to inform refinement choice
- **Meta-Learning**: How to learn the refinement policy itself

