import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import { getIdentifierFromSession, generateDbName } from '../../../lib/dbNameUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    console.log('Session in API route:', session);

    // Get identifier from session user data using the centralized utility
    const identifier = getIdentifierFromSession(session.user);
    const dbName = generateDbName(identifier);
    
    console.log('Generated DB name from session in API:', dbName);
    
    return res.status(200).json({ dbName });
  } catch (error) {
    console.error('Error fetching database name:', error);
    return res.status(500).json({ message: 'Error fetching database name' });
  }
}