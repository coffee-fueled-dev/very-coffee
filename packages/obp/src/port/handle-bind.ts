import type { GraphTransaction } from "../graph";
import { OfferRepository } from "../offer/repository";
import { SchemaNewBINDS, type Offer, type Port } from "../schema";
import { initializeWithSystemFields } from "../schema-helpers";
import { PortRepository } from "./repository";

export async function handleBind(
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

  // Check if offer is expired
  const gOffer = await OfferRepository.get(tx, offer);
  if (!gOffer) throw new Error(`Offer ${offer} not found`);
  if (OfferRepository.isExpired(gOffer)) {
    throw new Error(`Offer ${offer} is expired and cannot bind ports`);
  }

  const gPort = await PortRepository.get(tx, port);
  if (!gPort) throw new Error(`Port ${port} not found`);

  await PortRepository.validateBind(tx, gPort);

  if (PortRepository.isRef(gPort))
    await handleBind(tx, offer, gPort.ref, visited);

  await OfferRepository.bindPort(
    tx,
    offer,
    initializeWithSystemFields("binds", SchemaNewBINDS, {}),
    port
  );
}
