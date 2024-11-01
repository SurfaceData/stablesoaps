import {gql} from '@apollo/client';
import Image from 'next/image';

import {auth, signOut} from '@/lib/auth';
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
import {Separator} from '@/components/ui/separator';

const QUERY = gql`
  query UserSoaps {
    userSoaps {
      id
      prompt
      magicCode
      imagePathMd
      availability
      recipe {
        name
      }
    }
  }
`;

export async function UserSoapsGrid() {
  const session = await auth();
  if (!session) {
    return <div>Not signed in</div>;
  }
  const {data, error} = await getClient().query({query: QUERY});
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-xl font-medium leading-none">Your Soaps</h4>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.userSoaps.map(label => (
          <Card key={label.id} className="w-[360px]">
            <CardHeader className="px-7">
              <CardTitle>{label.recipe.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 items-center justify-center p-6">
              <Badge>{label.magicCode}</Badge>
              <Image
                alt={label.prompt}
                src={label.imagePathMd}
                width="512"
                height="512"
              />
              <div>{label.prompt}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
