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
  query Recipes {
    recipes {
      id
      name
      slug
      originName
      water {
        ingredient {
          id
          name
        }
        quantity
      }
      lye {
        ingredient {
          id
          name
        }
        quantity
      }
      baseOils {
        ingredient {
          id
          name
        }
        quantity
      }
      essentialOils {
        ingredient {
          id
          name
        }
        quantity
      }
    }
  }
`;

export async function RecipeTable() {
  try {
    const { data, error } = await getClient().query({ query: QUERY });
    return (
      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="px-7">
          <CardTitle>Soap Recipes</CardTitle>
          <CardDescription className="flex justify-between">
            <Link href="/recipe">
              <Button>New Recipe</Button>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="hidden sm:table-cell">Name</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Origin Name
                </TableHead>
                <TableHead className="hidden md:table-cell">Water %</TableHead>
                <TableHead className="hidden md:table-cell">Lye %</TableHead>
                <TableHead className="hidden md:table-cell">
                  Base Oils
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Essential Oils
                </TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div className="font-medium">{recipe.id}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {recipe.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {recipe.originName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {recipe.water.quantity}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {recipe.lye.quantity}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {recipe.baseOils
                      .map(({ ingredient }) => ingredient.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {recipe.essentialOils
                      .map(({ ingredient }) => ingredient.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/recipe/${recipe.id}`}>Edit</Link>
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
