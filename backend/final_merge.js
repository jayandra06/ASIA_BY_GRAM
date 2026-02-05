import fs from 'fs';

// Read parsed menu
const parsed = JSON.parse(fs.readFileSync('parsed_menu.json', 'utf8'));

// Hardcoded items verified from Excel (Loop 3/4 failures in script but visually verified)
const manualItems = [
    {
        "id": "bowl-veggie",
        "name": "Veggie Noodle Bowl",
        "description": "Broth: Coconut , Mushroom , Corn , Tomato. Ingredients: Veggie balls, Lotus root,Bamboo shoot,Bok-Choi,Bean sprouts. Noodles: Udon Noodles",
        "price": "₹468",
        "category": "Signature Bowls",
        "dietary": "Veg",
        "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
    },
    {
        "id": "bowl-vegan",
        "name": "Vegan Noodle Bowl",
        "description": "Broth: Coconut , Mushroom , Corn , Tomato. Ingredients: Plant Based meat ,Soya Manchurian balls, Bok-Choi,Beans sprouts, Baby corn. Noodles: Rice Noodles",
        "price": "₹468",
        "category": "Signature Bowls",
        "dietary": "Vegan",
        "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
    },
    {
        "id": "bowl-chicken",
        "name": "Chicken Noodle Bowl",
        "description": "Broth: Prawns , Chicken , Coconut , Mushroom , Corn , Tomato. Ingredients: Chicken strips, Chicken meat balls,Fried chicken momos,small omlettes. Noodles: Buckwheat Noodles",
        "price": "₹585",
        "category": "Signature Bowls",
        "dietary": "Non-Veg",
        "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
    },
    {
        "id": "bowl-seafood",
        "name": "Seafood Noodle Bowl",
        "description": "Broth: Prawns , Chicken , Coconut , Mushroom , Corn , Tomato. Ingredients: Fish balls, Crab meat balls, Prawn sticks, Squid slices, Mussels. Noodles: Sticky rice Noodles",
        "price": "₹585",
        "category": "Signature Bowls",
        "dietary": "Non-Veg",
        "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
    },
    {
        "id": "steamboat-generic",
        "name": "Asian Steam Boat (Hot Pot)",
        "description": "Authentic interactive hot pot. Min 800gms for 2. Includes curated broth and your choice of fresh artisanal noodles.",
        "price": "₹1.80/gm",
        "category": "Steam Boat",
        "dietary": "Non-Veg",
        "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800"
    }
];

// Deduplicate: If parsed has it, use parsed (newer). If not, use manual.
// Actually, verified items should replace any partials.
// But parsed list didn't have bowls.
// Combine.
const finalMenu = [...parsed, ...manualItems];

// Write to src/data/menu.json
fs.writeFileSync('../src/data/menu.json', JSON.stringify(finalMenu, null, 2));
console.log("Successfully wrote " + finalMenu.length + " items to src/data/menu.json");
