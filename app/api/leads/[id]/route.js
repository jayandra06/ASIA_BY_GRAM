import dbConnect from '../../../../lib/db';
import EventLead from '../../../../models/EventLead';
import CompetitionRegistration from '../../../../models/CompetitionRegistration';

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const allowed = {};
        if (body.paymentStatus && ['Pending', 'Paid', 'Refunded', 'Free'].includes(body.paymentStatus)) {
            allowed.paymentStatus = body.paymentStatus;
        }
        if (body.entryFee !== undefined) {
            allowed.entryFee = Number(body.entryFee) || 0;
        }
        if (body.paymentNotes !== undefined) {
            allowed.paymentNotes = String(body.paymentNotes).trim();
        }

        if (Object.keys(allowed).length === 0) {
            return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updatedLead = await EventLead.findByIdAndUpdate(id, allowed, { new: true });
        if (!updatedLead) {
            return new Response(JSON.stringify({ error: 'Registration not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Keep matching CompetitionRegistration in sync if paymentStatus changed
        if (allowed.paymentStatus && updatedLead.phone) {
            try {
                const compPaymentStatus = ['Pending', 'Paid', 'Refunded'].includes(allowed.paymentStatus)
                    ? allowed.paymentStatus
                    : 'Pending';
                await CompetitionRegistration.updateMany(
                    { phone: updatedLead.phone },
                    { paymentStatus: compPaymentStatus }
                );
            } catch (syncErr) {
                console.error('Error syncing paymentStatus to CompetitionRegistration:', syncErr);
            }
        }

        return new Response(JSON.stringify(updatedLead), {
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
        const lead = await EventLead.findByIdAndDelete(id);
        if (!lead) {
            return new Response(JSON.stringify({ error: 'Registration not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Also clean up auto-synced competition registration if it was created from the event link
        if (lead.phone) {
            try {
                await CompetitionRegistration.deleteMany({
                    phone: lead.phone,
                    notes: { $regex: /Registered via event link/i },
                });
            } catch (cleanErr) {
                console.error('Error cleaning up linked CompetitionRegistration:', cleanErr);
            }
        }

        return new Response(JSON.stringify({ success: true, message: 'Registration deleted successfully' }), {
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
