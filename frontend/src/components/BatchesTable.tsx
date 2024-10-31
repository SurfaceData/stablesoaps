import {gql} from '@apollo/client';
import Link from 'next/link';

import {getClient} from '@/graphql/ApolloClient';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const QUERY = gql`
  query Batches {
    batches {
      id
      createDate
      amount
      numBars
      recipe {
        name
        lye {
          quantity
          ingredient {
            costPerUnit
          }
        }
        baseOils {
          quantity
          ingredient {
            costPerUnit
          }
        }
        essentialOils {
          quantity
          ingredient {
            costPerUnit
          }
        }
      }
    }
  }
`;

export async function BatchesTable() {
  try {
    const {data, error} = await getClient().query({query: QUERY});
    const costPer100 = recipe => {
      const {baseOils, essentialOils} = recipe;
      const baseCost = baseOils
        .map(({ingredient, quantity}) => quantity * ingredient.costPerUnit)
        .reduce((acc, cost) => acc + cost, 0.0);
      const essentialCost = essentialOils
        .map(({ingredient, quantity}) => quantity * ingredient.costPerUnit)
        .reduce((acc, cost) => acc + cost, 0.0);
      return baseCost + essentialCost;
    };
    const costPerBatch = batch => {
      return (costPer100(batch.recipe) * batch.amount) / 100 / batch.numBars;
    };
    return (
      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="px-7">
          <CardTitle>Batches</CardTitle>
          <CardDescription className="flex justify-between">
            <Link href="/admin/batch">
              <Button>New Batch</Button>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Recipe Name
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Created Date
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Amount (g)
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Cost Per Bar($)
                </TableHead>
                <TableHead className="hidden sm:table-cell">Num Bars</TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.batches.map(batch => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div className="font-medium">{batch.id}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {batch.recipe.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {batch.createDate}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {batch.amount}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {costPerBatch(batch).toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {batch.numBars}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/admin/batch/${batch.id}`}>View</Link>
                    <Link href={`/admin/batch/${batch.id}/edit`}>Edit</Link>
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
