export type ArcGameTitle = (typeof arcGameTitles)[number];

export type ArcGameAction = (typeof arcGameActions)[number];

export type ArcGameState = "NOT_FINISHED" | "NOT_STARTED" | "WIN" | "GAME_OVER";

export type ArcGame = {
  game_id: string;
  title: ArcGameTitle;
};

export type ArcGameFrame = {
  game_id: string;
  guid: string;
  frame: number[][][];
  state: ArcGameState;
  score: number;
  win_score: number;
  action_input: {
    id: number;
    data: Record<string, any>;
  };
  available_actions: number[];
};

export type GameCard = {
  game_id: string;
  total_plays: number;
  total_actions: number;
  scores: number[];
  states: string[];
  actions: number[];
};

export type Scorecard = {
  card_id: string;
  won: number;
  played: number;
  total_actions: number;
  score: number;
  source_url?: string;
  tags?: string[];
  opaque?: Record<string, any>;
  api_key: string;
  cards: Record<string, GameCard>;
};

export const arcGameTitles = [
  "LP85",
  "VC33",
  "SP80",
  "AS66",
  "FT09",
  "LS20",
] as const;

export const arcGameActions = [
  "RESET",
  "ACTION1",
  "ACTION2",
  "ACTION3",
  "ACTION4",
  "ACTION5",
  "ACTION6",
  "ACTION7",
] as const;

function getArcApiKey(): string {
  return process.env.ARC_API_KEY!;
}

const endpoints = {
  games: "https://three.arcprize.org/api/games",
  scorecardOpen: "https://three.arcprize.org/api/scorecard/open",
  scorecardClose: "https://three.arcprize.org/api/scorecard/close",
  command: (action: ArcGameAction) =>
    `https://three.arcprize.org/api/cmd/${action}`,
};

export async function listArcGames(): Promise<ArcGame[]> {
  const options = { method: "GET", headers: { "X-API-Key": getArcApiKey() } };

  return await fetch(endpoints.games, options).then(
    (res) => res.json() as Promise<ArcGame[]>
  );
}

export async function openScorecard(metadata?: {
  sourceUrl?: Scorecard["source_url"];
  tags?: Scorecard["tags"];
  opaque?: Scorecard["opaque"];
}): Promise<{ card_id: string }> {
  const body = metadata
    ? {
        source_url: metadata.sourceUrl,
        tags: metadata.tags,
        opaque: metadata.opaque,
      }
    : {};

  const options = {
    method: "POST",
    headers: {
      "X-API-Key": getArcApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(endpoints.scorecardOpen, options);
  const result = await response.json();

  if (!response.ok) {
    console.error("openScorecard failed:", response.status, result);
    throw new Error(`openScorecard failed: ${JSON.stringify(result)}`);
  }

  console.log("openScorecard response:", JSON.stringify(result));
  return result as { card_id: string };
}

export async function closeScorecard(cardId: string): Promise<Scorecard> {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": getArcApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ card_id: cardId }),
  };

  return await fetch(endpoints.scorecardClose, options).then(
    (res) => res.json() as Promise<Scorecard>
  );
}

export async function sendCommand({
  action,
  gameId,
  cardId,
  guid,
  x,
  y,
}: {
  action: ArcGameAction;
  gameId: string;
  cardId?: string;
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
  if (action === "RESET" && !cardId) {
    throw new Error("cardId is required for RESET to associate with scorecard");
  }

  const payload: {
    game_id: string;
    card_id?: string;
    guid?: string;
    x?: number;
    y?: number;
  } = {
    game_id: gameId,
  };

  if (action === "RESET") {
    payload.card_id = cardId;
  } else {
    payload.guid = guid;
  }

  if (action === "ACTION6") {
    payload.x = x;
    payload.y = y;
  }

  console.log(`Sending ${action} to ARC-AGI:`, JSON.stringify(payload));

  const options = {
    method: "POST",
    headers: {
      "X-API-Key": getArcApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const response = await fetch(endpoints.command(action), options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`ARC-AGI ${action} failed: ${JSON.stringify(result)}`);
  }

  return result as ArcGameFrame;
}
