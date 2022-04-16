// eslint-disable-next-line unused-imports/no-unused-imports
import NextAuth from 'next-auth';

import { User } from '@/utils/models/user.server';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}
