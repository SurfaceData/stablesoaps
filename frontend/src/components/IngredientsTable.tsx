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
  query Ingredients {
    ingredients {
      id
      name
      slug
      type
      measurement
      costPerUnit
    }
  }
`;

export async function IngredientsTable() {
  try {
    const { data, error } = await getClient().query({ query: QUERY });
    return (
      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="px-7">
          <CardTitle>Ingredients</CardTitle>
          <CardDescription className="flex justify-between">
            Soap Making Ingredients
            <Link href="/ingredient">
              <Button>New Ingredient</Button>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="hidden sm:table-cell">Name</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">
                  Measurement
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Cost Per Unit ($)
                </TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <div className="font-medium">{ingredient.id}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {ingredient.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {ingredient.type}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {ingredient.measurement}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {ingredient.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/ingredient/${ingredient.id}`}>Edit</Link>
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
