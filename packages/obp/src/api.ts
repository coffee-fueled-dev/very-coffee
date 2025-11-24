import { Graph, GraphTransaction } from "./graph";
import {
  OfferRepository,
  PartyRepository,
  PortRepository,
} from "./repositories";
import {
  SchemaNewBINDS,
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

export async function extendOffer(
  party: Party["id"],
  offer: NewOffer,
  port?: Port["id"]
): Promise<Offer> {
  SchemaNewOffer.parse(offer);
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

    if (port) await bindPort(tx, gOffer.id, port);

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
  tx: GraphTransaction,
  offer: Offer["id"],
  port: Port["id"],
  visited: Set<Port["id"]> = new Set()
): Promise<void> {
  if (visited.has(port)) {
    throw new Error(
      `Circular reference detected: port ${port} is already in the binding chain`
    );
  }
  visited.add(port);

  const gPort = await PortRepository.get(tx, port);
  if (!gPort) throw new Error(`Port ${port} not found`);
  const canBindTargetPort = await PortRepository.canBind(tx, gPort);
  if (!canBindTargetPort) throw new Error(`Port ${port} cannot be bound`);

  if (PortRepository.isRef(gPort))
    await bindPort(tx, offer, gPort.ref, visited);

  await OfferRepository.bindPort(
    tx,
    offer,
    initializeWithSystemFields("binds", SchemaNewBINDS, {}),
    port
  );
}
