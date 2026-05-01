import dbConnect from '../../../lib/db';
import Menu from '../../../models/Menu';

function parsePriceNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    if (value === null || value === undefined) return NaN;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
}

function formatPrice(priceNumber) {
    const rounded = Number.isFinite(priceNumber) ? Math.max(0, Math.round(priceNumber * 100) / 100) : 0;
    const hasDecimals = Math.abs(rounded - Math.round(rounded)) > 0.001;
    return `₹${hasDecimals ? rounded.toFixed(2) : Math.round(rounded)}`;
}

function computeDisplayPrice(basePrice, gstEnabled, gstRate, gstIncludedInPrice) {
    if (!Number.isFinite(basePrice)) return NaN;
    if (!gstEnabled || !Number.isFinite(gstRate) || gstRate <= 0 || !gstIncludedInPrice) return basePrice;
    return basePrice * (1 + gstRate / 100);
}

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }

        const menuItems = await Menu.find(query).sort({ category: 1, name: 1 });

        return new Response(JSON.stringify(menuItems), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error in GET /api/menu:', error);
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

        // Validation - ensure required fields are present
        if (!body.name || !body.price || !body.category) {
            return new Response(JSON.stringify({ error: 'Missing required fields: name, price, or category' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate ID if missing
        if (!body.id) {
            body.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }

        // Normalize pricing/GST fields on create
        const incomingPrice = parsePriceNumber(body.price);
        const incomingBase = parsePriceNumber(body.basePrice);
        const gstEnabled = !!body.gstEnabled;
        const gstRate = parsePriceNumber(body.gstRate);
        const gstIncludedInPrice = !!body.gstIncludedInPrice;

        const resolvedBase = Number.isFinite(incomingBase)
            ? incomingBase
            : (
                Number.isFinite(incomingPrice)
                    ? (
                        gstEnabled && gstIncludedInPrice && Number.isFinite(gstRate) && gstRate > 0
                            ? incomingPrice / (1 + gstRate / 100)
                            : incomingPrice
                    )
                    : NaN
            );

        if (Number.isFinite(resolvedBase)) {
            body.basePrice = resolvedBase;
            const display = computeDisplayPrice(
                resolvedBase,
                gstEnabled,
                Number.isFinite(gstRate) ? gstRate : NaN,
                gstIncludedInPrice
            );
            body.price = formatPrice(Number.isFinite(display) ? display : resolvedBase);
        }

        const newItem = await Menu.create(body);

        return new Response(JSON.stringify(newItem), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST /api/menu:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
