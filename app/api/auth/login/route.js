import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        const user = await User.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        return new Response(JSON.stringify({
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
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
