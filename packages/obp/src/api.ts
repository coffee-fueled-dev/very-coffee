import { Graph, GraphTransaction } from "./graph";
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

const graph = new Graph();

export async function registerParty(party: NewParty): Promise<Party> {
  SchemaNewParty.parse(party);
  const tx = await graph.transaction();
  try {
    const gParty = await PartyRepository.insert(
      tx,
      initializeWithSystemFields("party", SchemaNewParty, party)
    );
    await tx.commit();
    return gParty;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }
}

export async function getParty(id: Party["id"]): Promise<Party | null> {
  const tx = await graph.transaction();
  try {
    const party = await PartyRepository.get(tx, id);
    await tx.commit();
    return party;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }
}

export async function getOffer(id: Offer["id"]): Promise<Offer | null> {
  const tx = await graph.transaction();
  try {
    const offer = await OfferRepository.get(tx, id);
    await tx.commit();
    return offer;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }
}

export async function getPort(id: Port["id"]): Promise<Port | null> {
  const tx = await graph.transaction();
  try {
    const port = await PortRepository.get(tx, id);
    await tx.commit();
    return port;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }
}

export async function extendOffer(
  party: Party["id"],
  offer: NewOffer,
  port?: Port["id"]
): Promise<Offer> {
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
}

export async function exposePort(
  offer: Offer["id"],
  port: NewPort
): Promise<Port> {
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
}

export async function bindPort(
  offer: Offer["id"],
  port: Port["id"]
): Promise<void> {
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
}
