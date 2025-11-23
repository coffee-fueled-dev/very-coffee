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

export async function registerParty(party: NewParty) {
  SchemaNewParty.parse(party);
  const tx = await graph.spawnTransaction();
  try {
    const completeParty = initializeWithSystemFields(
      "party",
      SchemaNewParty,
      party
    );
    const gParty = await PartyRepository.insert(tx, completeParty);
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
  offer: NewOffer,
  party: Party["id"],
  port?: Port["id"]
): Promise<void> {
  SchemaNewOffer.parse(offer);
  const tx = await graph.spawnTransaction();
  try {
    const gParty = await PartyRepository.get(tx, party);
    if (!gParty) throw new Error(`Party ${party} not found`);

    const completeOffer = initializeWithSystemFields(
      "offer",
      SchemaNewOffer,
      offer
    );
    const gOffer = await OfferRepository.insert(tx, completeOffer);

    const edgeEXTENDS = initializeWithSystemFields(
      "extends",
      SchemaNewEXTENDS,
      {}
    );
    await OfferRepository.extend(tx, gOffer.id, party, edgeEXTENDS);

    if (port) {
      const gPort = await PortRepository.get(tx, port);
      if (!gPort) throw new Error(`Port ${port} not found`);
      await bindPort(tx, gPort, gOffer.id);
    }

    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }
}

export async function exposePort(
  port: NewPort,
  offer: Offer["id"]
): Promise<void> {
  SchemaNewPort.parse(port);
  const tx = await graph.spawnTransaction();
  try {
    const gOffer = await OfferRepository.get(tx, offer);
    if (!gOffer) throw new Error(`Offer ${offer} not found`);

    const completePort = initializeWithSystemFields(
      "port",
      SchemaNewPort,
      port
    );
    const gPort = await PortRepository.insert(tx, completePort);

    const edgeEXPOSES = initializeWithSystemFields(
      "exposes",
      SchemaNewEXPOSES,
      {}
    );
    await OfferRepository.expose(tx, gOffer.id, gPort.id, edgeEXPOSES);

    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }
}

export async function bindPort(
  tx: GraphTransaction,
  port: Port,
  offer: Offer["id"]
): Promise<void> {
  // If port is a ref, recursively resolve and bind the referenced port first, then bind this ref port
  if (PortRepository.isRef(port)) {
    const refPort = await PortRepository.getRef(tx, port);
    if (!refPort) {
      throw new Error(`Referenced port ${port.ref} not found`);
    }

    // Validate both ports can be bound before binding either
    const canBindRefPort = await PortRepository.canBind(tx, refPort);
    if (!canBindRefPort) {
      throw new Error(`Referenced port ${port.ref} cannot be bound`);
    }

    const canBindTargetPort = await PortRepository.canBind(tx, port);
    if (!canBindTargetPort) {
      throw new Error(`Port ${port.id} cannot be bound`);
    }

    // Recursively bind the referenced port (handles nested refs if any)
    await bindPort(tx, refPort, offer);

    // Bind the ref port itself
    const edgeBINDS = initializeWithSystemFields("binds", SchemaNewBINDS, {});
    await PortRepository.bind(tx, offer, port.id, edgeBINDS);
  } else {
    // Not a ref, validate and bind the port
    const canBindPort = await PortRepository.canBind(tx, port);
    if (!canBindPort) {
      throw new Error(`Port ${port.id} cannot be bound`);
    }

    const edgeBINDS = initializeWithSystemFields("binds", SchemaNewBINDS, {});
    await PortRepository.bind(tx, offer, port.id, edgeBINDS);
  }
}
