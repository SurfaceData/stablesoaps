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
import {InventoryItemForm} from '@/components/InventoryItemForm';

const QUERY = gql`
  query InventoryItem($id: Int!) {
    inventoryItem(id: $id) {
      id
      ingredient {
        name
        type
        measurement
        costPerUnit
      }
      quantity
    }
  }
`;

export async function InventoryItemEditPage({params}) {
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
            <BreadcrumbPage>Edit Inventory Item</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <InventoryItemForm item={data?.inventoryItem} />
    </div>
  );
}

export default withAuth(InventoryItemEditPage, 'admin', '/');
