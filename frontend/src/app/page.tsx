import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngredientsTable } from "@/components/IngredientsTable";
import { InventoryTable } from "@/components/InventoryTable";
import { PurchaseOrderTable } from "@/components/PurchaseOrderTable";
import { RecipeTable } from "@/components/RecipeTable";

export default function Home() {
  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs defaultValue="recipes" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="purchase_orders">Purchase Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="recipes">
          <RecipeTable />
        </TabsContent>
        <TabsContent value="purchase_orders">
          <PurchaseOrderTable />
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="inventory" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <InventoryTable />
        </TabsContent>
        <TabsContent value="ingredients">
          <IngredientsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
