import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Try to update by custom id first
        let updatedItem = await Menu.findOneAndUpdate({ id }, body, { new: true });

        // If not found, try by mongo _id
        if (!updatedItem && mongoose.Types.ObjectId.isValid(id)) {
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
        const { id } = await params;

        // Try to delete by custom id first
        let deleted = await Menu.findOneAndDelete({ id });

        // If not found, try by mongo _id
        if (!deleted && mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Menu.findByIdAndDelete(id);
        }

        if (!deleted) {
            // Idempotent success: if it's already gone, consider it a success
            return new Response(JSON.stringify({ message: 'Item deleted (or not found)' }), {
                status: 200,
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
