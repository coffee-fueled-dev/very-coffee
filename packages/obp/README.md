# Offer Binding Protocol (OBP)

### A Minimal Interaction Graph for Workflows, Negotiation, and Process Automation

The **Offer Binding Protocol (OBP)** is a small, typed graph protocol for representing how actors (Parties) take actions (Offers) and expose or consume affordances (Ports).  
It models multi-step workflows, negotiations, and agent interactions in a clean, composable, and machine-interpretable way.

This SDK provides:

- Strongly typed entities (`Party`, `Offer`, `Port`)
- Strongly typed edges (`EXTENDS`, `EXPOSES`, `BINDS`)
- Zod-based validation
- Neo4j-backed persistence
- A transactional operations layer for constructing OBP graphs

The goal is to give you a **uniform representation of interactions**—no matter the domain—and a **causal history** of what happened, step-by-step.

---

# 🧠 Conceptual Model

OBP defines **3 entities** and **3 relationships**:

## Entities

### **Party**

Represents an actor: a brand, provider, system agent, or internal actor.

```ts
{
  id: uuidv7,
  ts_created: number,
  name: string,
  external?: { id: string, source: string }
}
```

Parties are the “sources” of Offers.

---

### **Offer**

Represents a proposal, message, update, or step in a workflow.

```ts
{
  id: uuidv7,
  ts_created: number,
  ts_expired: number,
  name: string,
  external?: { id: string, source: string }
}
```

An Offer may:

- **Expose** Ports (affordances / next-step options)
- **Bind** a Port exposed by a previous Offer
- **Extend** a Party (every Offer has an issuing Party)

---

### **Port**

Represents a continuation point or affordance exposed by an Offer.

```ts
{
  id: uuidv7,
  ts_created: number,
  ts_expired: number,
  name: string,
  status: "draft" | "published" | "archived",
  max_bindings: number,
  terminal: boolean,
  ref?: Port["id"],
  external?: { id: string, source: string }
}
```

Ports declare **what can happen next**.

Example:

- `request_for_quote`
- `counter_offer`
- `accept` (terminal)
- `reject` (terminal)

Ports may be bound by future Offers.

---

# Relationships

OBP uses **three** edge types:

### **EXTENDS**

`(Party) -[:EXTENDS]-> (Offer)`

Represents:  
**“This Party issued this Offer.”**

Every Offer should have one `EXTENDS` edge from its issuing Party.

---

### **EXPOSES**

`(Offer) -[:EXPOSES]-> (Port)`

Represents:  
**“This Offer exposes a Port (an affordance that others can bind).”**

Examples:

- A Quote Offer exposes `accept` and `counter` Ports
- An RFQ Offer exposes `submit_quote`

Each exposed Port adds potential next steps in the workflow.

---

### **BINDS**

`(Offer) -[:BINDS]-> (Port)`

Represents:  
**“This Offer binds or consumes a previously exposed Port.”**

Binding is how workflows advance:

- Provider issues a Quote → binds an `rfq.submit` Port
- Brand issues an Accept → binds the Quote’s `accept` Port

A terminal Port marks a workflow’s completion when bound.

---

# 🔄 Interaction Pattern

OBP produces a **causal chain** of Offers and Ports:

```
Party A --EXTENDS--> Offer #1 --EXPOSES--> Port(request)
                                       ↑
                                       |
                      Offer #2 --BINDS-+
                      (Party B EXTENDS)
```

Every new Offer:

1. **EXTENDS** a Party
2. Optionally **BINDS** a prior Port
3. May **EXPOSE** new Ports

This yields **structured, explicit, replayable workflows** with no hidden transitions.

---

# 🏛 SDK Structure

The SDK consists of:

## 1. **Schemas (`schema.ts`)**

Defines the shape of:

- `Offer`, `NewOffer`
- `Party`, `NewParty`
- `Port`, `NewPort`
- Edge metadata (`EXTENDS`, `EXPOSES`, `BINDS`)

Built using Zod for:

- Validation
- Strong typing
- Consistent system fields (`id`, `ts_created`)

---

## 2. **Graph Layer (`graph.ts`)**

A thin wrapper around Neo4j providing:

- A `Graph` instance (connection + lifecycle)
- A `GraphTransaction` for:
  - `run(cypher, params)`
  - transactional commit/rollback
- `GraphNode<T>` wrapper to attach `bind()` and `expose()` methods to Offers

This layer is low-level and used internally by repositories & operations.

---

## 3. **Repositories (`repositories/*.ts`)**

Each entity type has a repository with methods for:

- `insert`
- `get`
- Creating edges (`extend`, `expose`, `bind`)

These emit actual Neo4j Cypher:

```cypher
CREATE (offer)-[:BINDS { ... }]->(port)
```

Repositories are used inside transactions and do not expose business logic.

---

## 4. **Operations Layer (`operations.ts`)**

This is the ergonomic API you call from application code.

### Register a Party

```ts
const party = await registerParty({
  name: "Acme Corp",
});
```

### Extend an Offer

```ts
await extendOffer(
  { name: "Quote", ts_expired: ... },
  partyId,
  optionalPortToBind
);
```

Creates:

- A new Offer node
- `Party --EXTENDS--> Offer`
- Optional `Offer --BINDS--> Port`

### Expose a Port

```ts
await exposePort({
  name: "accept",
  terminal: true,
  max_bindings: 1,
  ts_expired: ...
}, offerId);
```

Creates:

- A new Port node
- `Offer --EXPOSES--> Port`

This gives you a complete write-path for building OBP workflows.

---

# 🌱 Minimal Example

### 1. Party registers

### 2. Party issues RFQ (Offer #1)

### 3. RFQ exposes a “submit_quote” Port

### 4. Provider binds the Port with a Quote (Offer #2)

```ts
const acme = await registerParty({ name: "Acme" });
const vendor = await registerParty({ name: "Vendor123" });

// RFQ
await extendOffer(
  { name: "rfq", ts_expired: ... },
  acme.id
);

// Expose RFQ affordance
await exposePort(
  {
    name: "submit_quote",
    status: "published",
    terminal: false,
    max_bindings: 1,
    ts_expired: ...,
  },
  rfqOfferId
);

// Vendor submits quote
await extendOffer(
  { name: "quote", ts_expired: ... },
  vendor.id,
  submitQuotePortId
);
```

OBP graph now fully captures the negotiation chain.

---

# 🔍 Why Use OBP?

Even in minimal form, OBP provides:

- **A uniform model across all workflows**
- **Complete causal traces for ML**
- **Interpretable, declarative structure**
- **Separation of concerns between:**
  - entities
  - actions
  - affordances
- **Extensibility**: new workflows = new Offer/Port types, not new schemas
- **Clean graph representation** for multi-agent planning or negotiation

It’s designed to stay small but grow indefinitely.

---

# 📦 Summary

**OBP = minimal, typed, causal workflow graph.**  
This SDK implements:

- Parties (actors)
- Offers (actions)
- Ports (affordances)
- EXTENDS (actor issues offer)
- EXPOSES (offer creates affordance)
- BINDS (offer consumes affordance)

With:

- Neo4j-backed persistence
- Transactional writes
- Zod validation
- Clear, composable operations

Use it to model negotiation, marketplace interactions, agent actions, or any multi-step workflow in a structured and consistent way.
