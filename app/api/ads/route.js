import dbConnect from '../../../lib/db';
import Ad from '../../../models/Ad';

function isActiveNow(ad, now = new Date()) {
    if (ad.startDate && new Date(ad.startDate) > now) return false;
    if (ad.endDate && new Date(ad.endDate) < now) return false;
    return true;
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const placement = searchParams.get('placement');
        const status = searchParams.get('status');
        const activeOnly = searchParams.get('active') === 'true';

        const query = {};

        if (status) {
            query.status = status;
        } else if (activeOnly) {
            query.status = 'published';
        }

        if (placement) {
            query.placement = { $in: [placement, 'both'] };
        }

        let ads = await Ad.find(query).sort({ priority: -1, createdAt: -1 }).lean();

        if (activeOnly) {
            const now = new Date();
            ads = ads.filter((ad) => isActiveNow(ad, now));
        }

        return new Response(JSON.stringify(ads), {
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

        const content = (body.content || '').trim();
        if (!content) {
            return new Response(JSON.stringify({ error: 'Ad content is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const ad = new Ad({
            title: (body.title || '').trim(),
            content,
            mediaUrl: (body.mediaUrl || '').trim(),
            category: body.category || 'offer',
            adType: body.adType || 'popup',
            ctaText: (body.ctaText || 'View Menu').trim(),
            ctaLink: (body.ctaLink || '').trim(),
            autoCloseSeconds: Number(body.autoCloseSeconds) || 0,
            showCloseButton: body.showCloseButton !== false,
            frequency: body.frequency || 'session',
            targetAudience: body.targetAudience || 'all',
            placement: body.placement || 'both',
            startDate: body.startDate ? new Date(body.startDate) : null,
            endDate: body.endDate ? new Date(body.endDate) : null,
            position: body.position || 'center',
            priority: Math.min(10, Math.max(1, Number(body.priority) || 5)),
            backgroundColor: body.backgroundColor || '#ffffff',
            textColor: body.textColor || '#000000',
            borderRadius: Number(body.borderRadius) ?? 12,
            animationType: body.animationType || 'fade',
            animationDuration: Number(body.animationDuration) || 500,
            status: body.status || 'draft',
        });

        await ad.save();

        return new Response(JSON.stringify(ad), {
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
