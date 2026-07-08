import { Router } from 'express';
import { ticketController } from '../controllers/ticket';
import { requireAuth } from '../middlewares/auth';
import { uploadProof } from '../middlewares/upload';

const router = Router();

router.use(requireAuth);

router.post('/', ticketController.createTicket.bind(ticketController));
router.get('/', ticketController.getTickets.bind(ticketController));
router.get('/:id', ticketController.getTicketById.bind(ticketController));

router.put('/:id/resubmit', ticketController.resubmitTicket.bind(ticketController));
router.put('/:id/review', ticketController.reviewTicket.bind(ticketController));
router.put('/:id/proof', uploadProof.single('proof_image'), ticketController.proofTicket.bind(ticketController));
router.put('/:id/confirm', ticketController.confirmTicket.bind(ticketController));

export default router;
