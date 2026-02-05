import { motion } from 'framer-motion';

const images = [
    "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1552611052-c29a38f394e5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1541696440-8744ad5cc521?auto=format&fit=crop&q=80&w=800",
];

const GallerySection = () => {
    return (
        <section id="gallery" className="py-24 bg-transparent">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl mb-4">Visuals</h2>
                    <h3 className="text-4xl md:text-5xl font-asian font-bold text-black tracking-widest uppercase">The Atmosphere</h3>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {images.map((src, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="break-inside-avoid relative group overflow-hidden rounded-xl"
                        >
                            <img
                                src={src}
                                alt="Gallery"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GallerySection;
