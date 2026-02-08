import dbConnect from '../../../lib/db';
import Category from '../../../models/Category';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({}).sort({ order: 1 });
        return new Response(JSON.stringify(categories), {
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
        const newCategory = new Category(body);
        await newCategory.save();
        return new Response(JSON.stringify(newCategory), {
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
