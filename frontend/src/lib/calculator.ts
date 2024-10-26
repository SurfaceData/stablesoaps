import { Ingredient, IngredientWithQuantity } from "@/types";
import { Prisma } from "@prisma/client";

function calculateLye(
  superfat: number,
  lye: Ingredient,
  baseOilIngredients: IngredientWithQuantity[]
) {
  const discount = (100 - superfat) / 100.0;
  const lyeType = lye.lyeType || "naoh";
  const lyePercent = baseOilIngredients
    .map((oil) => {
      const saponificationChart = oil.ingredient
        .saponification as Prisma.JsonObject;
      const saponification = saponificationChart[lyeType] as number;
      return saponification * oil.quantity * discount;
    })
    .reduce((acc, v) => acc + v, 0.0);
  return lyePercent;
}

function calculateWater(lyePercent: number, waterRatio: number) {
  return lyePercent * waterRatio;
}

export { calculateLye, calculateWater };
