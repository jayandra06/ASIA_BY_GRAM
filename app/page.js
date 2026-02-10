import Hero from '../src/components/sections/Hero';
import EventsSection from '../src/components/sections/EventsSection';
import AboutSection from '../src/components/sections/AboutSection';
import MenuSection from '../src/components/sections/MenuSection';
import GallerySection from '../src/components/sections/GallerySection';
import InstagramSection from '../src/components/sections/InstagramSection';
import LocationSection from '../src/components/sections/LocationSection';

export default function Home() {
    return (
        <>
            <Hero />
            <AboutSection />
            <MenuSection />
            <EventsSection />
            <GallerySection />
            <InstagramSection />
            <LocationSection />
        </>
    );
}
