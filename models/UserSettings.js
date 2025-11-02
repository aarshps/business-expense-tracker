import mongoose from 'mongoose'

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // Each user should have only one settings document
    default: 'default_user' // For now, using a default user ID
  },
  currency: {
    code: {
      type: String,
      required: true,
      default: 'USD'
    },
    symbol: {
      type: String,
      required: true,
      default: '$'
    },
    name: {
      type: String,
      required: true,
      default: 'US Dollar'
    }
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  language: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
})

// Update the updatedAt field before saving
userSettingsSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() })
})

// Ensure the schema is compiled only once in development
export default mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema)