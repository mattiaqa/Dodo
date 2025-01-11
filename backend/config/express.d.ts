import 'express'; // Importa i tipi originali di Express
// Tipizzazione dell'utente
interface CurrentUserType {
    id: string;
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
