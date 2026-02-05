
import { useEffect } from 'react';
import Lenis from 'lenis'
import Navbar from './Navbar';
import Footer from './Footer';
import SideNav from './SideNav';
import { useLocation } from 'react-router-dom';
import GlobalBackground from '../ui/GlobalBackground';

import SparticlesEffect from '../ui/SparticlesEffect';

const Layout = ({ children }) => {

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        })

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    return (
        <div className="bg-transparent min-h-screen text-black relative selection:bg-primary selection:text-white">
            <GlobalBackground />
            <SparticlesEffect />
            <Navbar />
            <SideNav />
            <main className="relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
