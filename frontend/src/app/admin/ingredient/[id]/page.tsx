import {gql} from '@apollo/client';

import {withAuth} from '@/lib/withAuth';
import {getClient} from '@/graphql/ApolloClient';
import {EditIngredientForm} from '@/components/EditIngredientForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const QUERY = gql`
  query Ingredient($id: Int!) {
    ingredient(id: $id) {
      id
      name
      slug
      type
      measurement
    }
  }
`;

export async function IngredientEditPage({params}) {
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
            <BreadcrumbPage>Edit Ingredient</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EditIngredientForm ingredient={data?.ingredient} />
    </div>
  );
}

export default withAuth(IngredientEditPage, 'admin', '/');
