import { NextResponse } from 'next/server';

export async function GET() {
    const uri = process.env.MONGODB_URI;
    const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';

    return NextResponse.json({
        envCheck: {
            MONGODB_URI_DEFINED: !!uri,
            MONGODB_URI_VALUE_MASKED: maskedUri,
            NODE_ENV: process.env.NODE_ENV
        }
    });
}
