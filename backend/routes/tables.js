import express from 'express';
import Table from '../models/Table.js';

const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find().sort({ number: 1 });
        res.json(tables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Generate tables
router.post('/generate', async (req, res) => {
    const { count } = req.body;

    if (!count || count < 1) {
        return res.status(400).json({ message: "Invalid table count" });
    }

    try {
        // Clear existing tables
        await Table.deleteMany({});

        const tables = [];
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Fallback to local Vite default

        for (let i = 1; i <= count; i++) {
            tables.push({
                number: i,
                url: `${baseUrl}/menu?table=${i}`
            });
        }

        const newTables = await Table.insertMany(tables);
        res.status(201).json(newTables);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a specific table by number
router.delete('/:number', async (req, res) => {
    try {
        const result = await Table.findOneAndDelete({ number: req.params.number });
        if (result) {
            res.json({ message: "Table deleted" });
        } else {
            res.status(404).json({ message: "Table not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
