import "server-only";
import { sql } from "./db";
import { withSchema } from "./migrations";
import type { TriviaQuestion } from "./types";

type Q = Omit<TriviaQuestion, "id" | "active">;

/** Built-in questions, used until the team adds its own in the editor (Trivia). */
export const DEFAULT_TRIVIA: Q[] = [
  { question: "În ce an a apărut primul Super Mario Bros. pe NES?", answers: ["1983", "1985", "1988", "1990"], correct: 1 },
  { question: "Ce studio a creat seria The Witcher?", answers: ["Ubisoft", "CD Projekt Red", "Bethesda", "BioWare"], correct: 1 },
  { question: "Cum se numește eroul din seria The Legend of Zelda?", answers: ["Zelda", "Link", "Ganon", "Epona"], correct: 1 },
  { question: "Care e cel mai bine vândut joc video din toate timpurile?", answers: ["GTA V", "Tetris", "Minecraft", "Wii Sports"], correct: 2 },
  { question: "În ce oraș fictiv se petrece GTA V?", answers: ["Vice City", "Liberty City", "Los Santos", "San Fierro"], correct: 2 },
  { question: "Ce consolă a lansat Sony în 1994?", answers: ["Dreamcast", "PlayStation", "Nintendo 64", "Saturn"], correct: 1 },
  { question: "Cum se numește monstrul verde care explodează în Minecraft?", answers: ["Enderman", "Creeper", "Zombie", "Ghast"], correct: 1 },
  { question: "Ce companie a creat Fortnite?", answers: ["Epic Games", "Riot Games", "Valve", "Blizzard"], correct: 0 },
  { question: "Cum îi spune toată lumea protagonistului din Halo?", answers: ["Master Chief", "Marcus Fenix", "Doomguy", "Commander Shepard"], correct: 0 },
  { question: "În ce joc apare orașul Night City?", answers: ["Watch Dogs", "Deus Ex", "Cyberpunk 2077", "Mirror's Edge"], correct: 2 },
  { question: "În ce an a apărut Pac-Man?", answers: ["1978", "1980", "1982", "1985"], correct: 1 },
  { question: "Câte piese diferite (tetromino) există în Tetris?", answers: ["5", "6", "7", "8"], correct: 2 },
  { question: "Ce companie face consolele Xbox?", answers: ["Sony", "Microsoft", "Nintendo", "Sega"], correct: 1 },
  { question: "În ce joc trebuie să descoperi impostorul din echipaj?", answers: ["Fall Guys", "Among Us", "Phasmophobia", "Lethal Company"], correct: 1 },
  { question: "Cum se numește regatul din The Legend of Zelda?", answers: ["Hyrule", "Tamriel", "Azeroth", "Mushroom Kingdom"], correct: 0 },
  { question: "Pe ce hartă se joacă de obicei League of Legends?", answers: ["Dust II", "Summoner's Rift", "Erangel", "Ascent"], correct: 1 },
  { question: "Ce studio dezvoltă jocurile principale Pokémon?", answers: ["Game Freak", "Capcom", "Square Enix", "Sega"], correct: 0 },
  { question: "Cum se numește acum seria de fotbal care se chema FIFA?", answers: ["eFootball", "EA Sports FC", "UFL", "Football Manager"], correct: 1 },
  { question: "Ce consolă portabilă a lansat Valve în 2022?", answers: ["Steam Deck", "Switch Lite", "ROG Ally", "PS Vita"], correct: 0 },
  { question: "Cum se numește prințesa salvată de Mario?", answers: ["Daisy", "Zelda", "Peach", "Rosalina"], correct: 2 },
];

export async function getAllTriviaQuestions(): Promise<TriviaQuestion[]> {
  return withSchema(
    () => sql<TriviaQuestion[]>`
      select id, question, answers, correct, active from trivia_questions order by created_at asc
    `,
  );
}

/** Questions for the game: the team's active ones, or the built-in set if there are none (or the DB fails). */
export async function getTriviaForGame(): Promise<Q[]> {
  try {
    const own = (await getAllTriviaQuestions()).filter((q) => q.active);
    if (own.length >= 5) return own.map(({ question, answers, correct }) => ({ question, answers, correct }));
  } catch {
    // fall through to the defaults
  }
  return DEFAULT_TRIVIA;
}
