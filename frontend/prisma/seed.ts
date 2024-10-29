import type {Prisma} from '@prisma/client';
import {PrismaClient} from '@prisma/client';

import baseOils from '../data/base_oils.json';
import essentialOils from '../data/essential_oils.json';
import purchaseOrders from '../data/purchase_orders.json';
import recipes from '../data/recipes.json';
import labelScenePrompts from '../data/label_scene_prompts.json';
import labelStyles from '../data/label_styles.json';
import batches from '../data/batches.json';
import labelContents from '../data/label_contents.json';

const db = new PrismaClient();

async function devSeed() {
  try {
    const ingredients = [
      {
        id: 1,
        name: 'Water',
        slug: 'water',
        type: 'water',
        measurement: 'grams',
      },
      {
        id: 2,
        name: 'Sodium Hydroxide',
        slug: 'sodium_hydroxide',
        type: 'lye',
        measurement: 'grams',
        lyeType: 'naoh',
      },
      ...baseOils,
      ...essentialOils,
    ];
    const createdIngredients = await db.ingredient.createManyAndReturn({
      data: ingredients,
    });

    for (const po of purchaseOrders) {
      await db.purchaseOrder.create({
        data: po,
      });
      const inventoryData = po['items']['create'];
      for (const inventoryItem of inventoryData) {
        const {ingredientId, quantity} = inventoryItem;
        await db.inventoryItem.upsert({
          where: {ingredientId},
          create: {
            ingredientId,
            quantity,
          },
          update: {
            quantity: {
              increment: quantity,
            },
          },
        });
      }
    }

    for (const recipe of recipes) {
      await db.recipe.create({
        data: recipe,
      });
    }

    await db.labelScenePrompt.createMany({
      data: labelScenePrompts,
    });

    await db.labelStyle.createMany({
      data: labelStyles,
    });

    await db.batch.createMany({
      data: batches,
    });

    await db.batchSoapLabel.createMany({
      data: labelContents,
    });
  } catch (error) {
    console.warn('Please define your seed data.');
    console.error(error);
  }
}

async function main() {
  await devSeed();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
