import dbConnect from '../../../lib/db';
import Order from '../../../models/Order';

export async function GET(request) {
    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        return new Response(JSON.stringify(orders), {
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

        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return new Response(JSON.stringify({ error: 'Order must have at least one item' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        if (!body.customerName || !body.customerPhone) {
            return new Response(JSON.stringify({ error: 'Customer name and phone are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        if (!body.orderType || !['Dine-in', 'Take away'].includes(body.orderType)) {
            return new Response(JSON.stringify({ error: 'Order type must be Dine-in or Take away' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const order = await Order.create({
            items: body.items.map(i => ({
                menuItemId: i.menuItemId,
                name: i.name,
                price: i.price,
                quantity: i.quantity
            })),
            customerName: body.customerName.trim(),
            customerPhone: body.customerPhone.trim(),
            orderType: body.orderType,
            tableNumber: body.tableNumber || null,
            specialRequests: body.specialRequests || null,
            status: 'Pending'
        });

        return new Response(JSON.stringify(order), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('POST /api/orders:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
