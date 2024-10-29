import {checkAccess, getSession} from '@/lib/auth-check';

export function withAuth<T>(
  Component: React.ComponentType<T>,
  targetRole: string,
  failedPath: string,
) {
  return async function ProtectedPage(props: T) {
    await checkAccess(targetRole, failedPath);
    const session = await getSession();
    return Component({...props, session});
  };
}
