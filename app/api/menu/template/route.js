import * as XLSX from 'xlsx';

export async function GET() {
    try {
        const headers = [
            { id: 'item_123', name: 'Sample Item', price: '₹100', category: 'Main Course', subcategory: 'Veg', description: 'Delicious sample item', dietary: 'Veg' }
        ];

        const ws = XLSX.utils.json_to_sheet(headers);
        const wscols = [
            { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 }
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="menu_template.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to generate template' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
