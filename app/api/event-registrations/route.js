import dbConnect from '../../../lib/db';
import EventRegistration from '../../../models/EventRegistration';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const newRegistration = new EventRegistration({
            eventName: body.eventName,
            name: body.name,
            phone: body.phone,
            note: body.note
        });

        await newRegistration.save();

        return new Response(JSON.stringify(newRegistration), {
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
