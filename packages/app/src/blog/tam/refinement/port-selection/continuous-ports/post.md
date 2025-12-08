# Continuous Ports

Geometric structure for port selection in continuous domains.

The core port selection machinery—value functions, exploration—works over any port set. When port space is continuous, geometric structure enables gradient-based optimization.

## Components

### Manifold

Ports form a smooth manifold $\mathcal{M}$. This gives:

- **Neighborhoods**: Nearby ports behave similarly
- **Paths**: Continuous interpolation between ports
- **Tangent spaces**: Directions of change

The manifold structure turns discrete port enumeration into continuous optimization.

### Coherence

Port geometry must relate coherently to affordance predictions. Moving smoothly in port space should produce consistent changes in expected behavior.

This ensures:

- Geometric exploration produces meaningful evidence
- Gradient directions are informative
- Learning exploits smoothness efficiently

### Optimization

With smooth structure, port selection becomes gradient ascent over the value landscape:

$$
p_{t+1} = p_t + \alpha \nabla_p V(p; x)
$$

This is the continuous analog of argmax selection in discrete port spaces.

## When to Use

This layer applies when:

- Actions are naturally continuous (control, robotics)
- Ports can be parameterized (embeddings, network weights)
- Interpolation between behaviors is meaningful

For discrete port spaces, the core value-functions and exploration machinery applies directly.
