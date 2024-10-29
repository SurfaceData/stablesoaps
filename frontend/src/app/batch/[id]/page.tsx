import {gql} from '@apollo/client';
import Image from 'next/image';

import {getClient} from '@/graphql/ApolloClient';
import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Separator} from '@/components/ui/separator';
import {BatchForm} from '@/components/BatchForm';

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
        imagePathSm
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
            notes
          }
          quantity
        }
      }
    }
  }
`;

export default async function BatchPage({params}) {
  const {data, error} = await getClient().query({
    query: QUERY,
    variables: {id: parseInt(params.id)},
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

      <div className="space-y-1">
        <h4 className="text-xl font-medium leading-none">
          Batch Recipe Details
        </h4>
      </div>
      <Separator className="my-1" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Base Oils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {batch.recipe.baseOils.map(oil => (
                <div key={oil.ingredient.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {oil.ingredient.name}
                    </p>
                  </div>
                  <div className="ml-auto space-y-1">
                    <div className="ml-auto font-medium">
                      {((oil.quantity / 100) * batch.amount).toFixed(2)}g
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {oil.quantity}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Essential Oils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {batch.recipe.essentialOils.map(oil => (
                <div key={oil.ingredient.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {oil.ingredient.name}
                    </p>
                    <div className="flex gap-1">
                      {oil.ingredient.notes.map((note, nid) => (
                        <Badge key={`${oil.ingredient.id}-${nid}`}>
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="ml-auto space-y-1">
                    <div className="ml-auto font-medium">
                      {((oil.quantity / 100) * batch.amount).toFixed(2)}g
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {oil.quantity}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-1">
        <h4 className="text-xl font-medium leading-none">Batch Soap labels</h4>
      </div>
      <Separator className="my-1" />

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
                <Image src={label.imagePathSm} width="256" height="256" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
