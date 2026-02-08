import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        await dbConnect();
        const items = await Menu.find({}).lean();

        // Map items to a clean format for Excel
        const data = items.map(item => ({
            id: item.id || '',
            name: item.name || '',
            category: item.category || '',
            subcategory: item.subcategory || '',
            price: item.price || '',
            dietary: item.dietary || 'Veg',
            description: item.description || '',
            available: item.available !== false ? 'Yes' : 'No',
            featured: item.featured ? 'Yes' : 'No',
            image: item.image || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wscols = [
            { wch: 15 }, // id
            { wch: 25 }, // name
            { wch: 15 }, // category
            { wch: 15 }, // subcategory
            { wch: 10 }, // price
            { wch: 10 }, // dietary
            { wch: 40 }, // description
            { wch: 10 }, // available
            { wch: 10 }, // featured
            { wch: 50 }  // image
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MenuData");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="asia_by_gram_menu.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return new Response(JSON.stringify({ error: 'Failed to export menu' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
