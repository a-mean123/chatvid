import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: authConfig.providers,
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
