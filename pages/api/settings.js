import { connectDB } from '../../lib/mongodb'
import UserSettings from '../../models/UserSettings'

export default async function handler(req, res) {
  await connectDB()

  // Use a default user ID for now (in a real app, this would come from authentication)
  const userId = 'default_user'

  if (req.method === 'GET') {
    try {
      // Find or create user settings
      let userSettings = await UserSettings.findOne({ userId })
      
      if (!userSettings) {
        // Create default settings if they don't exist
        userSettings = await UserSettings.create({
          userId,
          currency: {
            code: 'USD',
            symbol: '$',
            name: 'US Dollar'
          }
        })
      }
      
      res.status(200).json(userSettings)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const { currency, theme, language } = req.body
      
      // Find or create user settings
      let userSettings = await UserSettings.findOne({ userId })
      
      if (userSettings) {
        // Update existing settings
        userSettings = await UserSettings.findOneAndUpdate(
          { userId },
          { 
            currency: currency || userSettings.currency,
            theme: theme || userSettings.theme,
            language: language || userSettings.language
          },
          { new: true, upsert: true }
        )
      } else {
        // Create new settings
        userSettings = await UserSettings.create({
          userId,
          currency: currency || {
            code: 'USD',
            symbol: '$',
            name: 'US Dollar'
          },
          theme: theme || 'light',
          language: language || 'en'
        })
      }
      
      res.status(200).json(userSettings)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}