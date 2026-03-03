import dbConnect from '../../../../lib/db';
import Category from '../../../../models/Category';
import Menu from '../../../../models/Menu';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
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
        const { id } = await params;

        // Find the category to get its name before deleting
        const category = await Category.findById(id);
        if (!category) {
            return new Response(JSON.stringify({ error: 'Category not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Reassign all menu items in this category to "Uncategorised"
        await Menu.updateMany(
            { category: category.name },
            { $set: { category: 'Uncategorised', subcategory: '' } }
        );

        await Category.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: 'Category deleted, items moved to Uncategorised' }), {
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

