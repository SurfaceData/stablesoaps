import { DateTimeResolver } from "graphql-scalars";
import { gql } from "graphql-tag";

import { prisma } from "@/lib/prisma";

export const typeDefs = gql`
  scalar DateTime

  type Ingredient {
    id: Int!
    name: String!
    slug: String!
    type: String!
    measurement: String!
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

  type Query {
    ingredients: [Ingredient!]!
    ingredient(id: Int!): Ingredient
    inventoryItem(id: Int!): InventoryItem
    inventoryItems: [InventoryItem!]!
    purchaseOrders: [PurchaseOrder!]!
    purchaseOrder(id: Int!): PurchaseOrder
  }

  type Mutation {
    addIngredient(input: IngredientInput!): Ingredient!
    addPurchaseOrder(input: PurchaseOrderInput!): PurchaseOrder!
    updateIngredient(id: Int!, input: IngredientInput!): Ingredient!
    updateInventoryItem(id: Int!, input: InventoryItemInput!): InventoryItem!
    updatePurchaseOrder(id: Int!, input: PurchaseOrderInput!): PurchaseOrder!
  }
`;

export const resolvers = {
  Query: {
    ingredient: (a, { id }) => {
      return prisma.ingredient.findUnique({
        where: { id },
      });
    },

    ingredients: () => {
      return prisma.ingredient.findMany();
    },

    inventoryItem: (a, { id }) => {
      return prisma.inventoryItem.findUnique({
        where: { id },
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

    purchaseOrder: (a, { id }) => {
      return prisma.purchaseOrder.findUnique({
        where: { id },
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
  },

  Mutation: {
    addIngredient: (a, { input }) => {
      return prisma.ingredient.create({
        data: input,
      });
    },

    addPurchaseOrder: async (a, { input }) => {
      const { items, status, ...orderData } = input;
      if (status === "completed") {
        // Create or Update the inventory entry for each item.
        for (const item of items) {
          await prisma.inventoryItem.upsert({
            where: { ingredientId: item.ingredientId },
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

    updateIngredient: (a, { id, input }) => {
      return prisma.ingredient.update({
        where: { id },
        data: input,
      });
    },

    updatePurchaseOrder: async (a, { id, input }) => {
      const { items, status, ...orderData } = input;
      if (status === "completed") {
        const currentPO = await prisma.purchaseOrder.findUnique({
          where: { id },
          select: {
            status: true,
            items: true,
          },
        });
        if (currentPO.status !== "completed") {
          // Create or Update the inventory entry for each item.
          for (const item of currentPO.items) {
            await prisma.inventoryItem.upsert({
              where: { ingredientId: item.ingredientId },
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
  },

  DateTime: DateTimeResolver,
  IngredientPurchase: {
    ingredient: (ip) => {
      return prisma.ingredientPurchase
        .findUnique({ where: { id: ip.id } })
        .ingredient();
    },
  },

  InventoryItem: {
    ingredient: (inventoryItem) => {
      if (inventoryItem.id === 0) {
        return prisma.ingredient.findUnique({ where: { id: 1 } });
      }
      return prisma.inventoryItem
        .findUnique({ where: { id: inventoryItem.id } })
        .ingredient();
    },
  },
};
