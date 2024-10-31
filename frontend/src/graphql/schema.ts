import {GraphQLJSON, DateTimeResolver} from 'graphql-scalars';
import {gql} from 'graphql-tag';
import slug from 'slug';

import {prisma} from '@/lib/prisma';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type Ingredient {
    id: Int!
    name: String!
    slug: String!
    type: String!
    measurement: String!
    lyeType: String
    saponification: JSON
    notes: [String!]!
    costPerUnit: Float
  }

  type InventoryItem {
    id: Int!
    ingredient: Ingredient!
    ingredientId: Int!
    quantity: Float!
  }

  type IngredientPurchase {
    id: Int!
    ingredient: Ingredient!
    ingredientId: Int!
    quantity: Float!
    price: Float!
  }

  type PurchaseOrder {
    id: Int!
    status: String!
    total: Float!
    supplierName: String!
    createDate: DateTime!
    receiveDate: DateTime
    items: [IngredientPurchase!]!
  }

  type RecipeItem {
    id: Int!
    ingredientId: Int!
    ingredient: Ingredient!
    quantity: Float!
  }

  type Recipe {
    id: Int!
    name: String!
    slug: String!
    originName: String!
    water: RecipeItem!
    lye: RecipeItem!
    essentialOils: [RecipeItem!]!
    baseOils: [RecipeItem!]!
  }

  type Batch {
    id: Int!
    createDate: DateTime!
    recipe: Recipe!
    recipeId: Int!
    amount: Float!
    numBars: Int!
    batchSoapLabel: [BatchSoapLabel!]!
  }

  type BatchSoapLabel {
    id: Int!
    prompt: String!
    magicCode: String!
    imagePathRg: String!
    imagePathMd: String!
    imagePathSm: String!

    recipe: Recipe!
  }

  input IngredientInput {
    name: String!
    slug: String!
    type: String!
    measurement: String!
  }

  input InventoryItemInput {
    quantity: Float!
  }

  input IngredientPurchaseInput {
    ingredientId: Int!
    quantity: Float!
    price: Float!
  }

  input PurchaseOrderInput {
    status: String!
    total: Float!
    supplierName: String!
    items: [IngredientPurchaseInput!]!
  }

  input RecipeItemInput {
    ingredientId: Int!
    quantity: Float!
  }

  input RecipeInput {
    name: String!
    originName: String!
    water: RecipeItemInput!
    lye: RecipeItemInput!
    essentialOils: [RecipeItemInput!]!
    baseOils: [RecipeItemInput!]!
  }

  input BatchInput {
    recipeId: Int!
    amount: Float!
    numBars: Int!
  }

  input UpdateBatchInput {
    numBars: Int
  }

  type Query {
    batch(id: Int!): Batch
    batches: [Batch!]!
    ingredients: [Ingredient!]!
    ingredient(id: Int!): Ingredient
    inventoryItem(id: Int!): InventoryItem
    inventoryItems: [InventoryItem!]!
    purchaseOrders: [PurchaseOrder!]!
    purchaseOrder(id: Int!): PurchaseOrder
    recentBatchSoapLabels(limit: Int): [BatchSoapLabel!]!
    recipes: [Recipe!]!
    recipe(id: Int!): Recipe
  }

  type Mutation {
    addBatch(input: BatchInput!): Batch!
    addIngredient(input: IngredientInput!): Ingredient!
    addPurchaseOrder(input: PurchaseOrderInput!): PurchaseOrder!
    addRecipe(input: RecipeInput!): Recipe!
    updateBatch(id: Int!, input: UpdateBatchInput!): Batch!
    updateIngredient(id: Int!, input: IngredientInput!): Ingredient!
    updateInventoryItem(id: Int!, input: InventoryItemInput!): InventoryItem!
    updatePurchaseOrder(id: Int!, input: PurchaseOrderInput!): PurchaseOrder!
    updateRecipe(id: Int!, input: RecipeInput!): Recipe!
  }
`;

export const resolvers = {
  Query: {
    batch: (a, {id}) => {
      return prisma.batch.findUnique({
        where: {id},
      });
    },

    batches: () => {
      return prisma.batch.findMany();
    },

    ingredient: (a, {id}) => {
      return prisma.ingredient.findUnique({
        where: {id},
      });
    },

    ingredients: () => {
      return prisma.ingredient.findMany();
    },

    inventoryItem: (a, {id}) => {
      return prisma.inventoryItem.findUnique({
        where: {id},
      });
    },

    inventoryItems: async () => {
      const items = await prisma.inventoryItem.findMany();
      return [
        {
          id: 0,
          ingredientId: 1,
          quantity: 1_000_000,
        },
        ...items,
      ];
    },

    purchaseOrders: () => {
      return prisma.purchaseOrder.findMany({
        select: {
          id: true,
          status: true,
          total: true,
          supplierName: true,
          createDate: true,
          receiveDate: true,
          items: true,
        },
      });
    },

    purchaseOrder: (a, {id}) => {
      return prisma.purchaseOrder.findUnique({
        where: {id},
        select: {
          id: true,
          status: true,
          total: true,
          supplierName: true,
          createDate: true,
          receiveDate: true,
          items: true,
        },
      });
    },

    recipe: (a, {id}) => {
      return prisma.recipe.findUnique({
        where: {id},
        select: {
          id: true,
          name: true,
          slug: true,
          originName: true,
          lye: true,
          water: true,
          baseOils: true,
          essentialOils: true,
        },
      });
    },

    recentBatchSoapLabels: (a, {limit}) => {
      return prisma.batchSoapLabel.findMany({
        take: limit || 5,
      });
    },

    recipes: () => {
      return prisma.recipe.findMany();
    },
  },

  Mutation: {
    addBatch: async (a, {input}) => {
      const batch = await prisma.batch.create({
        data: {
          ...input,
          createDate: new Date(),
        },
      });

      const lye = await prisma.recipe
        .findUnique({where: {id: input.recipeId}})
        .lye({
          select: {ingredient: true, ingredientId: true, quantity: true},
        });
      await prisma.inventoryItem.update({
        where: {ingredientId: lye.ingredientId},
        data: {
          quantity: {
            increment: -1 * (lye.quantity / 100) * input.amount,
          },
        },
      });

      const baseOils = await prisma.recipe
        .findUnique({where: {id: input.recipeId}})
        .baseOils({
          select: {ingredient: true, ingredientId: true, quantity: true},
        });
      for (const baseOil of baseOils) {
        const usedAmount = (baseOil.quantity / 100) * input.amount;
        await prisma.inventoryItem.update({
          where: {ingredientId: baseOil.ingredientId},
          data: {
            quantity: {
              increment: -usedAmount,
            },
          },
        });
      }
      const essentialOils = await prisma.recipe
        .findUnique({where: {id: input.recipeId}})
        .essentialOils({
          select: {ingredient: true, ingredientId: true, quantity: true},
        });
      for (const essentialOil of essentialOils) {
        const usedAmount = (essentialOil.quantity / 100) * input.amount;
        await prisma.inventoryItem.update({
          where: {ingredientId: essentialOil.ingredientId},
          data: {
            quantity: {
              increment: -usedAmount,
            },
          },
        });
      }

      return batch;
    },

    addIngredient: (a, {input}) => {
      return prisma.ingredient.create({
        data: input,
      });
    },

    addPurchaseOrder: async (a, {input}) => {
      const {items, status, ...orderData} = input;
      if (status === 'completed') {
        // Create or Update the inventory entry for each item.
        for (const item of items) {
          await prisma.inventoryItem.upsert({
            where: {ingredientId: item.ingredientId},
            create: {
              ingredientId: item.ingredientId,
              quantity: item.quantity,
            },
            update: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }
        orderData.receiveDate = new Date();
      }
      return prisma.purchaseOrder.create({
        data: {
          ...orderData,
          status,
          createDate: new Date(),
          items: {
            create: items,
          },
        },
      });
    },

    addRecipe: (a, {input}) => {
      const {water, lye, baseOils, essentialOils, ...data} = input;
      console.log(water);
      console.log(lye);
      return prisma.recipe.create({
        data: {
          ...data,
          slug: slug(data.name),
          water: {
            create: water,
          },
          lye: {
            create: lye,
          },
          baseOils: {
            create: baseOils,
          },
          essentialOils: {
            create: essentialOils,
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          originName: true,
          lye: true,
          water: true,
          baseOils: true,
          essentialOils: true,
        },
      });
    },

    updateBatch: (a, {id, input}) => {
      console.log(id);
      console.log(input);
      return prisma.batch.update({
        where: {id},
        data: input,
      });
    },

    updateIngredient: (a, {id, input}) => {
      return prisma.ingredient.update({
        where: {id},
        data: input,
      });
    },

    updateInventoryItem: (a, {id, input}) => {
      return prisma.inventoryItem.update({
        where: {id},
        data: input,
      });
    },

    updatePurchaseOrder: async (a, {id, input}) => {
      const {items, status, ...orderData} = input;
      if (status === 'completed') {
        const currentPO = await prisma.purchaseOrder.findUnique({
          where: {id},
          select: {
            status: true,
            items: true,
          },
        });
        if (currentPO.status !== 'completed') {
          // Create or Update the inventory entry for each item.
          for (const item of currentPO.items) {
            await prisma.inventoryItem.upsert({
              where: {ingredientId: item.ingredientId},
              create: {
                ingredientId: item.ingredientId,
                quantity: item.quantity,
              },
              update: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
          orderData.receiveDate = new Date();
        }
      }
      return prisma.purchaseOrder.update({
        where: {
          id,
        },
        data: {
          ...orderData,
          status,
        },
      });
    },

    updateRecipe: (a, {id, input}) => {
      return prisma.recipe.update({
        where: {id},
        data: input,
      });
    },
  },

  Batch: {
    batchSoapLabel: batch => {
      return prisma.batch.findUnique({where: {id: batch.id}}).batchSoapLabel();
    },

    recipe: batch => {
      return prisma.batch.findUnique({where: {id: batch.id}}).recipe();
    },
  },

  DateTime: DateTimeResolver,
  JSON: GraphQLJSON,

  Ingredient: {
    costPerUnit: async ingredient => {
      // First, get all the purchases,
      const {ingredientPurchase} = await prisma.ingredient.findUnique({
        where: {id: ingredient.id},
        select: {ingredientPurchase: true},
      });
      if (ingredientPurchase.length === 0) {
        return 0;
      }
      const totalUnits = ingredientPurchase.reduce(
        (total, {quantity}) => total + quantity,
        0,
      );
      const totalCost = ingredientPurchase.reduce(
        (total, {price}) => total + price,
        0,
      );
      return totalCost / totalUnits;
    },
  },

  IngredientPurchase: {
    ingredient: ip => {
      return prisma.ingredientPurchase
        .findUnique({where: {id: ip.id}})
        .ingredient();
    },
  },

  InventoryItem: {
    ingredient: inventoryItem => {
      if (inventoryItem.id === 0) {
        return prisma.ingredient.findUnique({where: {id: 1}});
      }
      return prisma.inventoryItem
        .findUnique({where: {id: inventoryItem.id}})
        .ingredient();
    },
  },

  BatchSoapLabel: {
    recipe: async label => {
      const {recipe} = await prisma.batchSoapLabel
        .findUnique({where: {id: label.id}})
        .batch({select: {recipe: true}});
      return recipe;
    },
  },

  Recipe: {
    water: recipe => {
      return prisma.recipe.findUnique({where: {id: recipe.id}}).water({
        select: {ingredient: true, ingredientId: true, quantity: true},
      });
    },
    lye: recipe => {
      return prisma.recipe.findUnique({where: {id: recipe.id}}).lye({
        select: {ingredient: true, ingredientId: true, quantity: true},
      });
    },
    baseOils: recipe => {
      return prisma.recipe.findUnique({where: {id: recipe.id}}).baseOils({
        select: {ingredient: true, ingredientId: true, quantity: true},
      });
    },
    essentialOils: recipe => {
      return prisma.recipe.findUnique({where: {id: recipe.id}}).essentialOils({
        select: {ingredient: true, ingredientId: true, quantity: true},
      });
    },
  },
};
