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
  }

  input IngredientInput {
    name: String!
    slug: String!
    type: String!
  }

  type Query {
    ingredients: [Ingredient!]!
    ingredient(id: Int!): Ingredient
  }

  type Mutation {
    addIngredient(input: IngredientInput!): Ingredient!
    updateIngredient(id: Int!, input: IngredientInput!): Ingredient!
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
  },

  Mutation: {
    addIngredient: (a, { input }) => {
      return prisma.ingredient.create({
        data: input,
      });
    },

    updateIngredient: (a, { id, input }) => {
      return prisma.ingredient.update({
        where: { id },
        data: input,
      });
    },
  },

  DateTime: DateTimeResolver,
};
