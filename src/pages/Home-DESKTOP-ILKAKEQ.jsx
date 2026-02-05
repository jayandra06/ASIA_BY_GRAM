import Hero from '../components/sections/Hero';
import AboutSection from '../components/sections/AboutSection';
import MenuSection from '../components/sections/MenuSection';
import GallerySection from '../components/sections/GallerySection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import InstagramSection from '../components/sections/InstagramSection';
import LocationSection from '../components/sections/LocationSection';

const Home = () => {
    return (
        <>
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
