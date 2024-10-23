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
        status: "completed",
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
            {
              ingredientId: 3,
              quantity: 3628,
              price: 34.56,
            },
            {
              ingredientId: 4,
              quantity: 3628,
              price: 44.56,
            },
            {
              ingredientId: 5,
              quantity: 453.592,
              price: 12.0,
            },
            {
              ingredientId: 6,
              quantity: 453.592,
              price: 22.0,
            },
            {
              ingredientId: 7,
              quantity: 15,
              price: 7.0,
            },
            {
              ingredientId: 8,
              quantity: 15,
              price: 7.0,
            },
            {
              ingredientId: 9,
              quantity: 15,
              price: 8.0,
            },
            {
              ingredientId: 10,
              quantity: 900,
              price: 19.5,
            },
          ],
        },
      },
    });

    await db.inventoryItem.createMany({
      data: [
        {
          ingredientId: 2,
          quantity: 3175,
        },
        {
          ingredientId: 3,
          quantity: 3628,
        },
        {
          ingredientId: 4,
          quantity: 3628,
        },
        {
          ingredientId: 5,
          quantity: 453.592,
        },
        {
          ingredientId: 6,
          quantity: 453.592,
        },
        {
          ingredientId: 7,
          quantity: 15,
        },
        {
          ingredientId: 8,
          quantity: 15,
        },
        {
          ingredientId: 9,
          quantity: 15,
        },
        {
          ingredientId: 10,
          quantity: 900,
        },
      ],
    });
    await db.recipe.create({
      data: {
        name: "Old Faithful - Rose & Hinoki",
        slug: "old_faithful_rose_hinoki",
        originName: "Berry Bramble",
        water: {
          create: {
            ingredientId: 1,
            quantity: 32,
          },
        },
        lye: {
          create: {
            ingredientId: 10,
            quantity: 14,
          },
        },
        baseOils: {
          create: [
            {
              ingredientId: 2,
              quantity: 32,
            },
            {
              ingredientId: 3,
              quantity: 32,
            },
            {
              ingredientId: 4,
              quantity: 32,
            },
            {
              ingredientId: 5,
              quantity: 4,
            },
          ],
        },
        essentialOils: {
          create: [
            {
              ingredientId: 7,
              quantity: 1.4,
            },
            {
              ingredientId: 8,
              quantity: 1.4,
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
