import dbConnect from '../../../lib/dbConnect';
import { userSchema } from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (!session.user.dbName) {
    return res.status(400).json({ message: 'No database name found for user' });
  }
  
  // Get the user's specific database connection
  const dbConnection = await dbConnect(session.user.dbName);
  
  // Create a User model for this specific database connection
  const UserForDb = dbConnection.model('User', userSchema);
  
  if (req.method === 'PUT') {
    try {
      const { settings } = req.body;
      
      const updatedUser = await UserForDb.findOneAndUpdate(
        { email: session.user.email },
        { $set: { settings: { ...session.user.settings, ...settings } } },
        { new: true, runValidators: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ message: 'Settings updated successfully', settings: updatedUser.settings });
    } catch (error) {
      console.error('Error updating user settings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}