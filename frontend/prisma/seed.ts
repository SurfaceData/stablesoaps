import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function devSeed() {
  try {
    const ingredients: Prisma.IngredientCreateInput[] = [
      {
        name: "Water",
        slug: "water",
        type: "water",
        measurement: "grams",
      },
      {
        name: "Olive Oil",
        slug: "olive_oil",
        type: "base_oil",
        measurement: "grams",
      },
      {
        name: "Coconut Oil",
        slug: "coconut_oil",
        type: "base_oil",
        measurement: "grams",
      },
      {
        name: "Palm Oil",
        slug: "palm_oil",
        type: "base_oil",
        measurement: "grams",
      },
      {
        name: "Castor Oil",
        slug: "castor_oil",
        type: "base_oil",
        measurement: "grams",
      },
      {
        name: "Avocado Oil",
        slug: "avocado_oil",
        type: "base_oil",
        measurement: "grams",
      },
      {
        name: "Hinoki EO",
        slug: "hinoki_eo",
        type: "essential_oil",
        measurement: "grams",
      },
      {
        name: "Rose EO",
        slug: "rose_eo",
        type: "essential_oil",
        measurement: "milliliters",
      },
      {
        name: "Geranium EO",
        slug: "geranium_eo",
        type: "essential_oil",
        measurement: "milliliters",
      },
      {
        name: "Sodium Hydroxide",
        slug: "sodium_hydroxide",
        type: "lye",
        measurement: "grams",
      },
    ];
    const createdIngredients = await db.ingredient.createManyAndReturn({
      data: ingredients,
    });

    await db.purchaseOrder.create({
      data: {
        status: "complete",
        createDate: "2024-10-19T08:00:00.000+09:00",
        receiveDate: "2024-12-19T08:00:00.000+09:00",
        total: 30.0,
        supplierName: "Wholesale Supplies Plus",
        items: {
          create: [
            {
              ingredientId: 2,
              quantity: 3175,
              price: 24.56,
            },
          ],
        },
      },
    });
  } catch (error) {
    console.warn("Please define your seed data.");
    console.error(error);
  }
}

async function main() {
  await devSeed();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
