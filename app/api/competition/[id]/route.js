import dbConnect from '../../../../lib/db';
import CompetitionRegistration from '../../../../models/CompetitionRegistration';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const allowed = {};
        if (body.paymentStatus && ['Pending', 'Paid', 'Refunded'].includes(body.paymentStatus)) {
            allowed.paymentStatus = body.paymentStatus;
        }

        if (Object.keys(allowed).length === 0) {
            return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updated = await CompetitionRegistration.findByIdAndUpdate(id, allowed, { new: true });
        if (!updated) {
            return new Response(JSON.stringify({ error: 'Registration not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(updated), {
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
        const deleted = await CompetitionRegistration.findByIdAndDelete(id);
        if (!deleted) {
            return new Response(JSON.stringify({ error: 'Registration not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ success: true }), {
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
