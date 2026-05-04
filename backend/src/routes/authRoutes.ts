import express from "express";
import { googleLogin, googleAuthInitiate, googleAuthCallback, register, login, getSession, logout } from '../controllers/authController';
import { authenticateToken } from '../utils/authMiddleware';

const router = express.Router();

router.get("/google", googleAuthInitiate);
router.get("/google/callback", googleAuthCallback);

router.post('/register', register);
router.post('/login', login);
router.get('/session', authenticateToken, getSession);
router.post('/logout', logout);

export default router;
