import { Graph } from "./graph";
import { OfferRepository } from "./offer/repository";
import { PartyRepository } from "./party/repository";
import { handleBind } from "./port/handle-bind";
import { PortRepository } from "./port/repository";
import {
  SchemaNewEXPOSES,
  SchemaNewEXTENDS,
  SchemaNewOffer,
  SchemaNewParty,
  SchemaNewPort,
  type NewOffer,
  type NewParty,
  type NewPort,
  type Offer,
  type Party,
  type Port,
} from "./schema";
import { initializeWithSystemFields } from "./schema-helpers";

const registerPartyOperation =
  (graph: Graph) =>
  async (party: NewParty): Promise<Party> => {
    SchemaNewParty.parse(party);
    const ctx = await graph.session();
    try {
      const gParty = await PartyRepository.insert(
        ctx,
        initializeWithSystemFields("party", SchemaNewParty, party)
      );
      return gParty;
    } catch (error) {
      throw error;
    } finally {
      await ctx.close();
    }
  };

const getPartyOperation =
  (graph: Graph) =>
  async (id: Party["id"]): Promise<Party | null> => {
    const ctx = await graph.session();
    try {
      const party = await PartyRepository.get(ctx, id);
      return party;
    } catch (error) {
      throw error;
    } finally {
      await ctx.close();
    }
  };

const getOfferOperation =
  (graph: Graph) =>
  async (id: Offer["id"]): Promise<Offer | null> => {
    const ctx = await graph.session();
    try {
      const offer = await OfferRepository.get(ctx, id);
      return offer;
    } catch (error) {
      throw error;
    } finally {
      await ctx.close();
    }
  };

const getPortOperation =
  (graph: Graph) =>
  async (id: Port["id"]): Promise<Port | null> => {
    const ctx = await graph.session();
    try {
      const port = await PortRepository.get(ctx, id);
      return port;
    } catch (error) {
      throw error;
    } finally {
      await ctx.close();
    }
  };

const extendOfferOperation =
  (graph: Graph) =>
  async (
    party: Party["id"],
    offer: NewOffer,
    port?: Port["id"]
  ): Promise<Offer> => {
    SchemaNewOffer.parse(offer);

    // Validate ts_expired is in the future
    if (offer.ts_expired <= Date.now()) {
      throw new Error(
        `Offer ts_expired must be in the future, got ${offer.ts_expired}`
      );
    }

    const tx = await graph.transaction();
    try {
      const gParty = await PartyRepository.get(tx, party);
      if (!gParty) throw new Error(`Party ${party} not found`);

      const gOffer = await OfferRepository.insert(
        tx,
        initializeWithSystemFields("offer", SchemaNewOffer, offer)
      );

      await PartyRepository.extendOffer(
        tx,
        party,
        initializeWithSystemFields("extends", SchemaNewEXTENDS, {}),
        gOffer.id
      );

      if (port) await handleBind(tx, gOffer.id, port);

      await tx.commit();
      return gOffer;
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  };

const exposePortOperation =
  (graph: Graph) =>
  async (offer: Offer["id"], port: NewPort): Promise<Port> => {
    SchemaNewPort.parse(port);

    // Validate ts_expired is in the future
    if (port.ts_expired <= Date.now()) {
      throw new Error(
        `Port ts_expired must be in the future, got ${port.ts_expired}`
      );
    }

    const tx = await graph.transaction();
    try {
      const gOffer = await OfferRepository.get(tx, offer);
      if (!gOffer) throw new Error(`Offer ${offer} not found`);

      const gPort = await PortRepository.insert(
        tx,
        initializeWithSystemFields("port", SchemaNewPort, port)
      );

      await OfferRepository.exposePort(
        tx,
        gOffer.id,
        initializeWithSystemFields("exposes", SchemaNewEXPOSES, {}),
        gPort.id
      );

      await tx.commit();
      return gPort;
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  };

const bindPortOperation =
  (graph: Graph) =>
  async (offer: Offer["id"], port: Port["id"]): Promise<void> => {
    const tx = await graph.transaction();
    try {
      await handleBind(tx, offer, port);
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  };

export const obp = (graph: Graph) => ({
  port: {
    get: getPortOperation(graph),
    bind: bindPortOperation(graph),
    expose: exposePortOperation(graph),
  },
  offer: {
    get: getOfferOperation(graph),
    extend: extendOfferOperation(graph),
  },
  party: {
    get: getPartyOperation(graph),
    register: registerPartyOperation(graph),
  },
});
