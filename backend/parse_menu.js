import XLSX from 'xlsx';
import fs from 'fs';

const FILE_PATH = 'C:\\Users\\NAGA HARSHITH\\OneDrive\\Desktop\\Asia_By_Gram\\final menu_065531.xlsx';

try {
    const workbook = XLSX.readFile(FILE_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const menuItems = [];

    const addItem = (name, price, category, desc = "", image = "") => {
        if (!name || !price) return;
        let priceStr = price.toString().replace(/₹/g, '').trim();
        if (!priceStr.startsWith('₹')) priceStr = `₹${priceStr}`;
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // Check for duplicates
        if (menuItems.some(item => item.name === name.trim())) return;

        menuItems.push({
            id: `item-${id}`,
            name: name.trim(),
            description: desc.trim() || `${category} item`,
            price: priceStr,
            category: category,
            dietary: "Veg",
            image: image || "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=800"
        });
    };

    // 1. Starters
    for (let i = 3; i <= 60; i++) {
        if (data[i]) {
            const name = data[i][5];
            const price = data[i][6];
            if (name && price && name !== "Dishes" && name !== "Dish") {
                let dietary = "Veg";
                const lowerName = name.toLowerCase();
                if (lowerName.includes('chicken') || lowerName.includes('prawn') || lowerName.includes('fish') || lowerName.includes('squid') || lowerName.includes('octopus') || lowerName.includes('lamb') || lowerName.includes('egg')) {
                    dietary = "Non-Veg";
                }
                addItem(name, price, "Starters");
                menuItems[menuItems.length - 1].dietary = dietary;
            }
        }
    }

    // 2. Seafood Specials (Delivery Section)
    for (let i = 60; i <= 80; i++) {
        if (data[i]) {
            const name = data[i][1];
            const price = data[i][2];
            if (name && (price === 1199 || price === 699 || price === 499 || price === 900)) {
                addItem(name, price, "Seafood Specials", "Premium seafood special", "https://images.unsplash.com/photo-1534604973900-c41ab4cdd90b?auto=format&fit=crop&q=80&w=800");
                menuItems[menuItems.length - 1].dietary = "Non-Veg";
            }
        }
    }

    // 3. Signature Bowls (Scan range 80-120)
    for (let i = 80; i <= 120; i++) {
        if (data[i]) {
            // Check structure: Col 1 has Type, Col 5 has Price
            const type = data[i][1];
            const price = data[i][5];
            // Ensure it's not a header
            if (type && price && !isNaN(parseFloat(price))) {
                // Check common types
                if (['Veggie', 'Vegan', 'Chicken', 'Seafood'].some(t => type.toString().trim().startsWith(t))) {
                    const noodles = data[i][2];
                    const broth = data[i][3];
                    const ingredients = data[i][4];

                    const name = `${type.trim()} Noodle Bowl`;
                    const desc = `Broth: ${broth}. Ingredients: ${ingredients}. Noodles: ${noodles}`;

                    let dietary = "Veg";
                    if (type.toLowerCase().includes('chicken') || type.toLowerCase().includes('seafood')) dietary = "Non-Veg";
                    if (type.toLowerCase().includes('vegan')) dietary = "Vegan";

                    addItem(name, price, "Signature Bowls", desc, "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800");
                    menuItems[menuItems.length - 1].dietary = dietary;
                }
            }
        }
    }

    // 4. Beverages
    addItem("Boba (Various Flavors)", 350, "Beverages", "Choice of Mango, Kiwi, Watermelon, Green Apple, Litchi, Passion Fruit, Coffee, Chocolate.", "https://images.unsplash.com/photo-1596067337341-3657788c0a87?auto=format&fit=crop&q=80&w=800");

    // Scan for Spitz and Coconut Water
    for (let i = 0; i < 30; i++) {
        if (!data[i]) continue;
        // Search specific known cells from inspection or scan row
        data[i].forEach(cell => {
            if (cell === 'Spitz') {
                // Price is likely next cell
                const idx = data[i].indexOf('Spitz');
                const price = data[i][idx + 1];
                if (price) addItem("Spitz", price, "Beverages");
            }
            if (typeof cell === 'string' && cell.includes('Coconut Water')) {
                addItem("Coconut Water (330ml)", 160, "Beverages", "Refreshing coconut water", "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=800");
            }
        });
    }

    // Output
    fs.writeFileSync('parsed_menu.json', JSON.stringify(menuItems, null, 2));
    console.log("Parsed " + menuItems.length + " items to parsed_menu.json");

} catch (e) {
    console.error(e);
}
