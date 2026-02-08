import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';

export async function PATCH(request) {
    try {
        await dbConnect();
        const { ids, updates } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new Response(JSON.stringify({ error: 'No items selected' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await Menu.updateMany(
            { id: { $in: ids } },
            { $set: updates }
        );

        return new Response(JSON.stringify(result), {
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
