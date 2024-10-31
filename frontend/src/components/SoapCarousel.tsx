import {gql} from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';

import {getClient} from '@/graphql/ApolloClient';

import {Button} from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const QUERY = gql`
  query RecentBatchSoapLabels {
    recentBatchSoapLabels {
      id
      prompt
      imagePathMd
      recipe {
        name
      }
    }
  }
`;

export async function SoapCarousel() {
  try {
    const {data, error} = await getClient().query({query: QUERY});
    return (
      <Carousel className="w-full mx-24">
        <CarouselContent className="-ml-1">
          {data.recentBatchSoapLabels.map(label => (
            <CarouselItem key={label.id} className="pl-1 basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Image
                      alt={label.prompt}
                      src={label.imagePathMd}
                      width="512"
                      height="512"
                    />
                    <div>{label.recipe.name}</div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  } catch (e) {
    console.log(e);
    return <div>No Data to fetch</div>;
  }
}
