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
  query PurchaseOrders {
    purchaseOrders {
      id
      status
      total
      supplierName
      createDate
      receiveDate
      items {
        ingredient {
          id
          name
          measurement
        }
        quantity
        price
      }
    }
  }
`;

export async function PurchaseOrderTable() {
  try {
    const { data, error } = await getClient().query({ query: QUERY });
    return (
      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="px-7">
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription className="flex justify-between">
            <Link href="/purchase-order">
              <Button>New Order</Button>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Total</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Supplier Name
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Create Date
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  Receive Date
                </TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.purchaseOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.id}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.status}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.total}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.supplierName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.createDate}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.receiveDate}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.items
                      .map(({ ingredient }) => ingredient.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/purchase-order/${order.id}`}>Edit</Link>
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
