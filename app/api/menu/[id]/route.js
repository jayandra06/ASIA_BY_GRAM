import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();

        // Try to update by custom id first, then by mongo _id
        let updatedItem = await Menu.findOneAndUpdate({ id }, body, { new: true });

        if (!updatedItem) {
            updatedItem = await Menu.findByIdAndUpdate(id, body, { new: true });
        }

        if (!updatedItem) {
            return new Response(JSON.stringify({ error: 'Item not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(updatedItem), {
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

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        // Try to delete by custom id first
        let deleted = await Menu.findOneAndDelete({ id });

        // If not found, try by mongo _id
        if (!deleted) {
            deleted = await Menu.findByIdAndDelete(id);
        }

        if (!deleted) {
            return new Response(JSON.stringify({ error: 'Item not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Item deleted' }), {
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
