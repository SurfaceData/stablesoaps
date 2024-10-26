import { Prisma } from "@prisma/client";

export interface Saponification {
  naoh: number;
  koh: number;
}

export interface Ingredient {
  id: number;
  name: string;
  saponification: Prisma.JsonValue;
  lyeType: string;
}

export interface IngredientWithQuantity {
  quantity: number;
  ingredient: Ingredient;
}
