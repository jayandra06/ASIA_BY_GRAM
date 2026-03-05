import dbConnect from '../../../../lib/db';
import Order from '../../../../models/Order';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const allowed = ['status'];
        const updates = {};
        if (body.status != null) updates.status = body.status;
        const order = await Order.findByIdAndUpdate(id, updates, { new: true });
        if (!order) {
            return new Response(JSON.stringify({ error: 'Order not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify(order), {
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
