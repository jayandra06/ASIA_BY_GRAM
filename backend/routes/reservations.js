import express from 'express';
import Reservation from '../models/Reservation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create reservation (Public)
router.post('/', async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all reservations (Admin only)
router.get('/', verifyToken, async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ date: 1 });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update reservation status (Admin only)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
