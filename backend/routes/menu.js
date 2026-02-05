import express from 'express';
import Menu from '../models/Menu.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
import multer from 'multer';
import * as XLSX from 'xlsx';

const upload = multer({ storage: multer.memoryStorage() });

// Bulk Upload via Excel (Admin only)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Excel sheet is empty' });
        }

        let updatedCount = 0;
        let createdCount = 0;
        const errors = [];

        for (const item of data) {
            // Basic validation
            if (!item.name || !item.price || !item.category) {
                errors.push(`Skipping item "${item.name || 'Unknown'}": Missing required fields`);
                continue;
            }

            // Ensure ID exists for upsert, or generate one if creating new without ID
            const filter = item.id ? { id: item.id } : { name: item.name }; // Fallback to name if no ID for duplicate check

            // If no ID provided in excel, we can't really "upsert" by ID reliably unless we assume name uniqueness. 
            // Better strategy: If ID is present, update/upsert by ID. If not, create new.
            // Let's stick to: ID is key. 

            if (item.id) {
                const result = await Menu.updateOne(
                    { id: item.id },
                    { $set: item },
                    { upsert: true }
                );
                if (result.upsertedCount > 0) createdCount++;
                else updatedCount++;
            } else {
                // If no ID, generate one (simple timestamp based for now, or shortid if we had it)
                // Assuming the frontend/db handles ID generation or we do it here. 
                // The current model requires 'id' as a string.
                item.id = item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newItem = new Menu(item);
                await newItem.save();
                createdCount++;
            }
        }

        res.json({
            message: `Processed ${data.length} rows`,
            stats: { updated: updatedCount, created: createdCount },
            errors
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process file: ' + err.message });
    }
});

// Download Excel Template
router.get('/template', (req, res) => {
    try {
        const headers = [
            { id: 'item_123', name: 'Sample Item', price: '₹100', category: 'Main Course', subcategory: 'Veg', description: 'Delicious sample item', dietary: 'Veg' }
        ];

        const ws = XLSX.utils.json_to_sheet(headers);

        // Adjust column widths for better readability
        const wscols = [
            { wch: 15 }, // id
            { wch: 20 }, // name
            { wch: 10 }, // price
            { wch: 15 }, // category
            { wch: 15 }, // subcategory
            { wch: 30 }, // description
            { wch: 10 }  // dietary
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="menu_template.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error("Template generation error:", err);
        res.status(500).json({ error: "Failed to generate template" });
    }
});

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

// Bulk Update menu items (Admin only)
router.patch('/bulk', verifyToken, async (req, res) => {
    try {
        const { ids, updates } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No items selected for update' });
        }

        const result = await Menu.updateMany(
            { id: { $in: ids } },
            { $set: updates }
        );

        res.json({ message: `Updated ${result.modifiedCount} items`, result });
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
