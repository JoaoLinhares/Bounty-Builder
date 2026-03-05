import path from "path";

import { CharacterMechanics, SkillMechanics } from "@/constants/mechanics";
import { StatusEffect } from "@/constants/status-effects";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";
import { CharacterExcel, CharacterGameData, SkillExcell } from "./type";

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

function backUpSave(
  output: string,
  characters: Record<string, CharacterGameData>,
) {
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }

  try {
    writeFileSync(
      path.join(output, "characters_game_data_backup_process.json"),
      JSON.stringify(characters, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.error("Error saving file:", error);
  }
}

const [, , input, output] = process.argv;
const defaultOutput = "scripts/";

if (!input) {
  console.error(
    `Use: npx tsx scripts/tui-data <src> <dest> (dest is optional, default is : ${defaultOutput})`,
  );
  process.exit(1);
}

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const rawData = readFileSync(input, "utf-8");

const characters_file: CharacterExcel[] = Object.values(JSON.parse(rawData));

const new_game_data: Record<string, CharacterGameData> = {};

const backup: Record<string, CharacterGameData> = JSON.parse(
  readFileSync("scripts/characters_game_data_backup_process.json", "utf-8"),
);

function concatString(strings: string[]) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i].replaceAll("-", "").toUpperCase();
    result += "\n";
  }
  return result;
}

function prettyPrint(text: string, regex: RegExp) {
  const RED = "\x1b[31m";
  const BOLD = "\x1b[1m";
  const RESET = "\x1b[0m";
  return text.replace(regex, (match) => {
    return `${RED}${BOLD}${match}${RESET}`;
  });
}

const charMechanicsMap: Record<string, CharacterMechanics[]> = {
  "1 HP WILL BE LEFT EVEN IF KO'D": [
    CharacterMechanics.ONE_HP_WILL_BE_LEFT,
    CharacterMechanics.NULLIFY_ONE_HP_WILL_BE_LEFT,
  ],
  "RECOVER HP WHEN ENOUGH DAMAGE IS TAKEN TO KO CHARACTER": [
    CharacterMechanics.RECOVER_HP_WHEN_KOED,
    CharacterMechanics.NULLIFY_RECOVER_HP_WHEN_KOED,
  ],
  "RECOVER 100% OF HP WHEN ENOUGH DAMAGE IS TAKEN TO KO CHARACTER": [
    CharacterMechanics.RECOVER_HP_WHEN_KOED,
    CharacterMechanics.NULLIFY_RECOVER_HP_WHEN_KOED,
  ],
  "CAN IGNORE THE ENEMY AND CAPTURE THE TREASURE": [
    CharacterMechanics.IGNORE_ENEMY_CAPTURE,
  ],
  "CAN IGNORE THE ENEMY AND REFILL THE TREASURE GAUGE": [
    CharacterMechanics.IGNORE_ENEMY_REFILL,
  ],
  "IGNORES OBSTACLES": [CharacterMechanics.IGNORES_OBSTACLE],
  "IGNORE OBSTACLES": [CharacterMechanics.IGNORES_OBSTACLE],
  COUNTER: [CharacterMechanics.COUNTER],
  CHARGE: [CharacterMechanics.CHARGE],
  CHARGED: [CharacterMechanics.CHARGE],
  "NOT CHARGED": [CharacterMechanics.CHARGE],
  "YOU ARE ABLE TO MOVE WHILE HOLDING DOWN THE SKILL BUTTON": [
    CharacterMechanics.MOVABLE_SKILL,
  ],
  "SHIELD HP": [CharacterMechanics.CREATE_SHIELD],
  "CLONE HP": [CharacterMechanics.CREATE_SHIELD],
  "SPAWNED CHARACTER'S HP": [CharacterMechanics.CREATE_SHIELD],
  STATE: [CharacterMechanics.STATE],
  "INFLICTS SELF": [
    CharacterMechanics.SELF_STATUS_EFFECT,
    CharacterMechanics.STATE,
  ],
  "INFLICT SELF": [
    CharacterMechanics.SELF_STATUS_EFFECT,
    CharacterMechanics.STATE,
  ],
};

const skillsMechanicsMap: Record<string, SkillMechanics[]> = {
  "IGNORES OBSTACLES": [SkillMechanics.IGNORES_OBSTACLE],
  "IGNORE OBSTACLES": [SkillMechanics.IGNORES_OBSTACLE],
  COUNTER: [SkillMechanics.COUNTER],
  CHARGE: [SkillMechanics.CHARGE],
  CHARGED: [SkillMechanics.CHARGE],
  "NOT CHARGED": [SkillMechanics.CHARGE],
  "YOU ARE ABLE TO MOVE WHILE HOLDING DOWN THE SKILL BUTTON": [
    SkillMechanics.MOVABLE_SKILL,
  ],
  "SHIELD HP": [SkillMechanics.CREATE_SHIELD],
  "CLONE HP": [SkillMechanics.CREATE_SHIELD],
  "SPAWNED CHARACTER'S HP": [SkillMechanics.CREATE_SHIELD],
  STATE: [SkillMechanics.STATE],
  "INFLICTS SELF": [SkillMechanics.SELF_STATUS_EFFECT, SkillMechanics.STATE],
  "INFLICT SELF": [SkillMechanics.SELF_STATUS_EFFECT, SkillMechanics.STATE],
  "COMBO SKILL": [SkillMechanics.TIME_GATED],
  "POWER GAGE": [SkillMechanics.POWER_GAGE],
};

const keyWordsChar = [
  "1 HP WILL BE LEFT EVEN IF KO'D",
  "RECOVER HP WHEN ENOUGH DAMAGE IS TAKEN TO KO CHARACTER",
  "RECOVER 100% OF HP WHEN ENOUGH DAMAGE IS TAKEN TO KO CHARACTER",
  "CAN IGNORE THE ENEMY AND CAPTURE THE TREASURE",
  "CAN IGNORE THE ENEMY AND REFILL THE TREASURE GAUGE",
];
const keyWordsSkills = [
  "IGNORES OBSTACLES",
  "IGNORE OBSTACLES",
  "COUNTER",
  "CHARGE",
  "CHARGED",
  "NOT CHARGED",
  "YOU ARE ABLE TO MOVE WHILE HOLDING DOWN THE SKILL BUTTON",
  "SHIELD HP",
  "CLONE HP",
  "SPAWNED CHARACTER'S HP",
  "STATE",
  "INFLICTS SELF",
  "INFLICT SELF",
];
const keyWordsStatusEffects = [
  ...Object.values(StatusEffect).map((s) => s.replaceAll("_", " ")),
  "RECOVERY BLOCKED",
];

const combinedWords = [...keyWordsChar, ...keyWordsSkills];
const regexCharAndSkills = new RegExp(
  `\\b(${combinedWords.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

const regexStatusOnly = new RegExp(
  `\\b(${keyWordsStatusEffects.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

const regexSkillsOnly = new RegExp(
  `\\b(${keyWordsSkills.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

async function characterTUI(
  id: string,
  traits: string,
  type: string[],
  inflictsStatusEffect: string[],
  nullifiesStatusEffect: string[],
  selfStatusEffect: string[],
) {
  const matches = [...traits.matchAll(regexCharAndSkills)];

  const charMechanicsDetected = new Set<CharacterMechanics>();

  matches.forEach((m) => {
    const found = m[0].toUpperCase();
    console.log(found);
    charMechanicsMap[found].forEach((mechanic) => {
      charMechanicsDetected.add(mechanic);
    });
  });

  //TUI Decision
  const missingMechanics = Array.from(charMechanicsDetected).filter(
    (m) => !type.includes(m),
  );

  if (missingMechanics.length > 0) {
    console.log(
      "Missing Mechanics Detected for " + id + " : " + missingMechanics + "\n",
    );

    console.log(prettyPrint(traits, regexCharAndSkills));

    missingMechanics.forEach((m, i) => {
      console.log(i + ":" + m);
    });

    let answered = false;
    while (!answered) {
      const answer = await rl.question("e for exit, seperate by dots (.) \n");
      if (answer === "e") {
        answered = true;
      } else if (!answer.match(/^\d+(?:\.\d+)*$/)) {
        console.log("Wrong format\n");
      } else {
        const numbers = answer.split(".").map((n) => Number(n));
        numbers.forEach((n) => {
          if (!Number.isNaN(n) && n >= 0 && n < missingMechanics.length) {
            type.push(missingMechanics[n]);
          }
        });
        answered = true;
      }
    }
  }

  const matchesSE = [...traits.matchAll(regexStatusOnly)];

  const charSEDetected = new Set<StatusEffect>();

  matchesSE.forEach((m) => {
    const found = m[0]
      .toUpperCase()
      .replaceAll(" ", "_")
      .replace("RECOVERY_BLOCKED", "RECOVERY_BLOCK") as StatusEffect;
    charSEDetected.add(found);
  });

  //TUI Decision
  const missingSE = Array.from(charSEDetected).filter(
    (m) =>
      !inflictsStatusEffect.includes(m) &&
      !nullifiesStatusEffect.includes(m) &&
      !selfStatusEffect.includes(m),
  );

  if (missingSE.length > 0) {
    console.log(
      "Missing Statues Effect Detected for " + id + " : " + missingSE + "\n",
    );

    console.log(prettyPrint(traits, regexStatusOnly));

    missingSE.forEach((m, i) => {
      console.log(i + ":" + m);
    });

    let answered = false;
    while (!answered) {
      const answer = await rl.question(
        "e for exit, seperate by dots (.), after number s - self, n- nullifie, i - inflicts \n",
      );
      if (answer === "e") {
        answered = true;
      } else if (!answer.match(/^\d+[sni]?(?:\.\d+[sni]?)*$/)) {
        console.log("Wrong format\n");
      } else {
        const numbersEval = answer.split(".");
        numbersEval.forEach((n) => {
          const number = Number(n.replace(/[sni]/g, ""));

          if (
            !Number.isNaN(number) &&
            number >= 0 &&
            number < missingSE.length
          ) {
            if (n.includes("s")) {
              selfStatusEffect.push(missingSE[number]);
              if (!type.includes(CharacterMechanics.SELF_STATUS_EFFECT)) {
                type.push(CharacterMechanics.SELF_STATUS_EFFECT);
              }
            } else if (n.includes("n")) {
              nullifiesStatusEffect.push(missingSE[number]);
            } else {
              inflictsStatusEffect.push(missingSE[number]);
              if (!type.includes(CharacterMechanics.STATUS_EFFECT)) {
                type.push(CharacterMechanics.STATUS_EFFECT);
              }
            }
          }
        });
        answered = true;
      }
    }
  }
}

async function skillTUI(
  id: string,
  skillDetails: string,
  skill: SkillExcell,
  char: CharacterExcel,
) {
  const matches = [...skillDetails.matchAll(regexSkillsOnly)];

  const skillMechanicsDetected = new Set<SkillMechanics>();

  if (!skill.type) {
    skill.type = [];
  }

  if (!skill.inflictsStatusEffect) {
    skill.inflictsStatusEffect = [];
  }

  if (!skill.selfStatusEffect) {
    skill.selfStatusEffect = [];
  }
  if (skill?.isPowerGage) {
    skill.type.push(SkillMechanics.POWER_GAGE);
  }

  if (skill?.isTimeGated) {
    skill.type.push(SkillMechanics.TIME_GATED);
  }

  matches.forEach((m) => {
    const found = m[0].toUpperCase();

    skillsMechanicsMap[found].forEach((mechanic) => {
      skillMechanicsDetected.add(mechanic);
    });
  });

  //TUI Decision
  const missingMechanics = Array.from(skillMechanicsDetected).filter(
    (m) => !skill.type.includes(m),
  );

  if (missingMechanics.length > 0) {
    console.log(
      "Missing Skill Mechanics Detected for " +
      id +
      " : " +
      missingMechanics +
      " skill: " +
      skill.name +
      "\n",
    );

    console.log(prettyPrint(skillDetails, regexSkillsOnly));

    missingMechanics.forEach((m, i) => {
      console.log(i + ":" + m);
    });

    let answered = false;
    while (!answered) {
      const answer = await rl.question("e for exit, seperate by dots (.) \n");
      if (answer === "e") {
        answered = true;
      } else if (!answer.match(/^\d+(?:\.\d+)*$/)) {
        console.log("Wrong format\n");
      } else {
        const numbers = answer.split(".").map((n) => Number(n));
        numbers.forEach((n) => {
          if (!Number.isNaN(n) && n >= 0 && n < missingMechanics.length) {
            const m = missingMechanics[n];
            skill.type.push(m);
            if (!char.type.includes(m)) {
              char.type.push(m);
            }
          }
        });
        answered = true;
      }
    }
  }

  const matchesSE = [...skillDetails.matchAll(regexStatusOnly)];

  const charSEDetected = new Set<StatusEffect>();

  matchesSE.forEach((m) => {
    const found = m[0]
      .toUpperCase()
      .replaceAll(" ", "_")
      .replace("RECOVERY_BLOCKED", "RECOVERY_BLOCK") as StatusEffect;
    charSEDetected.add(found as StatusEffect);
  });

  //TUI Decision
  const missingSE = Array.from(charSEDetected).filter(
    (m) =>
      !skill.inflictsStatusEffect.includes(m) &&
      !skill.selfStatusEffect.includes(m),
  );

  if (missingSE.length > 0) {
    console.log(
      "Missing Skill Statues Effect Detected for " +
      id +
      " : " +
      missingSE +
      " skill: " +
      skill.name +
      "\n",
    );

    console.log(prettyPrint(skillDetails, regexStatusOnly));

    missingSE.forEach((m, i) => {
      console.log(i + ":" + m);
    });

    let answered = false;
    while (!answered) {
      const answer = await rl.question(
        "e for exit, seperate by dots (.), after number s - self, i - inflicts \n",
      );
      if (answer === "e") {
        answered = true;
      } else if (!answer.match(/^\d+[si]?(?:\.\d+[si]?)*$/)) {
        console.log("Wrong format\n");
      } else {
        const numbersEval = answer.split(".");
        numbersEval.forEach((n) => {
          const number = Number(n.replace(/[si]/g, ""));

          if (
            !Number.isNaN(number) &&
            number >= 0 &&
            number < missingSE.length
          ) {
            const se = missingSE[number];
            if (n.includes("s")) {
              skill.selfStatusEffect.push(se);
              if (!char.selfStatusEffect.includes(se)) {
                char.selfStatusEffect.push(se);
              }
              if (!char.type.includes(CharacterMechanics.SELF_STATUS_EFFECT)) {
                char.type.push(CharacterMechanics.SELF_STATUS_EFFECT);
              }
              if (!skill.type.includes(CharacterMechanics.SELF_STATUS_EFFECT)) {
                skill.type.push(CharacterMechanics.SELF_STATUS_EFFECT);
              }
            } else {
              skill.inflictsStatusEffect.push(se);
              if (!char.inflictsStatusEffect.includes(se)) {
                char.inflictsStatusEffect.push(se);
              }
              if (!char.type.includes(CharacterMechanics.STATUS_EFFECT)) {
                char.type.push(CharacterMechanics.STATUS_EFFECT);
              }
              if (!skill.type.includes(CharacterMechanics.STATUS_EFFECT)) {
                skill.type.push(CharacterMechanics.STATUS_EFFECT);
              }
            }
          }
        });
        answered = true;
      }
    }
  }
}

try {
  for (const character of characters_file) {
    if (backup[character.gameId]) {
      new_game_data[character.gameId] = backup[character.gameId];
    } else {
      console.log(
        "--------------------" +
        character.gameId +
        " " +
        character.name +
        "--------------------",
      );

      if (!character.selfStatusEffect) {
        character.selfStatusEffect = [];
      }

      const inflictsStatusEffect = character.inflictsStatusEffect;
      const nullifiesStatusEffect = character.nullifiesStatusEffect;
      const selfStatusEffect = character.selfStatusEffect;
      const type = character.type;
      const characterStates = character.characterStates;

      const traits: string =
        concatString(character.characterTraits) +
        concatString(character.traits1) +
        concatString(character.traits2) +
        concatString(character.sizeTraits) +
        concatString(character.boostTrait) +
        characterStates.reduce((acc, curr) => {
          return (
            acc + concatString(curr.sizeTraits) + concatString(curr.stateTraits)
          );
        }, "");

      await characterTUI(
        character.gameId + " " + character.name,
        traits,
        type,
        inflictsStatusEffect,
        nullifiesStatusEffect,
        selfStatusEffect,
      );

      const skills = characterStates.reduce((acc, curr) => {
        return [...acc, ...curr.skills];
      }, [] as SkillExcell[]);

      for (const skill of skills) {
        const skillDetails =
          concatString(skill.description) + concatString(skill.effect);

        await skillTUI(
          character.gameId + " " + character.name,
          skillDetails,
          skill,
          character,
        );
      }

      new_game_data[character.gameId] = {
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
        inflictsStatusEffect,
        nullifiesStatusEffect,
        selfStatusEffect,
        type,
        characterStates,
      };
    }

    new_game_data[character.gameId].characterStates = new_game_data[
      character.gameId
    ].characterStates.map((cs) => {
      return {
        ...cs,
        skills: cs.skills.map(({ isPowerGage, isTimeGated, ...rest }) => {
          return rest;
        }),
      };
    });
    backUpSave(output || defaultOutput, new_game_data);
    console.log(
      "--------------------" +
      character.gameId +
      " " +
      character.name +
      " Done --------------------",
    );
  }
  save(output || defaultOutput, new_game_data);
} finally {
  rl.close();
}
