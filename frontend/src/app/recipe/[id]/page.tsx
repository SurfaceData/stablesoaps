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
import { RecipeForm } from "@/components/RecipeForm";

const QUERY = gql`
  query Recipe($id: Int!) {
    recipe(id: $id) {
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
          costPerUnit
          lyeType
        }
        quantity
      }
      baseOils {
        ingredient {
          id
          name
          costPerUnit
          saponification
        }
        quantity
      }
      essentialOils {
        ingredient {
          id
          name
          costPerUnit
          notes
        }
        quantity
      }
    }
  }
`;

export default async function RecipeEditPage({ params }) {
  const { data, error } = await getClient().query({
    query: QUERY,
    variables: { id: parseInt(params.id) },
  });
  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Recipe</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <RecipeForm recipe={data?.recipe} />
    </div>
  );
}
