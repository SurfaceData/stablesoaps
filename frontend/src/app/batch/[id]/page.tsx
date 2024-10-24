import { gql } from "@apollo/client";
import Image from "next/image";

import { getClient } from "@/graphql/ApolloClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      batchSoapLabel {
        id
        prompt
        magicCode
        imagePath
      }
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

export default async function BatchPage({ params }) {
  const { data, error } = await getClient().query({
    query: QUERY,
    variables: { id: parseInt(params.id) },
  });
  const batch = data.batch;
  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Batch {params.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {batch.batchSoapLabel.map((label, idx) => (
          <Card key={label.id} className="w-[360px]">
            <CardHeader className="px-7">
              <CardTitle>{label.magicCode}</CardTitle>
              <CardDescription className="flex justify-between">
                {label.prompt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Image
                  src={`/img/${label.magicCode}.png`}
                  width="256"
                  height="256"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
