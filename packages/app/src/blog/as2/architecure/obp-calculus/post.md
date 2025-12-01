# **The Trajectory-Affordance Process Calculus (TAPC)**

## **1. Overview**

The **The Trajectory-Affordance Process Calculus (TAPC)** is a process calculus in which all interactions are realized as admissible trajectories in a global statespace. Rather than treating actions as symbolic labels, TAPC grounds them in the underlying system dynamics: actions correspond to concrete state evolutions, and interaction is understood as the selection of one such evolution.

TAPC provides a unified formal structure for representing action, evolution, and concurrency through the lens of **trajectory affordances**. Its core components are:

- **Ports**, which are canonical affordance maps that, under a given offer’s state and context, yield a cone of admissible trajectories;
- **Offers**, which are concrete event nodes that both record a trajectory taken through a Port, and expose port instances which are admissible given the state-context pair with which they were evaluated;
- a global **state space** $X$, whose trajectories $\mathcal{T}(X)$ form the semantic substrate for all affordances, selections, and compositions;

From these primitives, TAPC induces additional semantic structure: a symmetric monoidal model of concurrency, a trace semantics for extracting execution histories, and a failure semantics for representing violations of admissibility.

## **2. Semantic Ontology**

### **2.1. Internal State Space and Modeled Trajectories**

TAPC departs from label- or term-based calculi by grounding behavior in **trajectory affordances** over an internal model of system evolution. TAPC does not encode the external world directly. Instead, its worldview is represented by an **internal state space $\mathcal{X}$**, which is a causal graph constructed and refined through interaction with the environment.

A **trajectory** $\tau$ in TAPC is the representation of a state evolution selected from the admissible set $P(x\_O, C\_O)$ exposed by a Port instance $P$ at an Offer $O$. Selecting such a trajectory either yields a successor Offer $O'$ within the same causal chain or results in a trace violation when the selection fails admissibility or contradicts external feedback.

A port instance determines an **affordance cone**:

$$
P(x\_O, C\_O) \subseteq \mathcal{T}(\mathcal{X}),
$$

the set of modeled trajectories which are feasible from $O$ under context $C\_O$.

Binding selects one such trajectory:

$$
\mathrm{Bind}(O, P) \rightsquigarrow \tau \in P(x\_O, C\_O).
$$

If the chosen trajectory is admissible and external feedback is consistent with the modeled evolution,

$$
\tau \in P(x\_O, C\_O) \quad \Rightarrow \quad \text{binding succeeds},
$$

the result is a new Offer in the causal chain

$$
a : O \to O',
$$

where $O'$ continues the causal chain and exposes new port instances.

If no admissible trajectory exists or if real-world results contradict the prediction, binding fails, yielding a **trace violation**:

$$
P(x\_O, C\_O) = \varnothing \quad \text{or} \quad \text{external mismatch}.
$$

### **2.2. Ports**

A **Port** specifies the **class of admissible trajectories** that may be selected when it is bound at an Offer. Binding a port instantiates a predictive affordance map; transforming a state-context pair into a predicted trajectory of world evolution, against which the actual outcome can later be compared to produce evidence or trace violations.

**Definition of a Port.**

Let:

- $\mathcal{X}$ be the agent’s internal state space (causal graph),
- $C$ be the set of Offer-local contexts,
- $\mathcal{T}(\mathcal{X})$ be the space of internal trajectories.

A **A Port** is a pair:

$$
P = (\text{name}, \Phi_P)
$$

where:

1. **name** is a symbol in a global signature

$$
\text{name} \in \Sigma_P
$$

(e.g. `move`, `sense`, `commit`, …)

2. **$\Phi_P$** is an **affordance schema**:

$$
\Phi_P : \mathcal{X} \times C \rightharpoonup \mathcal{P}(\mathcal{T}(\mathcal{X}))
$$

assigning to each state–context pair a set of **admissible trajectories**.

Thus, a Port denotes how the agent predicts possible evolutions of the world, conditioned on the Offer’s epistemic and material situation. The calculus assigns no intrinsic meaning to the port name itself; its semantic value arises solely from the affordances that $\Phi_P$ yields in the specific Offer context.

Let an Offer $O$ expose a state–context pair $(x_O, C_O)$.
The port then instantiates to the admissible-trajectory set:

$$
P_O := \Phi_P(x_O, C_O)
$$

This yields the contextual semantics:

**Semantic Interpretation Rule.**

> The meaning of the port name $P$ at Offer $O$ is precisely the set of admissible trajectories $P_O$.
> That is, the denotation of the symbol (e.g. “move”) in context $O$ is the trajectory affordance that $\Phi_P$ predicts from $(x_O, C_O)$.

A port is meaningful at $O$ exactly when its instantiated affordance set is nonempty:

$$
P_O = \varnothing \quad\Longleftrightarrow\quad
\text{$P$ has no coherent interpretation at $O$.}
$$

**Modeling Convention (Interaction Idioms).**

> To ensure interpretability and avoid unstructured proliferation of ports, each canonical Port is intended to denote a stable interaction idiom: a conventional pattern in the structure of the trajectories it predicts.
> This convention guides modeling practice but is not enforced by the formal semantics of TAPC.

**Port Equivalence.**
Two Ports may be considered equivalent when they produce equivalent admissible cones for the same Offer

$$
P \equiv_O Q
\quad\Longleftrightarrow\quad
\Phi_P(x_O, C_O) = \Phi_Q(x_O, C_O).
$$

This notion of equivalence is purely a specification-level relation; it has no operational force and does not require merging or deduplication of Ports.

**In summary:**

> A canonical Port is a globally named, context-sensitive affordance schema
>
> $$
> P = (\text{name}, \Phi\_P)
> $$
>
> where
>
> $$
> \Phi_P: \mathcal{X} \times C \rightharpoonup \mathcal{P}(\mathcal{T}(\mathcal{X}))
> $$
>
> assigns to each state–context pair the set of admissible trajectories.
>
> When bound at an Offer $O = (x\_O, C\_O)$, its instantiated meaning is
>
> $$
> P\_O = \Phi\_P(x\_O, C\_O).
> $$
>
> Port meaning is **polysemous** and **contextually determined**:
> the name alone does not fix the affordance class; the Offer’s state and context determine the admissible trajectories and therefore the operative semantics of the Port.

### **2.3. Offers**

An **Offer** is the explicit record of a successfully bound trajectory within a causal chain. An Offer exposes a set of Ports which may be bound next, given the state–context pair realized by the preceding trajectory. An Offer is therefore the semantic anchor between one realized trajectory and the affordance landscape available for the next step in the causal chain.

**Definition of an Offer.**
Let:

- $x\_O \in \mathcal{X}$ be the internal state reached at the end of a successfully bound trajectory,
- $C\_O \in C$ be the context after that trajectory completes,
- $\mathsf{Ports}(O) \subseteq \Sigma\_P$ be the set of canonical port names the agent elects to expose at this point.

Then an **Offer** is a triple:

$$
O = (x\_O, C\_O, \mathsf{Ports}(O)).
$$

Each port $P \in \mathsf{Ports}(O)$ is instantiated at the Offer by evaluating its affordance schema:

$$
P_O := \Phi\_P(x\_O, C\_O).
$$

These instantiated affordance sets represent the specific trajectories that could be bound next from this point in the causal chain.

A well-formed Offer must satisfy:

$$
\mathsf{Ports}(O) \subseteq
{, P \in \Sigma\_P \mid \Phi\_P(x\_O, C\_O) \neq \varnothing ,}.
$$

Every Offer corresponds to a **realized trajectory** (the one that produced it), and the **affordance profile** available immediately thereafter.

Thus the causal chain is:

$$
O\_0 \xrightarrow{\tau\_0} O\_1 \xrightarrow{\tau\_1} O\_2 \xrightarrow{\ta_2} \cdots
$$

where each $\tau\_i \in (P\_i)_{O\_i}$ for some port $P\_i$ admissible at Offer $O\_i$.

Offers are historical artifacts, created only after a trajectory is successfully bound. An Offer is semantically meaningful precisely when it exposes at least one port whose instantiated affordance set is nonempty:

$$
\exists P \in \mathsf{Ports}(O) ;\text{such that}; P\_O \neq \varnothing.
$$

Otherwise the Offer is a **terminal node**—a point with no admissible continuation.

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
