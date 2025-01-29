import express from 'express';
import  requireUser  from '../../middleware/requireUser';
import * as Controller from '../../controller/book.controller';
import * as Validator from '../../middleware/validateResource';
import { addBookSchema, createBookSchema, searchBookSchema } from '../../schema/book.schema';
import requireAdmin from '../../middleware/requireAdmin';
import { searchBook, searchBookOnline } from '../../service/book.service';

const router = express.Router();

// router.get('/info', requireUser, Controller.getBookInfoHandler);
router.delete('/:isbn', requireAdmin, Controller.deleteBookHandler);

router.get("/search/local/", requireUser, Validator.validateQuery(searchBookSchema), (req, res) => Controller.searchBookHandler(req, res, searchBook));
router.get("/search/online/", requireUser, Validator.validateQuery(searchBookSchema), (req, res) => Controller.searchBookHandler(req, res, searchBookOnline))
router.post("/serializeBook", requireUser, Validator.validateBody(createBookSchema), Controller.serializeBookHandler);
router.post('/add', requireUser, Validator.validateBody(createBookSchema), Controller.addBookHandler);

export default router;