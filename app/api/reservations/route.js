import dbConnect from '../../../lib/db';
import Reservation from '../../../models/Reservation';

export async function GET() {
    try {
        await dbConnect();
        const reservations = await Reservation.find({}).sort({ date: -1 });
        return new Response(JSON.stringify(reservations), {
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
        const newReservation = new Reservation(body);
        await newReservation.save();
        return new Response(JSON.stringify(newReservation), {
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
