import { gql } from "@apollo/client";
import Link from "next/link";

import { getClient } from "@/graphql/ApolloClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const QUERY = gql`
  query InventoryItems {
    inventoryItems {
      id
      ingredient {
        name
        type
        measurement
      }
      quantity
    }
  }
`;

export async function InventoryTable() {
  try {
    const { data, error } = await getClient().query({ query: QUERY });
    return (
      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="px-7">
          <CardTitle>Inventory</CardTitle>
          <CardDescription className="flex justify-between"></CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Ingredient Name
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Ingredient Type
                </TableHead>
                <TableHead className="hidden md:table-cell">Quantity</TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.id}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.ingredient.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.ingredient.type}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.quantity} {item.ingredient.measurement}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/inventory/${item.id}`}>Edit</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  } catch (e) {
    console.log(e);
    return <div>No Data to fetch</div>;
  }
}
