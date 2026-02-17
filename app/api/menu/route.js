import dbConnect from '../../../lib/db';
import Menu from '../../../models/Menu';

const OUTLET_ID = process.env.PETPOOJA_OUTLET_ID || '410098';

export async function GET(request) {
    try {
        const url = `https://menu.petpooja.com/menus/milistnew/${OUTLET_ID}`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "x-requested-with": "XMLHttpRequest",
                "x-app-client": "menu-web",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: "",
            // next: { revalidate: 300 } // Not always supported in all environments, but good for Vercel
        });

        const rawText = await res.text();
        let raw;
        try {
            raw = JSON.parse(rawText);
        } catch (e) {
            console.error('Petpooja returned non-JSON response.');
            console.error('Response Status:', res.status);
            console.error('Response Preview:', rawText.slice(0, 500));

            if (rawText.includes('window.location.href')) {
                console.error('Detected Petpooja redirection (possibly billing/auth issue).');
                return new Response(JSON.stringify({
                    error: "Petpooja redirection detected",
                    details: "The API is redirecting to a login or billing page. Please check your Petpooja outlet configuration and subscription status.",
                    redirect_target: rawText.match(/window\.location\.href\s*=\s*'([^']+)'/)?.[1] || "unknown"
                }), {
                    status: 503, // Service Unavailable
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            return new Response(JSON.stringify({ error: "Petpooja returned non-JSON", raw: rawText.slice(0, 500) }), {
                status: 502, // Bad Gateway
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const categories = raw?.category_list || raw?.data?.category_list || [];

        // Flatten into the schema expected by the frontend
        const flattenedItems = [];
        categories.forEach(c => {
            const categoryName = c.category_name;
            (c.item_list || []).forEach(i => {
                flattenedItems.push({
                    id: i.item_id,
                    name: i.item_name,
                    price: Number(i.price || i.final_price || 0),
                    image: i.image || i.item_image || null,
                    description: i.item_description || "",
                    category: categoryName,
                    dietary: (i.is_veg === 1 || i.is_veg === "1") ? 'Veg' : 'Non-Veg'
                });
            });
        });

        return new Response(JSON.stringify(flattenedItems), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            },
        });
    } catch (error) {
        console.error('Error in /api/menu:', error);
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

        const newItem = await Menu.create(body);

        // Invalidate cache
        menuCache = null;
        cacheTimestamp = 0;

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
