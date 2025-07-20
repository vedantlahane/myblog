import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';


//Interface for User Document, Document is a mongoose interface that represents a document in the database, it extendes mongoose.Document, which provides properties and methods for interacting with the document in the databse, Interface is used to define the structure of the user document, including the fields and their types, as well as methods for comparing passwords and converting to a safe object, safe object is used to remove sensitive information like password when returning the user document
export interface IUser {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  isAdmin: boolean;
  isVerified: boolean;
  savedPosts: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}


//here we are extending the IUser interface with Document to create a new interface IUserDocument, which represents a user document in the database, this interface includes all the fields from IUser as well as methods for comparing passwords and coonverting to a safe object, the Document interface provides properties and methods for interacting with the document in the database, such as _id, save(), remove(), etc., this allows us to use mongoose methods on the user document while still having type safety for our custom fields and methods

//comparePassword method is used to compare the candidate password with the hashed password stored in the database, it returns a promise that resolves to a boolean indicating whether the passwords match, toSafeObject method is used to return a safe version of the user document, excluding sensitive information like the password, Partial<IUserDocument> is used to indicate that the returned object may not contain all fields of IUserDocument, allowing for flexibility in the returned object structure
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Partial<IUserDocument>;
}
// IUserModel interface extends mongoose Model and includes a static method for finding a user by email, this allows us to define custom methods that can be called on the User model, such as findByEmail, which returns a promise that resolves to a user document or null if no user is found with the given email, this is useful for encapsulating database queries related to users within the model itself, providing a clean and organized way to interact with user data in the database
interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}


// Mongoose schema for User, this defines the structure of the user document in the database, including field types, validation rules, and default values, it also includes indexes for better query performance and middleware for password hashing
const userSchema = new Schema<IUserDocument>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Please provide a valid email'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: (password: string) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    },
    select: false
  },
  avatarUrl: { 
    type: String,
    validate: {
      validator: (url: string) => !url || /^https?:\/\/.+/.test(url),
      message: 'Please provide a valid URL'
    }
  },
  bio: { 
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

// Indexes for better query performance
userSchema.index({ name: 'text' });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ isAdmin: 1, isVerified: 1 });

// Configure virtuals to appear in JSON
// virtuals are properties that are not stored in the database but can be computed from the document's data, here we are using virtuals to get the ollower and following counts, .set method is used to configure the schema to include virtuals when converting to JSON or an object
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Password hashing middleware
userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.toSafeObject = function(): Partial<IUserDocument> {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Static methods
userSchema.statics.findByEmail = async function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for follower count
// so here we are creating virtual properties for the number of followers and following, these 
userSchema.virtual('followerCount').get(function() {
  return this.followers?.length || 0;
});

userSchema.virtual('followingCount').get(function() {
  return this.following?.length || 0;
});

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
