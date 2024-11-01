import type {Prisma} from '@prisma/client';
import {PrismaClient} from '@prisma/client';
import Sqids from 'sqids';

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
  const sqids = new Sqids();
  try {
    const users = [
      {
        name: 'fozziethebeat',
        email: 'fozziethebeat+admin@gmail.com',
        roles: 'admin',
      },
      {
        name: 'asakusakids',
        email: 'fozziethebeat+tianyi@gmail.com',
        roles: 'admin',
      },
    ];
    const createdUsers = await db.user.createManyAndReturn({
      data: users,
    });

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

    const labels = await db.batchSoapLabel.createManyAndReturn({
      data: labelContents.map(label => ({
        ...label,
        imagePathRg: `${process.env.IMAGE_HOST}${label.imagePathRg}`,
        imagePathMd: `${process.env.IMAGE_HOST}${label.imagePathMd}`,
        imagePathSm: `${process.env.IMAGE_HOST}${label.imagePathSm}`,
      })),
    });

    // Now go through the batch soap labels and some as belonging to the first
    // admin.
    for (const label of labels) {
      const ids = sqids.decode(label.magicCode);
      if (ids[4] !== 6) {
        continue;
      }
      await db.batchSoapLabel.update({
        where: {id: label.id},
        data: {
          ownerId: createdUsers[0].id,
        },
      });
    }
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
