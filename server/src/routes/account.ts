import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { accountController } from '../controllers/account';

const router = Router();

router.use(requireAuth);

router.get('/', accountController.getAccounts.bind(accountController));
router.get('/:id', accountController.getAccountById.bind(accountController));
router.put('/:id', accountController.updateAccount.bind(accountController));
router.put('/:id/status', accountController.updateStatus.bind(accountController));
router.put('/:id/admin-reset-password', accountController.adminResetPassword.bind(accountController));
router.delete('/:id', accountController.deleteAccount.bind(accountController));

export default router;
