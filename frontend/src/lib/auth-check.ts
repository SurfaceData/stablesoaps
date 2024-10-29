import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function checkAccess(targetRole: string, failedPath: string) {
  const session = await auth();
  if (!session) {
    redirect(failedPath);
  }
  if (targetRole !== "" && session?.user?.roles !== targetRole) {
    redirect(failedPath);
  }
}

export async function getSession() {
  return await auth();
}
