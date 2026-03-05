import { CharacterTag } from "@/constants/character-tags";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { existsSync, readFileSync } from "fs";
import { CharacterExcel } from "../../scripts/character-parser";
import { MedalExcel } from "../../scripts/medal-parser";

const charJSON = '../data/characters.json'
const medalJSON = '../data/medals.json'
const rankedMedalJSON = '../data/rankedMedals.json'
const eventMedalJSON = '../data/eventMedals.json'
const specialMedalJSON = '../data/specialMedals.json'

const files = [charJSON, medalJSON, rankedMedalJSON, eventMedalJSON, specialMedalJSON]

//verify files existence
for (const file of files) {
    if (!existsSync(file)) {
        console.error('FILE ERROR:: ' + file + ' not found.')
        process.exit(1)
    }
}

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
    connectionString
})

const prisma = new PrismaClient({
    adapter
})




async function resetDatabase() {
    console.log('Resetting database...')

    // Deleting relations tables
    await prisma.uniqueTraitConstraintRelation.deleteMany()
    await prisma.uniqueTraitRelation.deleteMany()
    await prisma.medalTagRelation.deleteMany()
    await prisma.characterTagRelation.deleteMany()
    await prisma.medalTrait.deleteMany()


    // Deleting leef tables
    await prisma.medalTag.deleteMany()
    await prisma.uniqueTrait.deleteMany()
    await prisma.uniqueTraitConstraint.deleteMany()
    await prisma.characterTag.deleteMany()

    await prisma.medalSetSlot.deleteMany()
    await prisma.medalSetCharacter.deleteMany()
    await prisma.medalSet.deleteMany()
    await prisma.userMedal.deleteMany()

    // Deleting user/char/party relation logic
    await prisma.playableCharacter.deleteMany()
    await prisma.supportCharacter.deleteMany()
    await prisma.party.deleteMany()
    await prisma.userCharacter.deleteMany()

    // Deleting main tables
    await prisma.user.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.characterState.deleteMany()
    await prisma.medal.deleteMany()
    await prisma.character.deleteMany()

    console.log('Database reseted with success!')

}


async function seedCharacters(charaters: CharacterExcel[]) {

    // Insert into database
    const tags: Set<string> = new Set()


    for (const character of charaters) {
        for (const tag of character.tags.map(t => t.name)) {
            tags.add(tag)
        }

    }

    const tagsArray = Array.from(tags)

    if (tagsArray.filter(t => !(t in CharacterTag)).length > 0) {
        throw new Error('CHAR TAG:: ' + tagsArray.filter(t => !(t in CharacterTag)).join(', ') + ' invalid tags')

    }


}

async function main() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Seed can only be used in development stage')
    }

    // Read json files
    const characters: CharacterExcel[] = JSON.parse(readFileSync(charJSON, 'utf-8'))
    const medals: MedalExcel[] = JSON.parse(readFileSync(medalJSON, 'utf-8'))
    const rankedMedals: MedalExcel[] = JSON.parse(readFileSync(rankedMedalJSON, 'utf-8'))
    const eventMedals: MedalExcel[] = JSON.parse(readFileSync(eventMedalJSON, 'utf-8'))
    const specialMedals: MedalExcel[] = JSON.parse(readFileSync(specialMedalJSON, 'utf-8'))

    // delete all databases
    await resetDatabase()


    // insert characters
    await seedCharacters(characters)


    // insert medals
    //await seedMedals()
    //await seedRankedMedals()
    //await seedEventMedals()

}

main().catch(async (error) => {
    console.error('SEED ERROR:: ' + error)
    // Error as ocurred - disconnect and close process
    await prisma.$disconnect()
    process.exit(1)
}).finally(async () => {
    // Success - disconnect prisma
    await prisma.$disconnect()
})
