export default function sitemap() {
    return [
        {
            url: 'https://asiabygram.in',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://asiabygram.in/menu', // Assuming this route exists or will exist
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Add other static routes here
    ]
}
