import dbConnect from '../../../../lib/db';
import Table from '../../../../models/Table';

export async function POST(request) {
    try {
        await dbConnect();
        const { count } = await request.json();

        if (!count || count < 1) {
            return new Response(JSON.stringify({ message: 'Invalid table count' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await Table.deleteMany({});
        const tables = [];
        const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

        for (let i = 1; i <= count; i++) {
            tables.push({
                number: i,
                url: `${baseUrl}/menu?table=${i}`
            });
        }

        const newTables = await Table.insertMany(tables);
        return new Response(JSON.stringify(newTables), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
