'use client';

import { MENTOR_ROLES } from '../../../lib/roles';
import withAuth from '../../HOCs/WithAuth';

function MentorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(MentorLayout, { roles: MENTOR_ROLES });
