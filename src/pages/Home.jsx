import Hero from '../components/sections/Hero';
import AboutSection from '../components/sections/AboutSection';
import MenuSection from '../components/sections/MenuSection';
import GallerySection from '../components/sections/GallerySection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import InstagramSection from '../components/sections/InstagramSection';
import LocationSection from '../components/sections/LocationSection';

import { Helmet } from 'react-helmet-async';

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Asia By Gram | Authentic Asian Noodles & Dining in Hyderabad</title>
                <meta name="description" content="Discover Asia By Gram, Hyderabad's premier noodle destination. Authentic Asian flavors, premium noodles, and a unique dining experience." />
                <meta property="og:title" content="Asia By Gram | Authentic Asian Noodles & Dining" />
                <meta property="og:description" content="Hyderabad's best noodle journey. Crafted with passion, served with elegance." />
            </Helmet>
            <Hero />
            <AboutSection />
            <MenuSection />
            <GallerySection />
            <InstagramSection />
            <LocationSection />
        </>
    );
};

export default Home;
