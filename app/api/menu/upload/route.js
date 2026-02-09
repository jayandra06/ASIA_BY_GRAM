import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';
import Category from '../../../../models/Category';
import * as XLSX from 'xlsx';


export async function POST(request) {
    try {
        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const menuItems = XLSX.utils.sheet_to_json(sheet);

        let updatedCount = 0;
        let createdCount = 0;
        const categoryMap = new Map();

        for (const item of menuItems) {
            if (!item.name || !item.category) continue;

            // Track Category/Subcategory for sync
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, new Set());
            }
            if (item.subcategory) {
                categoryMap.get(item.category).add(item.subcategory);
            }

            // Normalize dietary field
            let dietary = item.dietary || item.Dietary || item.Dietry || item.dietry; // Handle variations
            if (dietary) {
                const lowerDietary = dietary.toString().toLowerCase().trim();
                if (lowerDietary === 'veg' || lowerDietary === 'vegetarian') {
                    item.dietary = 'Veg';
                } else if (lowerDietary === 'non-veg' || lowerDietary === 'non veg' || lowerDietary === 'nonveg') {
                    item.dietary = 'Non-Veg';
                } else if (lowerDietary === 'vegan') {
                    item.dietary = 'Vegan';
                } else {
                    item.dietary = 'Veg'; // Default to Veg if unknown
                }
            } else {
                item.dietary = 'Veg'; // Default if missing
            }

            // Normalize boolean fields if they come from the export
            const updates = { ...item };
            if (updates.available) {
                updates.available = updates.available.toString().toLowerCase() === 'yes' || updates.available === true;
            }
            if (updates.featured) {
                updates.featured = updates.featured.toString().toLowerCase() === 'yes' || updates.featured === true;
            }

            const filter = item.id ? { id: item.id } : { name: item.name, category: item.category };
            const result = await Menu.updateOne(
                filter,
                { $set: updates },
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

        return new Response(JSON.stringify({
            message: `Processed ${menuItems.length} items`,
            stats: { updated: updatedCount, created: createdCount, categories: categoryMap.size }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Import error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process file: ' + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
