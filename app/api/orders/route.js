import dbConnect from '../../../lib/db';
import Order from '../../../models/Order';

// Helper: parse a price string like "₹120" into a number
function parsePriceNumber(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    const cleaned = price.toString().replace(/[^\d.]/g, '');
    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
}

function formatYmd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function buildPetpoojaDates() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextday = new Date(today);
    nextday.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const withMidnight = (dt) => `${formatYmd(dt)} 00:00:00`;
    return {
        today: withMidnight(today),
        nextday: withMidnight(nextday),
        yesterday: withMidnight(yesterday),
    };
}

function buildDefaultCustInfo(order) {
    return {
        customer_name: order.customerName || '',
        customer_phone: order.customerPhone || '',
        customer_address: '',
        customer_locality: '',
        customer_phone1: '',
        customer_email: '',
        customer_dob: '',
        customer_anniversary: '',
        customer_dnd: '',
        customer_favorite: '',
        customer_tag_ids: '',
        customer_remark: '',
        gst_no: '',
        latitude: '',
        longitude: '',
    };
}

function buildDefaultItemDiscountDetails(priceNum) {
    // Keep as a JSON-encoded string, matching Petpooja capture shape
    return JSON.stringify({
        ignore_taxes: '0',
        ignore_discounts: '0',
        ig_pc: '0',
        hsn_code: '',
        actual_price: String(priceNum),
        is_consumed: '1',
        nc_flag: '0',
        nc_flag_d: {},
        is_treat_item: 0,
        is_open_item: 0,
        is_combo_item: 0,
        attributes: '',
        d_a_d: '0',
        desc: '',
        e_desc: '',
        bogo_id: 0,
        bogo_price: 0,
    });
}

// Build Petpooja kot_data payload from our Order document
function buildKotDataFromOrder(order) {
    const orderTypeMap = {
        'Dine-in': '3',   // based on Petpooja capture
        'Take away': '2', // best guess mapping
    };

    const kotItems = (order.items || []).map((item, index) => {
        const priceNum = parsePriceNumber(item.price);
        const quantity = Number(item.quantity) || 0;
        const total = priceNum * quantity;

        return {
            it_id: String(index + 1),
            item_id: item.menuItemId ? String(item.menuItemId) : '',
            ItemSpecialNote: '',
            item_price: String(priceNum),
            item_total: total.toFixed(3),
            item_name: item.name,
            item_unit: '',
            item_quntity: quantity,
            order_item_id: '',
            addonItems: '',
            item_discount_details: buildDefaultItemDiscountDetails(priceNum),
            kot_item_id: '',
        };
    });

    const subOrderTypeMap = {
        'Dine-in': process.env.PETPOOJA_SUB_ORDER_TYPE_DINEIN || '1307782',
        'Take away': process.env.PETPOOJA_SUB_ORDER_TYPE_TAKEAWAY || '1307781',
    };

    const currentDate = formatYmd(new Date());

    return {
        print_val: 1,
        save_bill_will_call: 0,
        mergekot: 0,
        merge_with_bill: 0,
        pending_order_userid: 0,
        reservation_web_id: '0',
        reservation_offline_id: '0',
        cust_info: buildDefaultCustInfo(order),
        order_type: orderTypeMap[order.orderType] || '3',
        table_no: order.tableNumber ? String(order.tableNumber) : '',
        sub_order_type_id: subOrderTypeMap[order.orderType] || subOrderTypeMap['Dine-in'],
        order_info: '',
        payment_type: '4',
        pending_order_webid_ref: 0,
        pending_order_id_ref: 0,
        facilitator_id: '0',
        custom_payment_type: 'UPI',
        current_date: currentDate,
        new_kot_flag: 1,
        copy_items_kot_ids_hidden: '',
        no_of_persons: 0,
        kot_description: '',
        kot_items: kotItems,
        advance_order_flag: '0',
        advance_order_date: '',
        remove_item_reason_store: {},
        edit_item_reason_store: {},
        counter_name: process.env.PETPOOJA_COUNTER_NAME || 's',
    };
}

// Call Petpooja KOT endpoint (save_kot.php) for a given order
async function sendKotToPetpooja(order) {
    const petpoojaUrl = process.env.PETPOOJA_KOT_URL; // e.g. http://asiabygram-serv:3000/petpooja_server/save_kot.php
    if (!petpoojaUrl) {
        return { ok: false, skipped: true, reason: 'PETPOOJA_KOT_URL not configured' };
    }

    const kotData = buildKotDataFromOrder(order);
    const params = new URLSearchParams();

    params.set('kot_data', JSON.stringify(kotData));
    params.set('rest_id', process.env.PETPOOJA_REST_ID || '');
    params.set('user', process.env.PETPOOJA_USER || '');
    params.set('sync_code', process.env.PETPOOJA_SYNC_CODE || '');
    params.set('r_c', process.env.PETPOOJA_RC || '');
    params.set('dates', JSON.stringify(buildPetpoojaDates()));
    params.set('app_version', process.env.PETPOOJA_APP_VERSION || 'WEB-NEXTJS');
    params.set('server_version', process.env.PETPOOJA_SERVER_VERSION || 'WEB-NEXTJS');

    const res = await fetch(petpoojaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        // Petpooja runs on your LAN; this will only work where that host is reachable
    });

    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Petpooja KOT error ${res.status}: ${text}`);
    }

    return { ok: true, raw: text };
}

export async function GET(request) {
    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        return new Response(JSON.stringify(orders), {
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

        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return new Response(JSON.stringify({ error: 'Order must have at least one item' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        if (!body.orderType || !['Dine-in', 'Take away'].includes(body.orderType)) {
            return new Response(JSON.stringify({ error: 'Order type must be Dine-in or Take away' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // If the order is coming from the website (QR/table menu), enforce name & phone
        // Admin/POS can still create orders without these fields.
        if (body.source === 'web') {
            const name = (body.customerName || '').toString().trim();
            const phone = (body.customerPhone || '').toString().trim();
            if (!name || !phone) {
                return new Response(JSON.stringify({ error: 'Name and phone are required for website orders' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Generate a simple unique-ish order number on the server
        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

        const order = await Order.create({
            orderNumber,
            items: body.items.map(i => ({
                menuItemId: i.menuItemId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                options: Array.isArray(i.options) ? i.options : []
            })),
            customerName: body.customerName ? body.customerName.toString().trim() : undefined,
            customerPhone: body.customerPhone ? body.customerPhone.toString().trim() : undefined,
            orderType: body.orderType,
            tableNumber: body.tableNumber || null,
            specialRequests: body.specialRequests || null,
            status: 'Pending'
        });

        // Try to create KOT in Petpooja for QR/web dine-in orders
        let petpoojaResult = null;
        if (body.source === 'web' && body.orderType === 'Dine-in') {
            try {
                petpoojaResult = await sendKotToPetpooja(order);
            } catch (e) {
                console.error('Failed to send KOT to Petpooja:', e);
                petpoojaResult = { ok: false, error: e.message || String(e) };
            }
        }

        const plainOrder = order.toObject ? order.toObject() : JSON.parse(JSON.stringify(order));

        return new Response(JSON.stringify({ ...plainOrder, petpooja: petpoojaResult }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('POST /api/orders:', error);
        return new Response(JSON.stringify({
            error: error.message || String(error),
            stack: error.stack || null
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
