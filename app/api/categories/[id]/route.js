import dbConnect from '../../../../lib/db';
import Category from '../../../../models/Category';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });
        return new Response(JSON.stringify(updatedCategory), {
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
        await Category.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: 'Category deleted' }), {
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
