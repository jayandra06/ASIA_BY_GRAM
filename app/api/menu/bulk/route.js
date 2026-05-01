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

function applyPriceOperation(currentPrice, operation) {
    if (!operation || !operation.mode || operation.mode === 'no_change') return currentPrice;
    const value = Number(operation.value);
    if (!Number.isFinite(value)) return currentPrice;

    let next = currentPrice;
    switch (operation.mode) {
        case 'set':
            next = value;
            break;
        case 'increase_amount':
            next = currentPrice + value;
            break;
        case 'decrease_amount':
            next = currentPrice - value;
            break;
        case 'increase_percent':
            next = currentPrice + (currentPrice * value / 100);
            break;
        case 'decrease_percent':
            next = currentPrice - (currentPrice * value / 100);
            break;
        default:
            return currentPrice;
    }
    return Math.max(0, next);
}

export async function PATCH(request) {
    try {
        await dbConnect();
        const { ids, updates = {}, priceOperation = null, gstSettings = null } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new Response(JSON.stringify({ error: 'No items selected' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const menuItems = await Menu.find({
            $or: [
                { id: { $in: ids } },
                { _id: { $in: ids.filter(v => /^[a-fA-F0-9]{24}$/.test(String(v))).map(v => String(v)) } }
            ]
        });

        let modifiedCount = 0;
        for (const item of menuItems) {
            let changed = false;

            // Direct field updates (category, subcategory, dietary, etc.)
            for (const [key, value] of Object.entries(updates)) {
                item[key] = value;
                changed = true;
            }

            // Bulk price operation
            if (priceOperation && priceOperation.mode && priceOperation.mode !== 'no_change') {
                const currentBase = Number.isFinite(item.basePrice) ? item.basePrice : parsePriceNumber(item.price);
                if (Number.isFinite(currentBase)) {
                    const nextBase = applyPriceOperation(currentBase, priceOperation);
                    item.basePrice = nextBase;
                    item.price = formatPrice(nextBase);
                    changed = true;
                }
            }

            // GST settings operation
            if (gstSettings) {
                if (gstSettings.enabledMode === 'enable') {
                    item.gstEnabled = true;
                    changed = true;
                } else if (gstSettings.enabledMode === 'disable') {
                    item.gstEnabled = false;
                    changed = true;
                }

                if (gstSettings.rate !== undefined && gstSettings.rate !== null && gstSettings.rate !== '') {
                    const parsedRate = Number(gstSettings.rate);
                    if (Number.isFinite(parsedRate) && parsedRate >= 0) {
                        item.gstRate = parsedRate;
                        changed = true;
                    }
                }

                if (gstSettings.includedMode === 'included') {
                    item.gstIncludedInPrice = true;
                    changed = true;
                } else if (gstSettings.includedMode === 'excluded') {
                    item.gstIncludedInPrice = false;
                    changed = true;
                }
            }

            if (changed) {
                await item.save();
                modifiedCount += 1;
            }
        }

        return new Response(JSON.stringify({
            matchedCount: menuItems.length,
            modifiedCount
        }), {
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
