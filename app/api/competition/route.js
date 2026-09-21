import dbConnect from '../../../lib/db';
import CompetitionRegistration from '../../../models/CompetitionRegistration';

export async function GET() {
    try {
        await dbConnect();
        const registrations = await CompetitionRegistration.find({})
            .sort({ createdAt: -1 })
            .lean();
        return new Response(JSON.stringify(registrations), {
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

        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim();

        if (!name || !phone) {
            return new Response(JSON.stringify({ error: 'Name and phone are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!/^[0-9+\-\s]{8,15}$/.test(phone)) {
            return new Response(JSON.stringify({ error: 'Please enter a valid phone number' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const existing = await CompetitionRegistration.findOne({ phone });
        if (existing) {
            return new Response(JSON.stringify({ error: 'This phone number is already registered' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const registration = new CompetitionRegistration({
            name,
            phone,
            email: (body.email || '').trim(),
            age: body.age ? Number(body.age) : undefined,
            experience: body.experience || 'Beginner',
            notes: (body.notes || '').trim(),
            tableNumber: body.tableNumber ? String(body.tableNumber) : '',
            entryFee: 500,
            paymentStatus: 'Pending',
            competition: 'Chess Championship 2026',
        });

        await registration.save();

        return new Response(JSON.stringify(registration), {
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
