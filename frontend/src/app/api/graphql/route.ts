import { cookies, headers } from "next/headers";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

import { typeDefs, resolvers } from "@/graphql/schema";
import { prisma } from "@/lib/prisma";

function getToken() {
  const cookieStore = cookies();
  const cookieToken =
    cookieStore.get("__Secure-next-auth.session-token") ??
    cookieStore.get("authjs.session-token");
  if (cookieToken) {
    return cookieToken.value;
  }
  const headersList = headers();
  const authHeader = headersList.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }
  return authHeader.substring(7);
}

const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler(server, {
  /*
  context: async (req) => {
    const token = getToken();
    if (!token) {
      return { req };
    }
    // Extract the user token so we can fetch the session.  This ensures
    // graphql resolvers can validate against the current user.
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      select: { user: true },
    });

    return {
      req,
      user: session?.user,
    };
  },
 */
});

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
