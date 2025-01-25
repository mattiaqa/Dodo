import { Request, Response, NextFunction } from 'express';
import { getAuctionById } from '../service/auction.service';
import { ObjectId, Types } from 'mongoose';
import { z } from 'zod';
import { getAuctionSchema } from '../schema/auction.schema';

const requireAuctionOwnerOrAdmin = async (req: Request<z.infer<typeof getAuctionSchema>>, res: Response, next: NextFunction) => {
  try {

    const user = res.locals.user;
    if(!user)
    {
        res.status(403).send({ message: 'You are not logged in'});
        return;
    }
    const { auctionId } = req.params;

    // Recupera i dettagli dell'asta
    const auction = await getAuctionById(auctionId);

    if (!auction) {
      res.status(404).json({ message: 'Auction not found' });
      return;
    }
    
    if (!auction.seller) {
        res.status(404).json({ message: 'Error getting the seller' });
        return;
    }

    const owner = auction.seller;
    // Verifica se l'utente è il proprietario dell'asta o un amministratore
    if (owner._id.toString() !==  user.id && !user.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Not authorized to modify this auction' });
      return;
    }

    // L'utente è autorizzato
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default requireAuctionOwnerOrAdmin;
