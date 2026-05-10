import express from 'express';
import { getAllResumes } from '../controllers/adminController';
import { authenticateToken } from '../utils/authMiddleware';
import { isAdmin } from '../utils/adminMiddleware';

const router = express.Router();

// Get all resumes with user data for admin (protected route)
router.get('/resumes', authenticateToken, isAdmin, getAllResumes);

export default router;
