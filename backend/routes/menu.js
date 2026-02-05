import express from 'express';
import Menu from '../models/Menu.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        // Add other filters as needed

        const items = await Menu.find(filters);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add menu item (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newItem = new Menu(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update menu item (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedItem = await Menu.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete menu item (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Menu.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
