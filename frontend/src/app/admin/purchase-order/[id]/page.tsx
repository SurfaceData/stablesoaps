import {gql} from '@apollo/client';

import {withAuth} from '@/lib/withAuth';
import {getClient} from '@/graphql/ApolloClient';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {PurchaseOrderForm} from '@/components/PurchaseOrderForm';

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

export async function PurchaseOrderEditPage({params}) {
  const {data, error} = await getClient().query({
    query: QUERY,
    variables: {id: parseInt(params.id)},
  });
  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Root</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Home</BreadcrumbLink>
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

export default withAuth(PurchaseOrderEditPage, 'admin', '/');
