import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const updatedItem = await Menu.findOneAndUpdate({ id }, body, { new: true });
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
        await Menu.findOneAndDelete({ id });
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
