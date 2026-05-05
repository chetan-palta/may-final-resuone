import express from 'express';
import {
	register,
	login,
	getSession,
	logout,
	googleAuthInitiate,
	googleAuthCallback
} from '../controllers/authController';
import { authenticateToken } from '../utils/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/session', authenticateToken, getSession);
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);

export default router;
