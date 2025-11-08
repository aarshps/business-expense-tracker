import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '../../../lib/dbConnect';
import User, { userSchema } from '../../../models/User';
import { generateDbName, getIdentifierFromProfile, getIdentifierFromSession } from '../../../lib/dbNameUtils';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          googleId: profile.sub // Add Google ID to the user object
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Create database name using the centralized utility
        const identifier = getIdentifierFromProfile(profile);
        const dbName = generateDbName(identifier);

        // Connect to the user's specific database
        const dbConnection = await dbConnect(dbName);

        // Create or get the User model for this specific database connection
        const UserForDb = dbConnection.model('User', userSchema);

        // Check if user already exists in this database
        let dbUser = await UserForDb.findOne({ googleId: profile.sub });

        if (dbUser) {
          // Update user info if needed
          dbUser.name = user.name;
          dbUser.email = user.email;
          dbUser.image = user.image;
          await dbUser.save();
        } else {
          // Create new user in the specific database
          dbUser = await UserForDb.create({
            googleId: profile.sub,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: new Date(),
            dbName: dbName
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        // Get identifier from session user data using the centralized utility
        const identifier = getIdentifierFromSession(session.user);
        const dbName = generateDbName(identifier);

        // Connect to the user's specific database
        const dbConnection = await dbConnect(dbName);

        // Create a User model for this specific database connection
        const UserForDb = dbConnection.model('User', userSchema);

        const dbUser = await UserForDb.findOne({ googleId: token.sub || token.googleId });

        if (dbUser) {
          session.user.id = dbUser._id;
          session.user.googleId = dbUser.googleId;
          session.user.dbName = dbUser.dbName;
          session.user.settings = dbUser.settings;
        }

        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.googleId; // Use sub as the Google ID
        token.googleId = user.googleId;
        token.id = user.id;

        // Generate dbName using the centralized utility
        const identifier = user.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_') : user.googleId;
        const dbName = generateDbName(identifier);
        token.dbName = dbName; // Include dbName in the token
      }
      return token;
    },
    // Add redirect callback to control where users are redirected
    async redirect({ url, baseUrl }) {
      // If the redirect is to the sign-in page, redirect to home instead
      if (url.includes('/auth/') || url.includes('/api/auth/signin')) {
        return `${baseUrl}/`;
      }
      // Allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Prevent other URLs
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);