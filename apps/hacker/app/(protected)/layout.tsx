'use client';

import withAuth from '../HOCs/WithAuth';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(ProtectedLayout);
