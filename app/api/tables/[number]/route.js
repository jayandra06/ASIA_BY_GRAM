import dbConnect from '../../../../lib/db';
import Table from '../../../../models/Table';

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { number } = params;
        const result = await Table.findOneAndDelete({ number: parseInt(number) });
        if (result) {
            return new Response(JSON.stringify({ message: 'Table deleted' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({ message: 'Table not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
