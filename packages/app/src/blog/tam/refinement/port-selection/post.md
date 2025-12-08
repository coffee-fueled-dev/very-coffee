# Port Selection

The first learned component: choosing which port to bind in a given situation.

## The Problem

At each step, the agent faces a situation $(n, x_n)$ with a set of afforded ports $\mathsf{Ports}(s_n)$. It must choose one to bind. This choice determines:

- What action the agent takes
- What trajectories become possible
- What evidence the agent will receive

Port selection is the decision-making layer of TA Refinement.

## Inputs

The selection depends on:

- **Current state** $x_n$ and context $\vec{c}$
- **Affordance predictions** $\Phi_p(x_n, \vec{c})$ for each port
- **Value estimates** (if using Bellman-style evaluation)

The agent selects among ports whose cones are non-empty—those that predict at least some acceptable trajectories.

## Approaches

### Value-Based Selection

Assign value to each port based on expected returns over its affordance cone:

$$
V(p) = \mathsf{Agg}(\{ G(\tau) \mid \tau \in \Phi_p \})
$$

Select the port with highest value. This connects to TA-Bellman: port selection becomes optimization of value over port space.

### Exploration

Value-based selection exploits current estimates. But the agent also needs to explore:

- Ports with uncertain affordance predictions
- Regions of port space not yet visited
- Situations where current cones may be wrong

Exploration strategies balance gathering evidence against acting on current beliefs.

## Learning

Port selection can be:

- **Fixed policy**: Deterministic function of state (e.g., argmax over values)
- **Learned policy**: Neural network mapping states to ports
- **Optimized**: Gradient ascent over port manifold (see [Continuous Ports](./continuous-ports))

The selection policy improves as affordance predictions and value estimates become more grounded.

## Interaction with Other Components

Port selection depends on affordance prediction (which ports are viable?) and drives refinement policy (binding outcomes provide evidence). The three components form a loop:

1. Select port based on current predictions
2. Bind and observe outcome
3. Refine predictions based on evidence
4. Repeat
