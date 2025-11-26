import type { GraphTransaction } from "../graph";
import { OfferRepository } from "../offer/repository";
import { SchemaNewBINDS, type Offer, type Port } from "../schema";
import { initializeWithSystemFields } from "../schema-helpers";
import { PortRepository } from "./repository";
import type { Session } from "neo4j-driver";

export async function handleBind(
  ctx: GraphTransaction | Session,
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
  const gOffer = await OfferRepository.get(ctx, offer);
  if (!gOffer) throw new Error(`Offer ${offer} not found`);
  if (OfferRepository.isExpired(gOffer)) {
    throw new Error(`Offer ${offer} is expired and cannot bind ports`);
  }

  const gPort = await PortRepository.get(ctx, port);
  if (!gPort) throw new Error(`Port ${port} not found`);

  await PortRepository.validateBind(ctx, gPort);

  // If this is a ref port, bind to the referenced port first (if not already bound)
  if (PortRepository.isRef(gPort)) {
    const alreadyBound = await OfferRepository.hasBoundPort(
      ctx,
      offer,
      gPort.ref
    );
    if (!alreadyBound) {
      await handleBind(ctx, offer, gPort.ref, visited);
    }
  }

  await OfferRepository.bindPort(
    ctx,
    offer,
    initializeWithSystemFields("binds", SchemaNewBINDS, {}),
    port
  );
}
