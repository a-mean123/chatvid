import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const authConfig = {
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/projects' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: { user?: unknown } | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname.startsWith('/editor') && !isLoggedIn) {
        return Response.redirect(new URL('/projects', nextUrl));
      }
      if (pathname.startsWith('/admin') && !isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
