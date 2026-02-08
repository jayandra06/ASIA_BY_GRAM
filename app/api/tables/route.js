import dbConnect from '../../../lib/db';
import Table from '../../../models/Table';

export async function GET() {
    try {
        await dbConnect();
        const tables = await Table.find({});
        return new Response(JSON.stringify(tables), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const newTable = new Table(body);
        await newTable.save();
        return new Response(JSON.stringify(newTable), {
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
