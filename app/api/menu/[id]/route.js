import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';

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

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Normalize pricing/GST fields on update so reopening edit shows persisted values
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

        // Try to update by custom id first
        let updatedItem = await Menu.findOneAndUpdate({ id }, body, { new: true });

        // If not found, try by mongo _id
        if (!updatedItem && mongoose.Types.ObjectId.isValid(id)) {
            updatedItem = await Menu.findByIdAndUpdate(id, body, { new: true });
        }

        if (!updatedItem) {
            return new Response(JSON.stringify({ error: 'Item not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(updatedItem), {
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

        // Try to delete by custom id first
        let deleted = await Menu.findOneAndDelete({ id });

        // If not found, try by mongo _id
        if (!deleted && mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Menu.findByIdAndDelete(id);
        }

        if (!deleted) {
            // Idempotent success: if it's already gone, consider it a success
            return new Response(JSON.stringify({ message: 'Item deleted (or not found)' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: 'Item deleted' }), {
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
