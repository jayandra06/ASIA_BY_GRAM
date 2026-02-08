import dbConnect from '../../../lib/db';
import Menu from '../../../models/Menu';

// Simple in-memory cache
let menuCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
    try {
        const now = Date.now();

        // Check if cache is valid
        if (menuCache && (now - cacheTimestamp) < CACHE_DURATION) {
            const { searchParams } = new URL(request.url);
            const category = searchParams.get('category');

            // Filter cached data if category specified
            const filteredData = category
                ? menuCache.filter(item => item.category === category)
                : menuCache;

            return new Response(JSON.stringify(filteredData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=300' // 5 min browser cache
                },
            });
        }

        // Fetch from database
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const filters = {};
        if (category) filters.category = category;

        // Use .lean() for 30-50% faster queries (returns plain objects)
        const items = await Menu.find(filters).lean();

        // Update cache only if fetching all items
        if (!category) {
            menuCache = items;
            cacheTimestamp = now;
        }

        return new Response(JSON.stringify(items), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300'
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
