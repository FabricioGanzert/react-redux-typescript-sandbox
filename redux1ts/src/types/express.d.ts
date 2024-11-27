// src/types/express.d.ts
import { User } from '../models/User'; // Replace with the correct import for your user model if applicable

declare global {
  namespace Express {
    interface Request {
      user?: User; // Define the type of `user` here (it can be any object, e.g., your `User` model)
    }
  }
}
