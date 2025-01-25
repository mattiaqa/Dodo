import 'express';

interface CurrentUserType {
    id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    verified: boolean;
    isAdmin: boolean;
    session: string;
}
  
declare global {
  namespace Express {
    interface Locals {
      user?: CurrentUserType; // Aggiungi `user` con il tuo tipo personalizzato
    }
  }
}
