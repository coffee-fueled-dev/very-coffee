# Continuous Navigation: TAM with Port Manifolds

A faithful TAM demonstration using continuous state space and a parameterized port manifold.

## Overview

The agent navigates a 2D plane with obstacles, using a single parameterized port `move(θ, d)`. The port manifold is the space of movement parameters. Learning happens through binding: the agent commits to a movement, observes the outcome, and refines its beliefs and expectations.

## Core Concepts

| Concept             | Definition                                                         |
| ------------------- | ------------------------------------------------------------------ |
| **State**           | True position (x, y) ∈ ℝ². Hidden from agent.                      |
| **Situation**       | Agent's belief about position + learned obstacle map.              |
| **Port**            | `move(θ, d)` — parameterized movement (heading, distance).         |
| **Port Manifold M** | The parameter space S¹ × ℝ⁺ (circle × positive reals).             |
| **Binding**         | Selecting parameters, executing movement, observing result.        |
| **Trajectory**      | Curve through state space γ: [0,1] → ℝ².                           |
| **Cone**            | Distribution over trajectories for given parameters and situation. |

## World

### State Space

```typescript
type Position = { x: number; y: number };
type WorldState = {
  agent: Position;
  obstacles: Obstacle[];
  goal: Position;
  bounds: { width: number; height: number };
};
```

### Obstacles

Obstacles are closed regions. The agent cannot pass through them.

```typescript
type Obstacle =
  | { type: "circle"; center: Position; radius: number }
  | { type: "polygon"; vertices: Position[] };
```

### Goal

A point or small region. Episode ends when agent reaches it.

```typescript
type Goal = { center: Position; radius: number };
```

### Dynamics

Movement from position p with heading θ and distance d:

```
p' = p + d * (cos(θ), sin(θ))
```

If the line segment [p, p'] intersects an obstacle:

- Agent stops at the intersection point
- Outcome includes collision information

If p' is outside bounds:

- Agent stops at boundary
- Outcome includes boundary collision

## Port Manifold

### Basic Structure

The port manifold M is the parameter space for `move`:

```
M = S¹ × ℝ⁺
```

Where:

- S¹ = circle of headings θ ∈ [0, 2π)
- ℝ⁺ = positive distances d > 0

A point p ∈ M specifies a movement: `move(θ, d)`.

### Extended Structure (Optional)

For richer planning, extend M:

```
M = S¹ × ℝ⁺ × ℝᵏ

Additional dimensions:
- Curvature (for curved paths)
- Velocity profile (acceleration/deceleration)
- Situation embedding (conditioning on beliefs)
```

### Topology

M is a half-cylinder: S¹ × ℝ⁺

- Locally Euclidean
- θ wraps around (0 ≈ 2π)
- d is bounded below by 0

Movement in M corresponds to adjusting parameters:

- Rotate heading: move around S¹
- Adjust distance: move along ℝ⁺

## Agent

### Situation (Inferred World Model)

```typescript
type Situation = {
  // Believed position (could be distribution)
  believedPosition: Position | Distribution<Position>;

  // Learned obstacle map
  // Each point has a "blocked" probability based on experience
  obstacleField: (p: Position) => number; // 0 = open, 1 = blocked

  // Believed goal (if not known)
  believedGoal: Position | null;

  // Uncertainty measure
  positionConfidence: number;
};
```

### Observation

What the agent perceives after moving:

```typescript
type Observation = {
  // New position (noisy measurement of true position)
  measuredPosition: Position;
  noise: number;

  // Collision info
  collision: null | {
    type: "obstacle" | "boundary";
    point: Position;
    normal: Vector2; // Direction away from obstacle
  };

  // Goal proximity
  goalReached: boolean;
  goalDistance: number; // Noisy estimate
};
```

### Cone: Expected Trajectories

For parameters (θ, d) and situation s, the cone is:

```typescript
type Cone = {
  // Expected trajectory (most likely path)
  expectedPath: Curve;

  // Distribution over endpoints
  endpointDistribution: Distribution<Position>;

  // Collision probability
  collisionProb: number;

  // Confidence in this cone
  confidence: number;
};

type Curve = {
  points: Position[]; // Discretized path
  length: number;
};
```

The cone depends on the situation:

```
Φ: M × Situation → Cone
```

## The Bind Cycle

```
1. Agent has current observation O
2. Agent infers situation S from O + history:
   - Update believed position from measurement
   - Update obstacle field from collision history

3. Agent evaluates points in M:
   For each (θ, d) ∈ M:
     - Get cone Φ(θ, d; S)
     - Compute value V(θ, d; S) = expected progress toward goal
                                  - collision risk
                                  - uncertainty penalty

4. Agent selects optimal parameters:
   (θ*, d*) = argmax V(θ, d; S)

5. Agent BINDS move(θ*, d*):
   - World executes movement
   - Agent receives observation O'

6. Agent refines:
   - Update situation (new believed position, obstacle field)
   - Update cone around (θ*, d*) based on outcome
   - If outcome was surprising: significant belief update

7. Repeat until goal reached
```

## Learning Dynamics

### Initial State

```
Situation:
  believedPosition = starting point (known)
  obstacleField = uniform prior (everything equally likely blocked)

Cones:
  All (θ, d) have wide cones (high uncertainty)
  All directions equally viable
```

### After Binding

```
Bind move(θ=0, d=1) → observe collision at (0.7, 0)

Update:
  obstacleField: increase P(blocked) near (0.7, 0)
  believedPosition: now at (0.7, 0)

Refine cone for θ≈0:
  "Moving right from here hits obstacle"
  Cone narrows: expect collision for θ≈0 from this region
```

### Emergent Specialization

No explicit proliferation. Instead:

```
Region of M near (θ=0, d=1):
  Cone = {collision} when situation = "near right obstacle"
  Cone = {successful move} when situation = "in open space"
```

The cone is a function of (port params, situation).

The agent learns which regions of M work in which situations.

### Belief-Expectation Coupling

```
believedPosition = (2, 3)
learned: obstacle at (3, 3)

Cone for θ=0 (rightward):
  Expects collision after d≈1

Cone for θ=π (leftward):
  Expects successful move

Selection:
  If goal is right: might risk collision
  If goal is left: easy choice
```

## Value Function

### Components

```typescript
function value(θ: number, d: number, situation: Situation): number {
  const cone = getCone(θ, d, situation);

  // Progress toward goal
  const expectedEndpoint = cone.expectedEndpoint;
  const progressToGoal = distanceReduction(
    situation.believedPosition,
    expectedEndpoint,
    goal
  );

  // Risk penalty
  const collisionRisk = cone.collisionProb * COLLISION_PENALTY;

  // Uncertainty penalty (prefer confident predictions)
  const uncertaintyPenalty = (1 - cone.confidence) * UNCERTAINTY_PENALTY;

  // Information gain (optional: reward reducing uncertainty)
  const infoGain = expectedInformationGain(θ, d, situation);

  return (
    progressToGoal -
    collisionRisk -
    uncertaintyPenalty +
    EXPLORATION_WEIGHT * infoGain
  );
}
```

### Optimization Over M

Instead of discrete port selection:

```typescript
// Gradient-based optimization on the manifold
function selectPort(situation: Situation): [number, number] {
  let θ = initialHeading(situation); // e.g., toward goal
  let d = initialDistance(); // e.g., moderate step

  for (let i = 0; i < OPTIMIZATION_STEPS; i++) {
    const grad = valueGradient(θ, d, situation);
    θ = wrapAngle(θ + LEARNING_RATE * grad.dθ);
    d = Math.max(0.01, d + LEARNING_RATE * grad.dd);
  }

  return [θ, d];
}
```

## Visualization

Use shadcn components when possible

### World View

- 2D plane showing true positions
- Obstacles rendered as shapes
- Goal rendered as target
- Agent rendered as arrow (showing heading)
- Trajectory trace (where agent has been)

### Situation Panel

- Believed position (may differ from true)
- Obstacle field heatmap (learned beliefs about obstacles)
- Uncertainty radius around believed position

### Port Manifold View

- Cylindrical visualization of M (unwrapped: θ on x-axis, d on y-axis)
- Color = value V(θ, d) at current situation
- Selected point highlighted
- Gradient flow shown (where optimization is heading)

### Cone Visualization

For selected (θ, d):

- Expected trajectory drawn from believed position
- Endpoint distribution as ellipse
- Collision probability as color intensity

### History Panel

- Sequence of bindings: (θ, d) → outcome
- Highlight surprising outcomes (cone misses)
- Show how obstacle field evolved

## Success Criteria

1. **Obstacle learning**: After exploration, obstacleField matches true obstacles

2. **Efficient navigation**: Agent finds paths around obstacles to goal

3. **Appropriate risk**: Agent avoids high-collision-probability regions of M

4. **Smooth optimization**: Port selection uses gradient information, not discrete search

5. **Belief updates**: Surprising outcomes cause significant situation updates

## Implementation Phases

### Phase 1: World

- Continuous 2D plane
- Circle obstacles
- Line segment collision detection
- Basic movement dynamics

### Phase 2: Agent Beliefs

- Position belief (point estimate + uncertainty)
- Obstacle field (grid or continuous representation)
- Observation processing

### Phase 3: Cones

- Given (θ, d, situation), predict trajectory
- Collision probability estimation
- Endpoint distribution

### Phase 4: Value & Optimization

- Value function over M
- Gradient computation (or finite differences)
- Optimization loop

### Phase 5: Visualization

- World view with true/believed state
- Port manifold heatmap
- Cone visualization
- History tracking

## Cone Representation

### Design Goals

The cone representation should:

1. **Generalize** to other parameterized actions (robot arm, grasping, etc.)
2. **Update incrementally** from binding outcomes (no batch training)
3. **Support differentiation** for gradient-based port selection
4. **Visualize clearly** for the demo

### Generic Interface

```typescript
interface Cone<OutcomeType extends string, DetailType extends number[]> {
  // Categorical distribution over outcome types
  outcomeProbs: Record<OutcomeType, number>;

  // Gaussian distribution over details, per outcome type
  details: Record<
    OutcomeType,
    {
      mean: DetailType;
      variance: DetailType; // Diagonal covariance
      sampleCount: number;
    }
  >;

  // Overall confidence
  totalSamples: number;
}
```

### Why Categorical × Gaussian

**Multi-modality at outcome level**: Different outcome types (success, collision) are distinct modes. Within each type, outcomes are approximately unimodal.

**Incremental update**: Welford's algorithm for running mean/variance. No training phase needed.

**Differentiable**: Gaussian parameters are smooth functions of observations.

**Interpretable**: Outcome probabilities + uncertainty ellipses are easy to visualize.

### Navigation Instantiation

```typescript
type NavOutcome = "success" | "collision" | "boundary";
type NavDetail = number[]; // [x, y] or [x, y, normalX, normalY]

type NavCone = Cone<NavOutcome, NavDetail>;

// Example
const cone: NavCone = {
  outcomeProbs: { success: 0.7, collision: 0.2, boundary: 0.1 },
  details: {
    success: {
      mean: [5.2, 3.1],
      variance: [0.1, 0.15],
      sampleCount: 14,
    },
    collision: {
      mean: [3.8, 2.0, -1, 0], // endpoint + normal
      variance: [0.2, 0.2, 0.1, 0.1],
      sampleCount: 4,
    },
    boundary: {
      mean: [0, 2.5, -1, 0],
      variance: [0.01, 0.3, 0.01, 0.1],
      sampleCount: 2,
    },
  },
  totalSamples: 20,
};
```

### Update Algorithm

```typescript
function updateCone<O extends string>(
  cone: Cone<O, number[]>,
  outcomeType: O,
  detail: number[]
): Cone<O, number[]> {
  const n = cone.totalSamples + 1;

  // Update outcome probabilities (frequency-based)
  const newProbs = { ...cone.outcomeProbs };
  for (const type in newProbs) {
    const wasObserved = type === outcomeType ? 1 : 0;
    newProbs[type as O] =
      (cone.outcomeProbs[type as O] * cone.totalSamples + wasObserved) / n;
  }

  // Update Gaussian for observed outcome type (Welford's algorithm)
  const old = cone.details[outcomeType];
  const m = old.sampleCount + 1;
  const newMean = old.mean.map((mu, i) => mu + (detail[i] - mu) / m);
  const newVariance = old.variance.map((v, i) => {
    const delta = detail[i] - old.mean[i];
    const delta2 = detail[i] - newMean[i];
    return ((m - 1) * v + delta * delta2) / m;
  });

  const newDetails = { ...cone.details };
  newDetails[outcomeType] = {
    mean: newMean,
    variance: newVariance,
    sampleCount: m,
  };

  return { outcomeProbs: newProbs, details: newDetails, totalSamples: n };
}
```

### Generalization to Other Domains

The same interface works for any parameterized action:

```typescript
// Robot arm
type ArmOutcome = "reached" | "collision" | "singularity";
type ArmDetail = number[]; // [x, y, z, roll, pitch, yaw]
type ArmCone = Cone<ArmOutcome, ArmDetail>;

// Grasping
type GraspOutcome = "success" | "slip" | "miss";
type GraspDetail = number[]; // [objectX, objectY, gripForce]
type GraspCone = Cone<GraspOutcome, GraspDetail>;
```

### Limitations (Acceptable for Demo)

- **Diagonal covariance only**: No correlation between detail dimensions
- **Unimodal within outcome type**: Can't represent "collision could be at A or B"
- **Fixed outcome types**: Must predefine the categorical outcomes

### Future Extensions (Not Implemented)

- Full covariance matrix for correlated details
- Mixture of Gaussians per outcome type
- Neural density estimator for complex distributions

## Exploration Strategy

Exploration vs. exploitation emerges naturally from the value function. No explicit exploration mechanism (like ε-greedy) is needed.

### The Value Function

```typescript
Score(p; s) = w_reward * ExpectedReward(p, s)
            + w_agency * Agency(p, s)
            - w_risk * Risk(p, s)
```

Where:

- `ExpectedReward` = expected progress toward goal given cone
- `Agency` = how specific the expectations are (narrow cone = high agency)
- `Risk` = variance of outcomes within the cone

### Why Exploration Emerges

**Agency is tied to sample count:**

- Few samples → wide cone → low agency
- Many samples → narrow cone → high agency

**Low agency everywhere = exploration:**

- Early in learning, all regions of M have few samples
- All cones are wide → all ports have similar (low) agency
- No port dominates → agent tries different things
- This IS exploration, but it's not forced — it emerges from indifference

**One port has high agency = exploitation:**

- After sampling, some regions have narrow cones
- These ports have higher agency (and known reward)
- Agent prefers them → exploitation

### Connection to UCB

Upper Confidence Bound (UCB) selects actions by:

```
Score_UCB = MeanReward + β * sqrt(1/n)
```

The second term is an "optimism bonus" for under-sampled actions.

**In TAM terms:**

- `MeanReward` ≈ `ExpectedReward` from the cone
- `sqrt(1/n)` ≈ inversely related to Agency

When a region has few samples:

- Cone is wide → Agency is low
- But the agent doesn't know the reward is bad
- So Score remains competitive with well-sampled regions

This is UCB behavior expressed through cone properties, not an explicit bonus.

### The Mechanism in Detail

```
Time 0: No data
  - All ports: Agency ≈ 0, Risk = high, Reward = unknown
  - Scores are similar → agent picks arbitrarily (exploration)

Time 10: Some samples in region A
  - Region A: Agency = 0.3, Risk = medium, Reward = 0.5
  - Region B: Agency = 0, Risk = high, Reward = unknown
  - If w_agency is moderate, A and B have similar scores
  - Agent still explores B sometimes

Time 100: Many samples in region A
  - Region A: Agency = 0.8, Risk = low, Reward = 0.5
  - Region B: Agency = 0.1, Risk = high, Reward = unknown
  - A clearly dominates → agent exploits A
  - Unless A's reward is bad, then B looks competitive again
```

### Controlling the Balance

**Agency weight controls explore/exploit:**

- High `w_agency` → strong preference for confident ports → more exploitation
- Low `w_agency` → tolerance for uncertain ports → more exploration

**Risk weight also matters:**

- High `w_risk` → avoid uncertain outcomes → prefer known regions → exploit
- Low `w_risk` → willing to try uncertain things → explore

### Information-Seeking as Side Effect

When agency is low across the board:

- Binding any port will narrow its cone
- This increases agency for that port
- The agent is implicitly seeking information

The agent doesn't have an explicit "information gain" term — it emerges from agency-seeking behavior.

### Implementation

```typescript
function selectPort(
  situation: Situation,
  cones: Map<PortParams, Cone>,
  weights: { reward: number; agency: number; risk: number }
): PortParams {
  let bestParams: PortParams | null = null;
  let bestScore = -Infinity;

  for (const [params, cone] of cones) {
    const reward = computeExpectedReward(cone, situation);
    const agency = computeAgency(cone);
    const risk = computeRisk(cone);

    const score =
      weights.reward * reward + weights.agency * agency - weights.risk * risk;

    if (score > bestScore) {
      bestScore = score;
      bestParams = params;
    }
  }

  return bestParams!;
}

function computeAgency(cone: Cone): number {
  // Agency = 1 - (cone width / max width)
  // Approximation: inverse of average variance
  const avgVariance = averageVariance(cone.details);
  return 1 / (1 + avgVariance); // Bounded [0, 1]
}

function computeRisk(cone: Cone): number {
  // Risk = expected variance of outcomes
  // Weighted by outcome probabilities
  let totalRisk = 0;
  for (const [outcome, prob] of Object.entries(cone.outcomeProbs)) {
    const variance = averageVariance(cone.details[outcome]);
    totalRisk += prob * variance;
  }
  return totalRisk;
}
```

### Summary

| Situation                       | Agency | Risk   | Behavior               |
| ------------------------------- | ------ | ------ | ---------------------- |
| No data anywhere                | Low    | High   | Explore (indifference) |
| Some data, good reward found    | Medium | Medium | Exploit good region    |
| Some data, bad reward found     | Medium | Medium | Explore other regions  |
| Lots of data, good reward found | High   | Low    | Exploit confidently    |
| Lots of data, all regions bad   | High   | Low    | Exploit least-bad      |

Exploration is not a mechanism bolted on top — it's what happens when uncertainty makes options look similar.

## Multi-Step Planning via Macro Discovery

Single ports already cover continuous paths (one move(θ, d) produces a trajectory through space). But strategic behavior requires **sequences of port selections** — multi-step plans.

Rather than explicit planning, we use **tkn** to discover macros from experience. Repeated port sequences get chunked into higher-level "maneuver ports."

### Two Levels of Structure

1. **Single port**: `move(θ, d)` → continuous path through world
2. **Macro port**: sequence of `move` calls → strategic maneuver

Example: "Navigate around obstacle" might be:

```
move(45°, 2) → move(0°, 3) → move(-45°, 2)
```

After repeating this pattern, tkn chunks it into a macro.

### Using tkn for Macro Discovery

```typescript
import { createLZSequencer } from "@very-coffee/tkn";

type PortSelection = { theta: number; distance: number };

class MacroAgent {
  private sequencer = createLZSequencer({
    cacheOptions: { bounded: true, max: 500 },
  });
  private macros: Map<string, MacroCone> = new Map();

  // Stream port selections to sequencer
  async recordBinding(port: PortSelection): Promise<void> {
    const key = `${port.theta.toFixed(1)},${port.distance.toFixed(1)}`;
    this.sequencer.push(key);
  }

  // Discover macros from stream
  async startMacroDiscovery(): Promise<void> {
    const reader = this.sequencer.read();
    for await (const segment of reader) {
      if (segment.sequence.length > 1) {
        // Multi-port sequence discovered
        this.learnMacro(segment.key, segment.sequence);
      }
    }
  }

  private learnMacro(macroKey: string, sequence: string[]): void {
    // Parse sequence back to port selections
    const ports = sequence.map((s) => {
      const [theta, distance] = s.split(",").map(Number);
      return { theta, distance };
    });

    // Create or update macro cone
    if (!this.macros.has(macroKey)) {
      this.macros.set(macroKey, createMacroCone(ports));
    } else {
      this.updateMacroCone(macroKey, ports);
    }
  }
}
```

### Macro Cones

A macro cone has expectations over the **entire maneuver**:

```typescript
type MacroCone = {
  // The constituent port sequence
  portSequence: PortSelection[];

  // Outcome distribution for the whole macro
  outcomeProbs: Record<MacroOutcome, number>;

  // Expected endpoint and variance
  endpoint: {
    mean: [number, number];
    variance: [number, number];
  };

  // Confidence
  sampleCount: number;
};

type MacroOutcome =
  | "completed" // All ports succeeded
  | "interrupted" // Collision mid-sequence
  | "diverged"; // Ended somewhere unexpected
```

### Hierarchical Port Selection

With macros, port selection becomes hierarchical:

```typescript
function selectAction(
  situation: Situation,
  primitiveCones: Map<PortParams, Cone>,
  macroCones: Map<string, MacroCone>,
  weights: Weights
): PortSelection | MacroSelection {
  // Score primitive ports
  const primitiveScores = [...primitiveCones.entries()].map(
    ([params, cone]) => ({
      type: "primitive" as const,
      params,
      score: scorePort(cone, situation, weights),
    })
  );

  // Score macros
  const macroScores = [...macroCones.entries()].map(([key, macro]) => ({
    type: "macro" as const,
    key,
    sequence: macro.portSequence,
    score: scoreMacro(macro, situation, weights),
  }));

  // Select best overall
  const all = [...primitiveScores, ...macroScores];
  return all.reduce((best, curr) => (curr.score > best.score ? curr : best));
}

function scoreMacro(
  macro: MacroCone,
  situation: Situation,
  weights: Weights
): number {
  // Expected reward = progress from start to expected endpoint
  const expectedReward = computeProgress(
    situation.position,
    macro.endpoint.mean,
    situation.goal
  );

  // Agency = how specific is the macro outcome?
  const agency = 1 / (1 + averageVariance(macro.endpoint.variance));

  // Risk = variance + probability of interruption
  const interruptionRisk = macro.outcomeProbs.interrupted ?? 0;
  const endpointRisk = averageVariance(macro.endpoint.variance);
  const risk = interruptionRisk + endpointRisk;

  return (
    weights.reward * expectedReward +
    weights.agency * agency -
    weights.risk * risk
  );
}
```

### Why This Works

1. **Emergence**: Macros aren't designed — they're discovered from repeated behavior
2. **Chunking**: LZ compression naturally finds repeated subsequences
3. **Efficiency**: Once a macro is learned, agent can "think" at higher level
4. **Flexibility**: Macros compete with primitives; agent uses whichever scores best

### Example: Learning to Navigate

```
Early behavior (no macros):
  move(30°, 2) → collision
  move(60°, 2) → success
  move(0°, 3) → success
  move(-30°, 2) → collision
  ... random exploration ...

Repeated pattern emerges:
  move(60°, 2) → move(0°, 3) → move(-60°, 2)
  move(60°, 2) → move(0°, 3) → move(-60°, 2)
  move(60°, 2) → move(0°, 3) → move(-60°, 2)

tkn discovers this as a macro:
  "60,2|0,3|-60,2" → MacroCone { ... }

Later behavior:
  Agent evaluates "go around right" macro vs. primitive moves
  Macro has high agency (it's been done 3 times successfully)
  Agent selects macro when situation matches
```

### Macro Proliferation

Just like primitive cones specialize, macros can proliferate:

- "go around right" works in open space
- "go around right tight" emerges for narrow gaps
- "go around right wide" emerges for large obstacles

This is port proliferation at the macro level — the agent develops a vocabulary of maneuvers.

### Connection to TAM Formalism

Macros are a natural extension of TAM:

| Concept       | Primitive Port          | Macro Port                  |
| ------------- | ----------------------- | --------------------------- |
| Port          | Single (θ, d)           | Sequence of (θ, d)          |
| Cone          | Trajectory expectations | Maneuver expectations       |
| Binding       | Execute one move        | Execute sequence            |
| Refinement    | Update from outcome     | Update from overall success |
| Proliferation | Specialize in M         | Specialize in macro space   |

The agent operates on two port manifolds:

- **M_primitive** = S¹ × ℝ⁺ (heading × distance)
- **M_macro** = sequences over M_primitive (discovered by tkn)

Both use the same score function (reward + agency - risk), so they compete on equal footing.

## Real-Time Feedback and Online Correction

The model so far is **open-loop**: bind a port, wait for completion, observe outcome, refine. But humans operate **closed-loop**: we stream sensory feedback continuously and adjust mid-action.

This is why a human can learn to drive in a few sessions while an open-loop agent needs thousands of trials. The feedback loop compresses learning.

### The Problem with Open-Loop

```
Open-loop:
  1. Select move(30°, 5)
  2. Execute entire move
  3. Observe: collision at (3.2, 1.8)
  4. Refine cone: "move(30°, 5) sometimes collides"
  5. Next trial...
```

The agent learns that the move _can_ fail, but not _why_ or _when during execution_ things went wrong. It can't generalize to "obstacle at (3, 2) blocks this path."

### Closed-Loop with Streaming Feedback

```
Closed-loop:
  1. Select move(30°, 5)
  2. Start execution, stream observations:
     t=0: pos=(0,0), vel=(0.5, 0.3) ✓ expected
     t=1: pos=(0.5, 0.3), vel=(0.5, 0.3) ✓ expected
     t=2: pos=(1.0, 0.6), vel=(0.4, 0.2) ⚠️ slowing down?
     t=3: pos=(1.3, 0.7), vel=(0.1, 0.05) ❌ divergence!
  3. Interrupt execution, rebind to move(60°, 2)
  4. Continue with new port...
```

The agent detects divergence _during_ execution and corrects before failure.

### Using tkn for Expectation Streaming

tkn can stream real-time observations and detect when patterns diverge from expectations:

```typescript
import { createLZSequencer } from "@very-coffee/tkn";

type Observation = {
  position: [number, number];
  velocity: [number, number];
  timestamp: number;
};

class ClosedLoopAgent {
  private feedbackSequencer = createLZSequencer({
    cacheOptions: { bounded: true, max: 200 },
  });

  private currentPort: PortSelection | null = null;
  private expectedTrajectory: ExpectedTrajectory | null = null;

  async executeWithFeedback(
    port: PortSelection,
    cone: Cone,
    observationStream: AsyncIterable<Observation>
  ): Promise<BindingOutcome> {
    this.currentPort = port;
    this.expectedTrajectory = sampleExpectedTrajectory(cone);

    for await (const obs of observationStream) {
      // Encode observation as string for tkn
      const encoded = encodeObservation(obs);
      this.feedbackSequencer.push(encoded);

      // Check against expectations
      const divergence = this.measureDivergence(obs);

      if (divergence > CORRECTION_THRESHOLD) {
        // Interrupt and rebind
        return {
          outcome: "interrupted",
          interruptPoint: obs.position,
          divergenceReason: this.diagnoseDivergence(obs),
        };
      }

      if (this.isComplete(obs)) {
        return { outcome: "completed", endpoint: obs.position };
      }
    }

    return { outcome: "timeout" };
  }

  private measureDivergence(obs: Observation): number {
    if (!this.expectedTrajectory) return 0;

    // Find expected state at this time
    const expected = this.expectedTrajectory.at(obs.timestamp);

    // Position divergence
    const posDiff = distance(obs.position, expected.position);
    const posExpectedVariance = this.cone.details.success.variance[0];
    const posZ = posDiff / Math.sqrt(posExpectedVariance);

    // Velocity divergence (are we slowing unexpectedly?)
    const velMag = magnitude(obs.velocity);
    const expectedVelMag = magnitude(expected.velocity);
    const velRatio = velMag / expectedVelMag;

    // Combined divergence score
    return posZ + (velRatio < 0.5 ? 2 : 0); // Slowing down is bad
  }

  private diagnoseDivergence(obs: Observation): string {
    // Use recent observations to diagnose
    const recentPattern = this.feedbackSequencer.getRecentPattern();

    if (recentPattern.includes("decel")) {
      return "unexpected_deceleration"; // Probably approaching obstacle
    }
    if (recentPattern.includes("drift")) {
      return "trajectory_drift"; // Off course
    }
    return "unknown";
  }
}
```

### Expected Trajectory from Cone

The cone gives a distribution over endpoints, but for closed-loop control we need **trajectory expectations**:

```typescript
type ExpectedTrajectory = {
  // Sample points along expected path
  points: Array<{
    time: number;
    position: [number, number];
    velocity: [number, number];
  }>;

  // Variance envelope (how much deviation is normal?)
  positionVariance: (t: number) => number;
  velocityVariance: (t: number) => number;
};

function sampleExpectedTrajectory(
  cone: Cone,
  port: PortSelection
): ExpectedTrajectory {
  // For a simple move, trajectory is roughly linear
  const expectedEndpoint = cone.details.success.mean;
  const duration = port.distance / MOVE_SPEED;

  const points: ExpectedTrajectory["points"] = [];
  for (let t = 0; t <= duration; t += 0.1) {
    const progress = t / duration;
    points.push({
      time: t,
      position: [
        progress * expectedEndpoint[0],
        progress * expectedEndpoint[1],
      ],
      velocity: [
        expectedEndpoint[0] / duration,
        expectedEndpoint[1] / duration,
      ],
    });
  }

  // Variance grows with time (uncertainty accumulates)
  const baseVariance = cone.details.success.variance[0];

  return {
    points,
    positionVariance: (t) => baseVariance * (t / duration),
    velocityVariance: (t) => baseVariance * 0.5,
  };
}
```

### Learning from Interruptions

When the agent interrupts, it gains rich information:

```typescript
function refineFromInterruption(
  cone: Cone,
  port: PortSelection,
  interruptPoint: [number, number],
  reason: string,
  observationHistory: Observation[]
): Cone {
  // This wasn't just a "collision" — we know WHERE and WHY

  if (reason === "unexpected_deceleration") {
    // Obstacle detected at interrupt point
    // Update cone to expect collision earlier for similar ports
    return updateConeWithObstacle(cone, interruptPoint);
  }

  if (reason === "trajectory_drift") {
    // Movement model is wrong
    // Update trajectory expectations
    return updateConeWithDrift(cone, observationHistory);
  }

  return cone;
}

function updateConeWithObstacle(
  cone: Cone,
  obstaclePoint: [number, number]
): Cone {
  // Increase collision probability for this port
  // AND add information about WHERE collision happens
  const newCone = { ...cone };

  // Update collision details with observed point
  const old = cone.details.collision;
  const m = old.sampleCount + 1;
  const newMean = old.mean.map((mu, i) => mu + (obstaclePoint[i] - mu) / m);

  newCone.details.collision = {
    mean: newMean,
    variance: old.variance, // Could also update
    sampleCount: m,
  };

  // Increase collision probability
  const n = cone.totalSamples + 1;
  newCone.outcomeProbs.collision =
    (cone.outcomeProbs.collision * cone.totalSamples + 1) / n;
  newCone.outcomeProbs.success =
    (cone.outcomeProbs.success * cone.totalSamples) / n;

  return newCone;
}
```

### Pattern Learning for Early Detection

tkn learns patterns in the observation stream. Over time, it recognizes early warning signs:

```typescript
class PatternBasedDivergenceDetector {
  private sequencer = createLZSequencer();
  private patternOutcomes: Map<string, OutcomeDistribution> = new Map();

  // Learn: this observation pattern preceded this outcome
  learnPattern(
    observationHistory: string[],
    outcome: "success" | "collision" | "drift"
  ): void {
    // Push history to sequencer, get discovered patterns
    for (const obs of observationHistory) {
      this.sequencer.push(obs);
    }

    // Associate patterns with outcomes
    const patterns = this.sequencer.getDiscoveredPatterns();
    for (const pattern of patterns) {
      const dist = this.patternOutcomes.get(pattern) ?? {
        success: 0,
        collision: 0,
        drift: 0,
      };
      dist[outcome]++;
      this.patternOutcomes.set(pattern, dist);
    }
  }

  // Predict: what does this observation pattern suggest?
  predictOutcome(recentObs: string[]): {
    likelyOutcome: string;
    confidence: number;
  } {
    // Find patterns in recent observations
    const matchingPatterns = this.findMatchingPatterns(recentObs);

    // Aggregate predictions
    let successScore = 0,
      collisionScore = 0,
      driftScore = 0;
    for (const pattern of matchingPatterns) {
      const dist = this.patternOutcomes.get(pattern);
      if (dist) {
        successScore += dist.success;
        collisionScore += dist.collision;
        driftScore += dist.drift;
      }
    }

    const total = successScore + collisionScore + driftScore;
    if (total === 0) return { likelyOutcome: "unknown", confidence: 0 };

    const max = Math.max(successScore, collisionScore, driftScore);
    const likelyOutcome =
      max === collisionScore
        ? "collision"
        : max === driftScore
        ? "drift"
        : "success";

    return { likelyOutcome, confidence: max / total };
  }
}
```

### Why This Enables Fast Learning

1. **Richer signal**: Not just "success/failure" but continuous trajectory data
2. **Early detection**: Catch problems before they become failures
3. **Causal information**: Know WHERE and WHY things went wrong
4. **Pattern transfer**: "Slowing down unexpectedly" transfers across situations
5. **Fewer trials**: One interrupted trial teaches more than one completed trial

### Example: Learning to Avoid an Obstacle

```
Trial 1 (open-loop):
  move(30°, 5) → collision
  Learning: "move(30°, 5) sometimes fails"

Trial 1 (closed-loop):
  move(30°, 5) starts...
  t=2: velocity drops, position=(2.5, 1.5)
  Interrupt! Diagnosis: "obstacle at ~(3, 2)"
  Rebind: move(60°, 3)
  Success!
  Learning:
    - "obstacle around (3, 2)"
    - "velocity drop = impending collision"
    - "move(60°, 3) works from (2.5, 1.5)"
```

One closed-loop trial provides information that would take 10+ open-loop trials.

### Integration with Macro Discovery

Closed-loop corrections can feed into macro discovery:

```typescript
// Stream of port selections during one episode (including corrections)
const portStream: PortSelection[] = [];

async function runEpisode(): Promise<void> {
  while (!atGoal()) {
    const port = selectPort(situation);
    portStream.push(port);

    const outcome = await executeWithFeedback(port, cone, observations);

    if (outcome.outcome === "interrupted") {
      // Correction happened — this is part of the pattern
      const correctionPort = selectPort(situation);
      portStream.push(correctionPort);
    }
  }

  // Feed entire episode to macro sequencer
  for (const port of portStream) {
    macroSequencer.push(encodePort(port));
  }
  // tkn may discover: "move(30°,5) → interrupt → move(60°,3)" as a macro
}
```

Corrections become part of learned macros: "when X happens, do Y" gets chunked into a single maneuver.

### The Full Loop

```
                    ┌─────────────────────────────────┐
                    │       Port Selection            │
                    │  (reward + agency - risk)       │
                    └─────────────┬───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │    Execute with Streaming       │
                    │    Feedback (tkn observation    │
                    │    stream)                      │
                    └─────────────┬───────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        ┌──────────┐       ┌──────────┐       ┌──────────┐
        │ Success  │       │Interrupt │       │ Failure  │
        └────┬─────┘       └────┬─────┘       └────┬─────┘
             │                  │                  │
             │                  │                  │
             ▼                  ▼                  ▼
        ┌──────────┐       ┌──────────┐       ┌──────────┐
        │  Refine  │       │  Refine  │       │  Refine  │
        │  + macro │       │+ diagnose│       │  outcome │
        │  record  │       │+ rebind  │       │  only    │
        └──────────┘       └──────────┘       └──────────┘
```

### Summary

| Aspect           | Open-Loop         | Closed-Loop                     |
| ---------------- | ----------------- | ------------------------------- |
| Feedback         | After completion  | Continuous stream               |
| Learning signal  | Binary outcome    | Rich trajectory                 |
| Correction       | Next trial        | Mid-execution                   |
| Trials to learn  | Many              | Few                             |
| Pattern learning | Port sequences    | Observation patterns            |
| Generalization   | "This port fails" | "This pattern precedes failure" |

Closed-loop control with tkn-based pattern detection enables **human-like fast learning** from continuous feedback.

## Open Questions

1. **Obstacle field representation**: Grid discretization vs. continuous (e.g., kernel density)?

2. **Noise model**: How noisy are position observations?

3. **Cone storage**: One cone per (θ, d) region? How to discretize M, or interpolate?

4. **Weight tuning**: What are good values for w_reward, w_agency, w_risk?

5. **Macro granularity**: How to tune tkn's chunking sensitivity for useful macro size?

6. **Macro decay**: Should old, unused macros be forgotten?

7. **Correction threshold**: When should the agent interrupt vs. wait and see?

8. **Observation encoding**: How to discretize continuous observations for tkn?
