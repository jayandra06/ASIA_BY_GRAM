import dbConnect from '../../../lib/db';
import CompetitionRegistration from '../../../models/CompetitionRegistration';
import { notifyRegistrationWhatsApp } from '../../../lib/whatsapp';

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

        const competition = body.competition || 'Chess Championship 2026';

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
            competition,
        });

        await registration.save();

        const whatsapp = await notifyRegistrationWhatsApp({
            type: 'competition',
            eventName: competition,
            name,
            phone,
            age: registration.age,
            extra: {
                experience: registration.experience,
                email: registration.email,
                tableNumber: registration.tableNumber,
                source: 'competition',
            },
        });

        return new Response(JSON.stringify({ ...registration.toObject(), whatsapp }), {
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
