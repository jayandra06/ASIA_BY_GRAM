import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
    try {
        await dbConnect();
        const { username, email, password } = await request.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new Response(JSON.stringify({ message: 'User already exists' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = new User({ username, email, password });
        await user.save();

        return new Response(JSON.stringify({ message: 'User registered successfully' }), {
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
