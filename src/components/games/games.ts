// Shared by the server page (random pick) and the client hub, so it lives outside "use client".
export const GAMES = [
  { key: "snake", label: "Snake", blurb: "Clasicul, cu capul RespawnCentral." },
  { key: "aim", label: "Aim trainer", blurb: "30 de secunde, cât mai multe ținte." },
  { key: "trivia", label: "Trivia", blurb: "10 întrebări despre istoria jocurilor." },
] as const;

export type GameKey = (typeof GAMES)[number]["key"];
