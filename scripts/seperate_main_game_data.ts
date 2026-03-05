import path from "path";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { CharacterExcel, CharacterGameData } from "./type";


function save(output: string, characters: Record<string, CharacterGameData>) {
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }

  try {
    writeFileSync(
      path.join(output, "characters_game_data.json"),
      JSON.stringify(characters, null, 2),
      "utf-8",
    );
    console.log("File characters_game_data.json saved successfully!");
  } catch (error) {
    console.error("Error saving file:", error);
  }
}

const [, , input, output] = process.argv;
const defaultOutput = "scripts/";

if (!input) {
  console.error(
    `Use: npx tsx scripts/seperate_main_game_data <src> <dest> (dest is optional, default is : ${defaultOutput})`,
  );
  process.exit(1);
}

const rawData = readFileSync(input, "utf-8");

const characters_file: CharacterExcel[] = JSON.parse(rawData);

const game_data: Record<string, CharacterGameData> = {};

for (const character of characters_file) {
  game_data[character.gameId] = {
    name: character.name,
    gameId: character.gameId,
    nameId: character.nameId,
    mainSize: character.mainSize,
    teamBoost: character.teamBoost,
    sizeTraits: character.sizeTraits,
    characterTraits: character.characterTraits,
    traits1: character.traits1,
    traits2: character.traits2,
    boostTrait: character.boostTrait,
    inflictsStatusEffect: character.inflictsStatusEffect,
    nullifiesStatusEffect: character.nullifiesStatusEffect,
    selfStatusEffect: character.selfStatusEffect || [],
    type: character.type,
    characterStates: character.characterStates,
  };
}
save(output || defaultOutput, game_data);
