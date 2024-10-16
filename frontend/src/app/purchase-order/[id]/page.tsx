import { gql } from "@apollo/client";
import { getClient } from "@/graphql/ApolloClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";

const QUERY = gql`
  query PurchaseOrder($id: Int!) {
    purchaseOrder(id: $id) {
      id
      status
      total
      supplierName
      items {
        ingredientId
        quantity
        price
      }
    }
  }
`;

export default async function IngredientEditPage({ params }) {
  const { data, error } = await getClient().query({
    query: QUERY,
    variables: { id: parseInt(params.id) },
  });
  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Purchase Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PurchaseOrderForm order={data?.purchaseOrder} />
    </div>
  );
}
