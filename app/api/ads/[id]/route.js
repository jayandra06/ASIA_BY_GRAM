import dbConnect from '../../../../lib/db';
import Ad from '../../../../models/Ad';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const ad = await Ad.findById(id).lean();
        if (!ad) {
            return new Response(JSON.stringify({ error: 'Ad not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify(ad), {
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

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updates = {};
        const fields = [
            'title', 'content', 'mediaUrl', 'category', 'adType', 'ctaText', 'ctaLink', 'entryFee', 'prize',
            'autoCloseSeconds', 'showCloseButton', 'frequency', 'targetAudience', 'placement',
            'startDate', 'endDate', 'position', 'priority', 'backgroundColor', 'textColor',
            'borderRadius', 'animationType', 'animationDuration', 'status',
        ];

        for (const key of fields) {
            if (body[key] !== undefined) {
                if (key === 'startDate' || key === 'endDate') {
                    updates[key] = body[key] ? new Date(body[key]) : null;
                } else if (key === 'content') {
                    updates[key] = String(body[key]).trim();
                } else if (typeof body[key] === 'string' && ['title', 'mediaUrl', 'ctaText', 'ctaLink', 'entryFee', 'prize'].includes(key)) {
                    updates[key] = body[key].trim();
                } else {
                    updates[key] = body[key];
                }
            }
        }

        if (updates.content !== undefined && !updates.content) {
            return new Response(JSON.stringify({ error: 'Ad content is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (updates.priority !== undefined) {
            updates.priority = Math.min(10, Math.max(1, Number(updates.priority) || 5));
        }

        const updated = await Ad.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updated) {
            return new Response(JSON.stringify({ error: 'Ad not found' }), {
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

export async function PATCH(request, context) {
    return PUT(request, context);
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Ad.findByIdAndDelete(id);
        if (!deleted) {
            return new Response(JSON.stringify({ error: 'Ad not found' }), {
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
