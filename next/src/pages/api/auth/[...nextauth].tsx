import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { getUserByEmail, verifyLogin } from '@/utils/models/user.server';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      async profile(profile) {
        if (!profile) {
          return null;
        }

        const user = await getUserByEmail(profile.email);

        console.log('logged in oauth', user);

        if (user) {
          return user;
        }

        return profile;
      },
    }),
    CredentialsProvider({
      name: 'Log in',
      credentials: {
        username: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const user = await verifyLogin(
          credentials.username,
          credentials.password
        );

        console.log('logged in', user);

        if (user) {
          return user;
        }

        return null;
      },
    }),
  ],
  theme: {
    colorScheme: 'light',
  },
  callbacks: {
    // async signIn({ profile }) {
    //   console.log('signin', profile);
    //   if (profile?.email) {
    //     const user = await getUserByEmail(profile.email);
    //     console.log('signin user', user);
    //     if (user) {
    //       return true;
    //     }
    //   }
    //   console.log('signin', 'unauthorized');
    //   return 'unauthorized';
    // },
    async jwt({ token, user }) {
      console.log('jwt', token, user);
      if (user) {
        // eslint-disable-next-line no-param-reassign
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      session.user = token.user;
      console.log('session', session, token);
      return session;
    },
  },
});
