import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: String,
  emailVerified: {
    type: Date,
    default: null
  },
  dbName: {
    type: String,
    required: true
  },
  settings: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: 'light'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export { userSchema };
export default User;