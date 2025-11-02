import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user info to token on initial sign in
      if (account && user) {
        token.id = user?.id;
        token.name = user?.name;
        token.email = user?.email;
        token.picture = user?.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for session handling
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin", // Custom sign in page
  },
  // Add debug logging in development
  debug: process.env.NODE_ENV === "development",
});

export const { GET, POST } = handler;