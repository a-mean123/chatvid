import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { db } from './db';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks:       ['state'],
    }),
    GitHub({
      clientId:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      checks:       ['state'],
    }),
  ],
  session:  { strategy: 'jwt' },
  pages:    { signIn: '/projects' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        const adminEmails = (process.env.ADMIN_EMAILS ?? '')
          .split(',').map((e) => e.trim()).filter(Boolean);
        token.role = adminEmails.includes(user.email ?? '')
          ? 'admin'
          : (user.role ?? 'user');
        token.plan = user.plan ?? 'free';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string ?? 'user';
        session.user.plan = token.plan as string ?? 'free';
      }
      return session;
    },
  },
});
