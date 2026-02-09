import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';

export async function POST(request) {
    try {
        await dbConnect();
        const { updates } = await request.json();

        if (!updates || !Array.isArray(updates)) {
            return new Response(JSON.stringify({ message: 'Invalid updates format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const results = await Promise.all(updates.map(async (update) => {
            const { id, updates: itemUpdates } = update;
            let updated = await Menu.findOneAndUpdate({ id }, itemUpdates, { new: true });
            if (!updated) {
                updated = await Menu.findByIdAndUpdate(id, itemUpdates, { new: true });
            }
            return updated;
        }));

        return new Response(JSON.stringify(results), {
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
