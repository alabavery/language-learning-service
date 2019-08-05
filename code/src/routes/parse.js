import express from 'express';
import ParseController from '../controllers/parseController';

const router = express.Router();

router.post('/', ParseController.saveParseData);
router.get('/', ParseController.getResolveDataForAudio);

export default router;