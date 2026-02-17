import dbConnect from '../../../lib/db';
import Menu from '../../../models/Menu';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }

        const menuItems = await Menu.find(query).sort({ category: 1, name: 1 });

        return new Response(JSON.stringify(menuItems), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error in GET /api/menu:', error);
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

        // Validation - ensure required fields are present
        if (!body.name || !body.price || !body.category) {
            return new Response(JSON.stringify({ error: 'Missing required fields: name, price, or category' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate ID if missing
        if (!body.id) {
            body.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }

        const newItem = await Menu.create(body);

        return new Response(JSON.stringify(newItem), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/menu:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
