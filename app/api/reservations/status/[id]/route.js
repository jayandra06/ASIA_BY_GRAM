import dbConnect from '../../../../../lib/db';
import Reservation from '../../../../../models/Reservation';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const { status } = await request.json();
        const reservation = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
        return new Response(JSON.stringify(reservation), {
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
