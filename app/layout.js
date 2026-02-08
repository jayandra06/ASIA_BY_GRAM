import { Inter, Oswald, Outfit, Shojumaru } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from '../src/context/AuthContext';
import { ModalProvider } from '../src/context/ModalContext';
import Layout from '../src/components/layout/Layout';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const shojumaru = Shojumaru({ weight: '400', subsets: ['latin'], variable: '--font-shojumaru' });

export const metadata = {
    title: 'Asia By Gram | Authentic Asian Noodles & Dining in Hyderabad',
    description: "Discover Asia By Gram, Hyderabad's premier noodle destination. Authentic Asian flavors, premium noodles, and a unique dining experience. Visit us today!",
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        title: 'Asia By Gram',
        statusBarStyle: 'black-translucent',
    },
    icons: {
        apple: '/logo.png',
    },
    openGraph: {
        type: 'website',
        url: 'https://asiabygram.in/',
        title: 'Asia By Gram | Authentic Asian Noodles & Dining',
        description: "Hyderabad's premier noodle destination. Authentic Asian flavors and a unique dining experience.",
        images: ['https://asiabygram.in/og-image.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Asia By Gram | Authentic Asian Noodles & Dining',
        description: "Hyderabad's premier noodle destination. Authentic Asian flavors and a unique dining experience.",
        images: ['https://asiabygram.in/og-image.jpg'],
    },
};

export const viewport = {
    themeColor: '#FDC55E',
    width: 'device-width',
    initialScale: 1.0,
    maximumScale: 5.0,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${oswald.variable} ${outfit.variable} ${shojumaru.variable}`}>
            <body>
                <AuthProvider>
                    <ModalProvider>
                        <Layout>
                            {children}
                        </Layout>
                        <Analytics />
                    </ModalProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
