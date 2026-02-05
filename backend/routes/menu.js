import express from 'express';
import Menu from '../models/Menu.js';
import Category from '../models/Category.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import * as XLSX from 'xlsx';

const router = express.Router();
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

        // Try reading with default headers first
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!rawData || rawData.length === 0) {
            return res.status(400).json({ error: 'Excel sheet is empty' });
        }

        let menuItems = [];

        // Detection logic: Is it the multi-column "Asian Menu" or the "Standard Template"?
        const isStandardTemplate = rawData[0] && (rawData[0].includes('name') && rawData[0].includes('category'));

        if (isStandardTemplate) {
            // Standard format handling
            menuItems = XLSX.utils.sheet_to_json(sheet);
        } else {
            // Multi-column "Asian Menu" handling (Custom parsing logic)
            const addItem = (items, name, price, category, subcategory = "", desc = "") => {
                if (!name || !price || isNaN(parseFloat(price.toString().replace(/[^0-9.]/g, '')))) return;

                let priceStr = price.toString().trim();
                if (!priceStr.startsWith('₹')) priceStr = `₹${priceStr}`;

                // Deduplicate by name within the same sheet
                const existingIndex = items.findIndex(i => i.name.toLowerCase() === name.trim().toLowerCase());

                const itemData = {
                    name: name.trim(),
                    description: desc.trim() || `${category} ${subcategory ? '(' + subcategory + ')' : ''} item`,
                    price: priceStr,
                    category: category.trim(),
                    subcategory: subcategory.trim(),
                    dietary: "Veg",
                    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=800"
                };

                const lowerName = name.toLowerCase();
                if (lowerName.includes('chicken') || lowerName.includes('prawn') || lowerName.includes('fish') || lowerName.includes('squid') || lowerName.includes('octopus') || lowerName.includes('lamb') || lowerName.includes('egg') || lowerName.includes('non-veg')) {
                    itemData.dietary = "Non-Veg";
                }

                if (existingIndex > -1) {
                    // Update existing with better data
                    if (desc) items[existingIndex].description = desc.trim();
                    // Update price if it was a placeholder or different
                    items[existingIndex].price = priceStr;
                } else {
                    // Generate a STABLE ID based on name and category to avoid duplicates on re-import
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    itemData.id = `item-${slug}`;
                    items.push(itemData);
                }
            };

            // Section 1: Matrix Section (Rows 0-59)
            for (let i = 0; i < 60 && i < rawData.length; i++) {
                const row = rawData[i];
                if (!row) continue;
                if (row[5] && row[6]) addItem(menuItems, row[5], row[6], "Starters");
                if (row[7] && row[8]) addItem(menuItems, row[7], row[8], "Beverages");
            }

            // Section 2: List Section (Rows 60+)
            for (let i = 60; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row) continue;
                if (row[1] && row[4] && !isNaN(parseFloat(row[4]))) {
                    addItem(menuItems, row[1], row[4], "Starters", "", row[2] || "");
                }
            }
        }

        // Processing & Database Sync
        let updatedCount = 0;
        let createdCount = 0;
        const categoryMap = new Map(); // name -> Set of subcategories

        for (const item of menuItems) {
            if (!item.name || !item.price || !item.category) continue;

            // Track Category/Subcategory for sync
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, new Set());
            }
            if (item.subcategory) {
                categoryMap.get(item.category).add(item.subcategory);
            }

            // Upsert Menu Item
            const filter = item.id ? { id: item.id } : { name: item.name, category: item.category };
            const result = await Menu.updateOne(
                filter,
                { $set: item },
                { upsert: true }
            );

            if (result.upsertedCount > 0) createdCount++;
            else updatedCount++;
        }

        // Sync Categories collection
        for (const [catName, subcatsSet] of categoryMap.entries()) {
            await Category.updateOne(
                { name: catName },
                {
                    $addToSet: { subcategories: { $each: Array.from(subcatsSet) } },
                    $setOnInsert: { name: catName }
                },
                { upsert: true }
            );
        }

        res.json({
            message: `Processed ${menuItems.length} items`,
            stats: { updated: updatedCount, created: createdCount, categories: categoryMap.size }
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
