import { ArcGame, ArcGameAction, ArcGameFrame, Scorecard } from "./_types";

const ARC_API_KEY = process.env.ARC_API_KEY!;
const endpoints = {
  games: "https://three.arcprize.org/api/games",
  scorecardOpen: "https://three.arcprize.org/api/scorecard/open",
  scorecardClose: "https://three.arcprize.org/api/scorecard/close",
  command: (action: ArcGameAction) =>
    `https://three.arcprize.org/api/cmd/${action}`,
};

export async function listArcGames(): Promise<ArcGame[]> {
  const options = { method: "GET", headers: { "X-API-Key": ARC_API_KEY } };

  return fetch(endpoints.games, options).then(
    (res) => res.json() as Promise<ArcGame[]>
  );
}

export async function openScorecard(metadata: {
  sourceUrl: Scorecard["source_url"];
  tags: Scorecard["tags"];
  opaque: Scorecard["opaque"];
}): Promise<{ card_id: string }> {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": ARC_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  };

  return fetch(endpoints.scorecardOpen, options).then(
    (res) => res.json() as Promise<{ card_id: string }>
  );
}

export async function closeScorecard(cardId: string): Promise<Scorecard> {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": ARC_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ card_id: cardId }),
  };

  return fetch(endpoints.scorecardClose, options).then(
    (res) => res.json() as Promise<Scorecard>
  );
}

export async function sendCommand({
  action,
  gameId,
  guid,
  x,
  y,
}: {
  action: ArcGameAction;
  gameId: string;
  guid?: string;
  x?: number;
  y?: number;
}): Promise<ArcGameFrame> {
  if (action === "ACTION6" && (!x || !y)) {
    throw new Error("x and y are required for ACTION6");
  }
  if (action !== "RESET" && !guid) {
    throw new Error("guid is required for non-RESET actions");
  }

  const payload: { game_id: string; guid?: string; x?: number; y?: number } = {
    game_id: gameId,
    guid,
  };

  if (action === "ACTION6") {
    payload.x = x;
    payload.y = y;
  }

  const options = {
    method: "POST",
    headers: {
      "X-API-Key": ARC_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  return fetch(endpoints.command(action), options).then(
    (res) => res.json() as Promise<ArcGameFrame>
  );
}
