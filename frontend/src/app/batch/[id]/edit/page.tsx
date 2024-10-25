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
import { BatchForm } from "@/components/BatchForm";

const QUERY = gql`
  query batch($id: Int!) {
    batch(id: $id) {
      id
      createDate
      amount
      numBars
      recipe {
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
          }
          quantity
        }
        baseOils {
          ingredient {
            id
            name
            costPerUnit
          }
          quantity
        }
        essentialOils {
          ingredient {
            id
            name
            costPerUnit
          }
          quantity
        }
      }
    }
  }
`;

export default async function EditBatchPage({ params }) {
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
            <BreadcrumbLink href={`/batch/${params.id}`}>
              Batch {params.id}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Batch</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <BatchForm batch={data?.batch} />
    </div>
  );
}
