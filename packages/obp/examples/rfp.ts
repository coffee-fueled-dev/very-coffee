import { obp } from "../src/api";
import { Graph } from "../src/graph";

const graph = new Graph();
const api = obp(graph);

// Minimal end-to-end encoding of the RFQ / work_agreement example from
// `documentation/example-rfp.obp` using the high-level OBP API.
//
// This is intentionally small and imperative: it just wires Parties,
// Offers and Ports together so you can inspect the resulting graph.

const DAY_MS = 24 * 60 * 60 * 1000;

const futureTs = (): number => Date.now() + DAY_MS;

export async function runRfpExample() {
  // Parties
  const hb1 = await api.party.register({ name: "HB_1" });
  const sp1 = await api.party.register({ name: "SP_1" });

  // Party:HB_1
  //   EXTENDS Offer
  //     EXPOSES Port:Terminal:work_agreement
  //             Port:expression_of_interest
  const offer1 = await api.offer.extend(hb1.id, {
    type: "workflow_root",
    ts_expired: futureTs(),
  });

  const workAgreementTerminal = await api.port.expose(offer1.id, {
    type: "work_agreement",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 1,
    terminal: true,
  });

  const expressionOfInterest = await api.port.expose(offer1.id, {
    type: "expression_of_interest",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
  });

  // Party:SP_1
  //   EXTENDS Offer
  //     BINDS Port:expression_of_interest
  //     EXPOSES Port:request_for_quote
  const offer2 = await api.offer.extend(
    sp1.id,
    {
      type: "responds_with_interest",
      ts_expired: futureTs(),
    },
    expressionOfInterest.id
  );

  const requestForQuote = await api.port.expose(offer2.id, {
    type: "request_for_quote",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
  });

  // Party:HB_1
  //   EXTENDS Offer
  //     BINDS Port:request_for_quote
  //     EXPOSES Port:quote
  const offer3 = await api.offer.extend(
    hb1.id,
    {
      type: "sends_quote",
      ts_expired: futureTs(),
    },
    requestForQuote.id
  );

  const quote = await api.port.expose(offer3.id, {
    type: "quote",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
  });

  // Party:SP_1
  //   EXTENDS Offer
  //     BINDS Port:quote
  //     EXPOSES Port:counter,
  //             Port:ref$Terminal:work_agreement
  const offer4 = await api.offer.extend(
    sp1.id,
    {
      type: "counter-offers",
      ts_expired: futureTs(),
    },
    quote.id
  );

  const counterFromSp1 = await api.port.expose(offer4.id, {
    type: "counter",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
  });

  const workAgreementRefFromSp1 = await api.port.expose(offer4.id, {
    type: "ref$work_agreement",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
    ref: workAgreementTerminal.id,
  });

  // Party:HB_1
  //   EXTENDS Offer
  //     BINDS Port:counter
  //     EXPOSES Port:counter,
  //             Port:ref$Terminal:work_agreement
  const offer5 = await api.offer.extend(
    hb1.id,
    {
      type: "responds_to_counter",
      ts_expired: futureTs(),
    },
    counterFromSp1.id
  );

  const counterFromHb1 = await api.port.expose(offer5.id, {
    type: "counter",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
  });

  const workAgreementRefFromHb1 = await api.port.expose(offer5.id, {
    type: "ref$work_agreement",
    ts_expired: futureTs(),
    status: "published",
    max_bindings: 10,
    terminal: false,
    ref: workAgreementTerminal.id,
  });

  // Party:SP_1
  //   EXTENDS Offer
  //     BINDS ref$Terminal:work_agreement
  const offer6 = await api.offer.extend(
    sp1.id,
    {
      type: "accepts_work_agreement",
      ts_expired: futureTs(),
    },
    workAgreementRefFromHb1.id
  );

  // Optionally: explicit bind example if you want to drive from outside the
  // extendOffer helper, e.g. to demonstrate the low-level API:
  await api.port.bind(offer6.id, workAgreementRefFromSp1.id);

  return {
    parties: { hb1, sp1 },
    offers: { offer1, offer2, offer3, offer4, offer5, offer6 },
    ports: {
      workAgreementTerminal,
      expressionOfInterest,
      requestForQuote,
      quote,
      counterFromSp1,
      workAgreementRefFromSp1,
      counterFromHb1,
      workAgreementRefFromHb1,
    },
  };
}

runRfpExample()
  .then((result) => {
    console.log("[rfp] Workflow created:", {
      parties: Object.keys(result.parties),
      offers: Object.keys(result.offers),
      ports: Object.keys(result.ports),
    });
  })
  .catch((err) => {
    console.error("[rfp] Error running RFQ example", err);
  })
  .finally(async () => {
    await graph.close();
  });
