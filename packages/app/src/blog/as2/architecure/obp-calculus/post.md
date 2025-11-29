# **The Offer-Bind-Port Calculus (OBP)**

## **Overview**

The **Offer-Bind-Port (OBP) calculus** is a formal model of workflows in which
parties interact by binding to ports on offers. It provides:

- a space of **offers** and **ports** that expose action opportunities,
- a global **state space** $X$ and a set of admissible trajectories $\mathcal{T}(X)$,
- a notion of **actions** as state-transforming morphisms between offers,
- a **binding operation** that selects admissible trajectories from port-specific
  action cones,
- a **failure sink** $\bot$ and associated transactional semantics for errors,
- a **symmetric monoidal category** $\mathcal{W}$ and a **trace functor**
  that extract execution histories as sequences of actions.

OBP specifies **what it means** for bindings, actions, and executions to be
well-formed and causally valid, without committing to any particular
implementation of state, resources, or concurrency control. It thereby serves
both as:

- an **execution calculus**, when combined with concrete handlers that realize
  actions in external systems, and
- an **observational schema**, when used purely to describe and analyze
  recorded event logs.

## Primitive Sorts and Core Definitions

The calculus is founded upon the following **primitive sorts**:

$$
\mathsf{Party},\qquad
\mathsf{Offer},\qquad
\mathsf{Port},\qquad
\mathsf{Action}.
$$

Here:

- $\mathsf{Party}$, $\mathsf{Offer}$, and $\mathsf{Port}$ are the **ontological primitives**: they describe who participates, which contractual artifacts exist, and which affordances are exposed.
- $\mathsf{Action}$ is a **syntactic generator**: it indexes atomic binding episodes between offers and their ports so that the categorical semantics $\mathcal{W}$ has a concrete generating set of arrows and the trace functors $\mathrm{Tr}$, $\mathrm{Tr}_{\bot}$ range over a well-defined alphabet of events.

In addition, OBP is interpreted over a **state space** $X$ and a set of admissible trajectories $\mathcal{T}(X$, which together provide the semantic foundation for ports and actions.

### State Space and Admissible Trajectories

Let $X$ denote the global state space of the system.

Let $\mathcal{T}(X$ denote the set of all **admissible trajectories**:

$$
\tau : [0,T] \to X, \qquad T < \infty,
$$

where _admissibility_ incorporates all system-level constraints, including:

- physical or logical invariants,
- resource availability and consumption rules,
- party permissions and capabilities,
- port-state and capacity conditions.

Thus, $\mathcal{T}(X$ is the constraint-closed set of possible system evolutions.

Each concrete offer $O \in \mathsf{Offer}$ carries a distinguished **state component**:

$$
\mathsf{StateOf} : \mathsf{Offer} \to X,\qquad
x_O := \mathsf{StateOf}(O).
$$

This state component determines which trajectories are admissible at the ports exposed by $O$.

### Context and Binding-Relevant Data

Binding semantics depend on additional contextual information such as party coalitions, resource inventories, and port metadata. This information is collectively modeled as an element of a **context space**:

$$
\mathsf{Context}.
$$

A context $C \in \mathsf{Context}$ encodes, for example:

- the coalition of parties participating in the binding,
- the current resource inventories of those parties,
- global resource pool levels,
- port states (e.g.\ published, consumed),
- capacity counters and permission sets.

A deterministic function

$$
\mathsf{Ctx} : \mathsf{Offer} \times \mathsf{Port} \times \mathcal{P}(\mathsf{Party}) \to \mathsf{Context}
$$

computes the binding context associated with a proposed binding of a coalition of parties to a port of a given offer.

### Ports as Action Cones

A **port** is interpreted as an **affordance map** exposing a cone of admissible trajectories at each state and context:

$$
P : X \times \mathsf{Context} ;\to; \mathcal{P}(\mathcal{T}(X)).
$$

For $x \in X$ and $C \in \mathsf{Context}$, the set

$$
P(x,C) \subseteq \mathcal{T}(X)
$$

is the **action cone** exposed by the port $P$ at state $x$ under context $C$. Each $\tau \in P(x,C$ is a trajectory that can be launched by binding to $P$ in state $x$ under context $C$.

This definition uniformly subsumes a range of affordance regimes:

- **Discrete ports:** $P(x,C$ is a finite set (often a singleton) of discrete trajectories.
- **Parameterized ports:** $P(x,C) = {\tau_\theta : \theta \in \Theta}$ for a parameter domain $\Theta$.
- **Continuous manifolds:** $P(x,C) = {\tau_\alpha : \alpha \in \Omega}$ for a region $\Omega \subseteq \mathbb{R}^n$.
- **Vector fields and control flows:** $P(x,C$ is the set of integral curves of a controlled vector field under admissible controls.

### Ports as Symbolic Trajectories and Evidence

The same port $P$ admits a complementary **symbolic** reading:

- **Semantic view (action cone):** For each state–context pair $x, C$, the cone

$$
P(x, C) \subseteq \mathcal{T}(X)
$$

is the set of admissible trajectories that can be launched by binding at $P$ in state $x$ under context $C$.

- **Symbolic view (causal trajectory schema):** The port $P$ also serves as a **symbolic trajectory** through the causal graph of $\mathcal{W}$: it names a family of admissible paths from a neighborhood of $x, C$ in OBP causal space to a set of reachable states.

When a binding

$$
\mathsf{Bind}(O, P, \mathcal{C})
$$

is successfully defined and executed, the resulting offer $O'$ is **evidence** that there exists at least one realized trajectory $\tau \in P(x\_O, C$ in the corresponding cone, where

$$
x_O = \mathsf{StateOf}(O), \qquad C = \mathsf{Ctx}(O, P, \mathcal{C}).
$$

In particular:

- each **successful binding at port $P$** witnesses the existence of a realized trajectory in $P(x\_O, C$ for some concrete $x\_O, C$, and
- each **resulting offer $O'$** in the current OBP state space is an artifact of a **past successful commitment** that lay inside some port’s admissible action cone.

Thus, ports are not only affordances; they are also **indices into a body of empirical evidence** about which causal trajectories have in fact been achievable. The evolving web of offers and ports in $\mathcal{W}$ is therefore a compressed record of **witnessed trajectories** that the Program Synthesis Engine $\mathcal{P}$ can exploit when searching for new plans.

### Stochastic Action Cones

The action-cone semantics admits a probabilistic generalization. In the deterministic setting, a port $P$ exposes, at each state $x \in X$, a set $P(x) \subseteq \mathcal{T}(X$ of admissible trajectories. The stochastic formulation replaces this set-valued assignment with a probability measure over trajectories.

#### Definition (Stochastic Action Cone)

A stochastic action cone is a map

$$
P_{\mathsf{stoch}} : X \to \mathsf{Prob}(\mathcal{T}(X)),
$$

where $\mathsf{Prob}(\mathcal{T}(X)$ denotes the set of probability measures on the trajectory space. For each state $x$, the value $P_{\mathsf{stoch}}(x$ is a probability distribution whose support consists precisely of the admissible trajectories originating at $x$.

The deterministic cone model is recovered as the special case in which each cone is a Dirac measure:

$$
P_{\mathsf{det}}(x)(\tau) = \begin{cases}
1, & \tau = \tau^{\ast}, \\
0, & \text{otherwise},
\end{cases}
$$

for some trajectory $\tau^{\ast} \in \mathcal{T}(X$. Thus the deterministic semantics corresponds to the degenerate subclass of stochastic cones with unit mass on a single trajectory.

#### Binding Semantics

Under the stochastic formulation, a binding operation selects a trajectory by sampling

$$
\tau \sim P_{\mathsf{stoch}}(x_O),
$$

and advances the workflow to the resulting endpoint state $x_O' = \tau(T$. All remaining components of the OBP calculus, including the definition of actions, evaluation semantics, and the categorical and operadic interpretations, remain unchanged.

### Port Structure of Offers

The port structure of an offer is defined by the function $\mathsf{Ports}$, which maps an offer to an ordered sequence of ports:

$$
\mathsf{Ports} : \mathsf{Offer} \to \mathsf{Port}^*.
$$

Each $p \in \mathsf{Ports}(O$ is a port endowed with an affordance-map interpretation

$$
[\![p]\!] : X \times \mathsf{Context} \to \mathcal{P}(\mathcal{T}(X)).
$$

For notational simplicity, this interpretation is identified with $p$ itself when no confusion arises.

### Ad-Hoc and Observed Offers and Ports

The calculus does not require a closed, statically declared catalog of offers and ports. New elements of $\mathsf{Offer}$ and $\mathsf{Port}$ may be **introduced dynamically** as execution proceeds or **inferred observationally** from external systems and logs. The only requirement is that, at any given step, the currently referenced offers and ports live in the state space $X$ and respect the admissibility and context constraints defined above.

### Failure Sink ($\bot$)

The set of all offers is defined as the union of valid offers $\mathsf{Offer}^+$ and the distinguished **failure sink** $\bot$:

$$
\mathsf{Offer} = \mathsf{Offer}^+ \cup {\bot}.
$$

The sink $\bot$ exposes the empty sequence of ports:

$$
\mathsf{Ports}(\bot) = \epsilon.
$$

No admissible trajectories emanate from $\bot$; informally, all action cones at $\bot$ are empty.

#### Placement of Recoverable Failure

Categorically, there is a **single** failure object $\bot$ in $\mathcal{W}$. The richer taxonomy of failure modes (e.g.\ terminal, recoverable, contention) is carried as **additional structure** rather than as distinct objects:

- all hard, globally-fatal failures are represented by morphisms whose codomain is $\bot$ and therefore satisfy the absorbing law $O \otimes \bot = \bot$,
- recoverable failures and contention events are represented as **ordinary morphisms** whose codomain is some non-failure offer $O' \in \mathsf{Offer}^+$, annotated with diagnostic labels and, when appropriate, by the failure-trace functor $\mathrm{Tr}_{\bot}$ below,
- **local failures** that should not poison independent concurrent subgraphs are modeled as transitions into diagnostic offers $O' \neq \bot$ on the affected tensor factors; unrelated factors continue to evolve as usual.

Thus, the axiom that $\bot$ is a strict absorbing element applies only once an execution has been classified as terminal and mapped into $\bot$ at the categorical level. All _recoverable_ behavior lives in the ordinary part of the category, with rollback and retry modeled as further morphisms from checkpointed offers, and with the failure taxonomy attached as metadata on traces and/or actions rather than by introducing separate non-absorbing objects $\bot\_{\mathbf{R}}, \bot\_{\mathbf{C}}, \dots$.

### The Action-Morphism Constructor

Ontologically, the dynamics of OBP are already determined by offers, ports, contexts, and admissible trajectories: a **binding** at port $P$ of offer $O$ selects a trajectory $\tau \in P(x_O, C)$ and yields a successor offer $O'$. The sort $\mathsf{Action}$ simply **reifies** such atomic binding episodes as named arrows so that they can generate morphisms in the categorical semantics and serve as the alphabet for trace extraction.

An **action** is a subset of the Cartesian product of offers:

$$
\mathsf{Action} \subseteq \mathsf{Offer} \times \mathsf{Offer}.
$$

The associated input and result offers are defined by the projection maps:

$$
\mathsf{InOffer} : \mathsf{Action} \to \mathsf{Offer},\qquad
\mathsf{ResultOffer} : \mathsf{Action} \to \mathsf{Offer}.
$$

For $a \in \mathsf{Action}$, $a : O \to O'$ denotes an action with

$$
O = \mathsf{InOffer}(a), \qquad O' = \mathsf{ResultOffer}(a).
$$

Each action $a$ corresponds semantically to an admissible trajectory segment

$$
\tau_a \in \mathcal{T}(X)
$$

such that

$$
\tau_a(0) = \mathsf{StateOf}(\mathsf{InOffer}(a)), \qquad
\tau_a(T_a) = \mathsf{StateOf}(\mathsf{ResultOffer}(a))
$$

for some finite horizon $T_a$.

The set of **Hom-sets** (morphisms between individual offers) is defined by:

$$
\mathrm{Hom}(O,O') = { a \in \mathsf{Action} \mid \mathsf{InOffer}(a) = O,\ \mathsf{ResultOffer}(a) = O' }.
$$

## Structural Functions and Semantics

### Binding as Trajectory Selection (Multi-Party)

The **binding function** $\mathsf{Bind}$ is a partial function that constructs an action from an initial offer, a chosen port, and a coalition of parties $\mathcal{P}(\mathsf{Party}$:

$$
\mathsf{Bind} : \mathsf{Offer}^+ \times \mathsf{Port} \times \mathcal{P}(\mathsf{Party}) \rightharpoonup \mathsf{Action}.
$$

Given a triple $O,p,\mathcal{C}$, the associated context is

$$
C = \mathsf{Ctx}(O,p,\mathcal{C}) \in \mathsf{Context},
$$

and the port $p$ exposes an action cone of admissible trajectories at the state $x_O = \mathsf{StateOf}(O$:

$$
p(x_O,C) \subseteq \mathcal{T}(X).
$$

A binding is **defined** if and only if the cone is non-empty:

$$
\mathsf{Bind}(O,p,\mathcal{C}) \ \text{defined}
\quad\Longleftrightarrow\quad
p(x_O, \mathsf{Ctx}(O,p,\mathcal{C})) \neq \varnothing.
$$

In the defined case, the binding operation selects a trajectory

$$
\tau \in p(x_O,C)
$$

and advances the workflow state to

$$
x_O' = \tau(T),
$$

where $T$ is the horizon of $\tau$. A resulting offer $O'$ is defined such that

$$
\mathsf{StateOf}(O') = x_O',
$$

and metadata (ports, resources, ownership) are updated as determined by the semantics of $\tau$.

An action $a = \mathsf{Bind}(O,p,\mathcal{C}$ thus satisfies

$$
\mathsf{InOffer}(a) = O,\qquad
\mathsf{ResultOffer}(a) = O'.
$$

#### Binding Constraints

The validity of a binding is governed by the admissibility of the cone $p(x_O,C$. This admissibility encodes, in particular:

- **Port State Validity:** The port $p$ must be in a published or otherwise bindable state.
- **Capacity:** The current number of bindings at $p$ must be less than a maximum capacity $\max\text{bindings}(p$.
- **Resource Feasibility:** Resource checks must confirm that the state component of $O$, the participating parties $\mathcal{C}$, and the global resource pool collectively support the resource expenditure induced by trajectories in $p(x_O,C$.
- **Permission and Policy Conditions:** The parties in $\mathcal{C}$ must have the necessary permissions to initiate the actions encoded by trajectories in $p(x_O,C$.

These constraints are internalized into the definition of $\mathcal{T}(X$ and into the computation of $p(x_O,C$ via $\mathsf{Context}$.

### Transactional Execution Semantics

At the execution level, OBP is run under **transactional semantics** that govern how bindings and actions affect the concrete workflow state:

- **Binding as reservation:** $\mathsf{Bind}$ is implemented as a time-bounded reservation rather than an irreversible commit, so failed actions can be rolled back without contaminating unrelated ports.
- **Two-phase commit for critical actions:** commit-style ports use a prepare/commit protocol so that failures in the prepare phase remain safely recoverable.
- **Checkpointing:** global states $X$ (or planning states $S$) are checkpointed at $\mathsf{MacroAction}$ boundaries, allowing the system to resume planning from the last successful prefix instead of restarting from $S_0$.

These transactional semantics are part of the core OBP execution model and are used by the failure-handling and learning machinery described below.

### Evaluation Semantics (Deterministic Local Effects)

The OBP calculus has **deterministic local evaluation**: for a fixed action $a$, the successor offer and its port structure are uniquely determined.

The evaluation function

$$
\mathsf{Eval} : \mathsf{Action} \to \mathsf{Offer} \times \mathsf{Port}^*
$$

maps an action to its resulting offer and the ports exposed by that offer:

$$
\mathsf{Eval}(a) = \bigl(\mathsf{ResultOffer}(a),\ \mathsf{Ports}(\mathsf{ResultOffer}(a))\bigr).
$$

Global nondeterminism arises from the existence of **multiple admissible bindings** (multiple cones and trajectories) and from the scheduling of concurrent actions, not from the evaluation of a specific action once chosen.

In particular, OBP actions specify **abstract state transitions** in $X$ and the induced causal structure; they do **not** mandate how concrete side effects are implemented. In practice, each action is associated with an external handler (e.g.\ an API call or service) that performs the real-world mutation, while $\mathcal{W}$ records and constrains the resulting causal graph. OBP therefore serves equally well as:

- a **purely observational schema** for causal event logs, and
- an **execution orchestrator** when combined with effectful handlers and the planner $\mathcal{P}$ driving which actions to realize.

### Trajectory Concatenation

For trajectories

$$
\tau_1 : [0,T_1] \to X,\qquad
\tau_2 : [0,T_2] \to X
$$

with $\tau_1(T_1) = \tau_2(0$, their concatenation is the trajectory

$$
(\tau_2 \circledast \tau_1)(t) :=
\begin{cases}
\tau_1(t) & 0 \le t \le T_1,[4pt]
\tau_2(t - T_1) & T_1 < t \le T_1 + T_2.
\end{cases}
$$

Concatenation is associative up to canonical time reparameterization, providing the semantic basis for sequential composition of actions.

### Failure Transition Rule

A violation of binding constraints yields an empty action cone. When no admissible trajectory exists, the binding is undefined and may be represented at the action level by a distinguished failure action $a_{\mathsf{fail}}$ with

$$
\mathsf{ResultOffer}(a_{\mathsf{fail}}) = \bot.
$$

This convention models failure as a transition into the failure sink $\bot$, after which no further ports are exposed.

### Structured Failure and Transactional Semantics

The OBP execution semantics includes a **structured exception hierarchy** associated with the sink $\bot$. The OBP Execution Service distinguishes, for example:

- **Terminal failure (hard $\bot$):** violation of a core invariant or non-recoverable external error.
- **Recoverable failure ($\bot_{\mathbf{R}}$):** violation of a transient constraint (e.g.\ temporary resource unavailability).
- **Contention failure ($\bot_{\mathbf{C}}$):** violation due to concurrency (e.g.\ another $\mathsf{Party}$ claimed a contested resource first).

Categorically, these exception classes are all represented by the single object $\bot$; the hierarchy is carried as additional structure used by the planner and learner, and may be instantiated both when OBP acts as an executor and when it is used purely as an observational schema over external systems.

Separately from these **outcome-level** failure classes, the platform may annotate individual (otherwise successful) actions with **model-consistency diagnostics** such as “policy mismatch” when an external system performs a bind that, according to the current OBP policy model, should have been rejected. Such events are treated as _successful morphisms_ in $\mathcal{W}$ with an attached diagnostic label, and are not mapped to $\bot$.

In combination with the transactional execution semantics of OBP, this structured view of failure and model diagnostics defines a fault-tolerant substrate that supports robust exception handling, monitoring, and automatic recovery.

## The Symmetric Monoidal Category $\mathcal{W}$ (SMC)

### Objects and Tensor Product

The category $\mathcal{W}$ has objects corresponding to distributed states, represented as tensor products of offers:

$$
X = O_1 \otimes \dots \otimes O_n.
$$

The tensor product $\otimes$ is associative and symmetric, modeling concurrency and distribution of offers across parties or subsystems.

A distinguished **failure sink** object $\bot$ is included, representing a globally failed state in which no further progress is possible.

### Axiom (A6): Strict Absorbing Element

The failure sink $\bot$ is a **strict absorbing element** under the tensor product, enforcing failure contagion across concurrent contexts:

$$
\forall O \in \mathsf{Offer},\quad
O \otimes \bot = \bot \otimes O = \bot.
$$

### Morphisms

Morphisms in $\mathcal{W}$ are generated by:

- primitive actions in $\mathsf{Action}$,
- identity maps,
- symmetry maps $\sigma$,
- sequential composition $\circ$,
- parallel composition $\otimes$.

Semantically, each morphism corresponds to an admissible concatenated trajectory (or combination of trajectories) in $\mathcal{T}(X$, assembled via concatenation and parallel execution.

## Trace Semantics and Trace Extraction

Execution histories are abstracted by a trace functor that maps workflow morphisms to ordered sequences of atomic actions.

### Trace Functor $\mathrm{Tr}$

The trace functor

$$
\mathrm{Tr} : \mathcal{W} \to \mathrm{List}(\mathsf{Action})
$$

is a monoidal natural transformation that extracts the sequence of primitive actions from any composed workflow. The codomain is the free monoid $\mathrm{List}(\mathsf{Action}$ of finite action sequences.

The functor is defined inductively:

- **Atomic Action:**

$$
\mathrm{Tr}(a) = [a].
$$

- **Identity/Symmetry:**

$$
\mathrm{Tr}(\mathrm{id}*X) = \epsilon,\qquad
\mathrm{Tr}(\sigma*{X,Y}) = \epsilon,
$$

where $\epsilon$ is the empty sequence.

- **Sequential Composition:**

$$
\mathrm{Tr}(g \circ f) = \mathrm{Tr}(f) \frown \mathrm{Tr}(g),
$$

where $\frown$ denotes sequence concatenation.

- **Parallel Composition:**

$$
\mathrm{Tr}(f \otimes g) = \mathrm{Tr}(f) \parallel \mathrm{Tr}(g),
$$

where $\parallel$ is a **concurrent shuffle** of two sequences, constrained by causal validity.

### Formal Definition of the Concurrent Shuffle ($\parallel$)

Let $\mathrm{Tr}(f) = [f_1,\dots,f_m]$ and $\mathrm{Tr}(g) = [g_1,\dots,g_n]$. The concurrent shuffle $\parallel$ produces the set of all sequences $h \in \mathrm{List}(\mathsf{Action}$ that interleave these actions while respecting internal order and causal constraints.

#### Unconstrained Shuffle

The unconstrained shuffle (or perfect shuffle) $A \bowtie B$ of sequences $A$ and $B$ is defined inductively:

- **Base Case:**

$$
A \bowtie \epsilon = \epsilon \bowtie A = {A}.
$$

- **Inductive Step:** For non-empty $A = [a] \frown A'$ and $B = [b] \frown B'$,

$$
A \bowtie B
= \{ [a] \frown h \mid h \in A' \bowtie B \}
\cup
\{ [b] \frown h \mid h \in A \bowtie B' \}.
$$

This yields all interleavings that preserve the relative order of actions within each component sequence.

#### Causal Validity Predicate $C(h$

The concurrent shuffle $\parallel$ is defined by filtering the unconstrained shuffle via a causal validity predicate $C$:

$$
\mathrm{Tr}(f) \parallel \mathrm{Tr}(g)
= { h \in \mathrm{Tr}(f) \bowtie \mathrm{Tr}(g) \mid C(h) = \mathsf{True} }.
$$

For a combined trace $h = [h_1, \dots, h_{m+n}]$, define $\mathsf{State}(h_1,\dots,h_k$ to be the distributed state in $\mathrm{Ob}(\mathcal{W}$ resulting from evaluating $h_1,\dots,h_k$ in sequence via $\mathsf{Eval}$ and the monoidal structure.

The predicate $C(h$ is satisfied if, for every $k \in {1,\dots,m+n}$:

- the input offer of $h_k$ is available in the preceding state:

$$
\mathsf{InOffer}(h_k) \in \mathsf{Offers}(\mathsf{State}(h_1,\dots,h_{k-1})),
$$

- the context computed for each binding in $h_k$ admits a non-empty action cone at the relevant port, so that $h_k$ corresponds to a valid binding under the action-cone semantics.

Thus, $C(h$ ensures that $h$ is a valid global execution path.

### Failure Functor and Partial Traces

Not all executions reach a successful terminal state; some transition into a failure sink. The trace semantics therefore includes, in addition to $\mathrm{Tr}$, a **failure trace functor**:

$$
\mathrm{Tr}_{\bot} : \mathcal{W} \to \mathsf{Action}^* \cdot \bot_i,
$$

where $\bot_i$ records the type and point of failure (e.g.\ $\bot_{\mathbf{R}}$ or $\bot_{\mathbf{C}}$). $\mathrm{Tr}_{\bot}$ coincides with $\mathrm{Tr}$ on the successful prefix of an execution and then appends the tagged failure event.

By construction, these failure-annotated traces allow downstream learners (the Learning Module $\mathcal{L}$) and planners ($\mathcal{P}$) to:

- extract **useful prefixes** of failed runs as candidate morphemes, and
- associate distinct penalty profiles with different failure types, rather than treating all failures as equally bad.

### Significance for the Learning Module

The concurrent shuffle induces:

- **Data Generation:** The execution of $f \otimes g$ may yield any interleaving in $\mathrm{Tr}(f) \parallel \mathrm{Tr}(g$, depending on scheduling and concurrency. The trace functor $\mathrm{Tr}$ extracts one such valid linearization as an action sequence $\mathsf{Action}^*$.
- **Robustness:** The Learning Module $\mathcal{L}$ operates on these traces; its learned $\mathsf{MacroAction}\text{s}$ are therefore robust to variations in concurrent execution order that respect underlying causal dependencies.

The output $\mathrm{Tr}(f$ is the concrete, recorded **execution log** or **trace** of the workflow $f$.

### Logging Contract and Replayability

Concrete runtimes typically produce **persistent logs** rather than direct categorical morphisms. To connect these logs to the OBP semantics, we require a replayability contract:

1. Each runtime execution produces a log value $\ell$ in some implementation-defined log type $\mathsf{Log}$.
2. There is a decoding function

$$
\mathsf{Decode} : \mathsf{Log} \to \mathrm{List}(\mathsf{Action})
$$

that projects $\ell$ to a canonical action sequence.

3. **Replayability Axiom.** For every committed execution log $\ell$ there exists a morphism $f \in \mathcal{W}$ such that

$$
\mathsf{Decode}(\ell) = \mathrm{Tr}(f),
$$

where $\mathrm{Tr}$ is the trace functor defined above (including concurrent shuffle and causal filtering). In systems with multiple physical logs (per-service logs, sharded logs, etc.), an implementation-specific merge operator must first assemble a global log $\ell$ that satisfies this axiom.

Operationally, this contract ensures that **whatever logging format the runtime uses** is always replayable into a well-typed OBP morphism whose categorical trace coincides with the stored sequence (up to the usual equivalences induced by associativity and symmetry). The learner $\mathcal{L}$ and planner $\mathcal{P}$ are therefore guaranteed to see traces that respect the causal and typing assumptions baked into $\mathcal{W}$.

## Relationship to Operadic Structure

The OBP calculus admits a complementary **symmetric operad** $\mathcal{O}_{\mathrm{OBP}}$ that formalizes compositional interface patterns independently of concrete execution.

The relationship between specification, execution, and logging is captured schematically by:

$$
\text{Operadic Tree}
;\xrightarrow{\ \text{Evaluation}\ };
\text{SMC Braid/Net}
;\xrightarrow{\ \mathrm{Tr}\ };
\text{Concrete Database Log}.
$$

Here:

- $\mathcal{O}_{\mathrm{OBP}}$ encodes abstract composition rules over interfaces and ports,
- $\mathcal{W}$ provides concrete execution semantics via action cones and trajectories,
- $\mathrm{Tr}$ extracts concrete histories as sequences of actions.

### The Symmetric Operad $\mathcal{O}_{\mathrm{OBP}}$

The symmetric operad $\mathcal{O}_{\mathrm{OBP}}$ defines abstract composition laws over the fundamental sorts of the calculus.

#### Operadic Objects and Arity

The objects of $\mathcal{O}_{\mathrm{OBP}}$ include $\mathsf{Offer}$, $\mathsf{Port}$, $\mathsf{Party}$, and related interface sorts.

An operadic $n$-ary operation is a function

$$
\mu : \mathsf{Offer}^{\otimes n} \to \mathsf{Offer},
$$

which takes $n$ input offers and yields a single output offer.

#### Operadic Generators

The operad is generated by operations corresponding to the semantic primitives:

- **Binding Operation (Abstract):**

$$
\mu_{\mathsf{Bind}} : O \otimes (\mathsf{Party})^{\otimes k} \to O',
$$

representing the abstract effect of binding parties to offers via ports, consistent with the existence of non-empty action cones.

- **Sequential Composition:**

$$
\mu_{\circ} : \mathsf{Offer} \otimes \mathsf{Offer} \to \mathsf{Offer},
$$

representing abstract wiring where the output interface of one component feeds the input of another.

- **Parallel Composition:**

$$
\mu_{\otimes} : \mathsf{Offer} \otimes \mathsf{Offer} \to \mathsf{Offer},
$$

representing the combination of interfaces without sequential dependency.

#### Operadic Substitution

The core operadic composition is substitution, denoted $\circ_i$. Given an $n$-ary operation $\mu$ and a $k$-ary operation $\nu$, the substitution

$$
\mu \circ_i \nu
$$

is an $n+k-1$-ary operation formed by wiring the output of $\nu$ into the $i$-th input of $\mu$.

Semantically, each port in an operadic interface corresponds to an action cone. Substitution corresponds to:

- selecting trajectories from the cones exposed at the interfaces,
- gluing them along matching states and contexts,
- forming a new composite cone for the resulting interface.

The operadic structure thus provides a syntactic blueprint for generating valid OBP workflows, while the SMC $\mathcal{W}$ instantiates their concrete execution via trajectories and action cones. The trace functor $\mathrm{Tr}$ closes the loop by mapping executed operadic compositions into concrete logs for learning.
