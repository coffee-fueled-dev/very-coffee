export type ArcGameActionList = [
  "RESET",
  "ACTION1",
  "ACTION2",
  "ACTION3",
  "ACTION4",
  "ACTION5",
  "ACTION6",
  "ACTION7",
];

export type ArcGameAction = ArcGameActionList[number];

export type ArcGameState = "NOT_FINISHED" | "NOT_STARTED" | "WIN" | "GAME_OVER";

export type ArcGame = {
  game_id: string;
  title: string;
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
