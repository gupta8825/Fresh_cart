const img = (id) => `https://images.unsplash.com/${id}?q=80&w=800&auto=format&fit=crop`;

// Illustrative demo imagery (Unsplash). A built-in SVG fallback covers any
// image that fails to load. No brand affiliation is claimed.
export const CATEGORIES = [
  { id: "atta", name: "Atta, Flour & Grains", image: img("photo-1574323347407-f5e1ad6d020b"), description: "Atta, sooji & grains" },
  { id: "rice", name: "Rice & Basmati Rice", image: img("photo-1586201375761-83865001e31c"), description: "Everyday & basmati rice" },
  { id: "dal", name: "Dal, Pulses & Beans", image: img("photo-1536304993881-ff6e9eefa2a6"), description: "Protein-rich dals" },
  { id: "oil", name: "Cooking Oil", image: img("photo-1474979266404-7eaacbcd87c5"), description: "Plant-based cooking oils" },
  { id: "spices", name: "Masala & Spices", image: img("photo-1596040033229-a9821ebd058d"), description: "Powdered & whole spices" },
  { id: "salt-sugar", name: "Salt, Sugar & Jaggery", image: img("photo-1587049352846-4a222e784d38"), description: "Kitchen sweeteners" },
  { id: "biscuits", name: "Biscuits & Rusks", image: img("photo-1499636136210-6f4ee915583e"), description: "Chai-time favourites" },
  { id: "namkeen", name: "Namkeen & Snacks", image: img("photo-1621939514649-280e2ee25f60"), description: "Crunchy munchies" },
  { id: "noodles", name: "Noodles & Pasta", image: img("photo-1585032226651-759b368d7246"), description: "Quick meals" },
  { id: "beverages", name: "Tea, Coffee & Drinks", image: img("photo-1544787219-7f47ccb76574"), description: "Chai, coffee & more" },
  { id: "packaged", name: "Packaged & Instant Mixes", image: img("photo-1466637574441-749b8f19452f"), description: "Ready-to-cook packs" },
  { id: "dryfruits", name: "Dry Fruits & Nuts", image: img("photo-1508061253366-f7da158b6d46"), description: "Premium dry fruits" },
  { id: "sauces", name: "Sauces & Pickles", image: img("photo-1472476443507-c7a5948772fc"), description: "Ketchup, pickles, spreads" },
  { id: "cleaning", name: "Cleaning & Household", image: img("photo-1528740561666-dc2479dc08ab"), description: "Home care essentials" },
  { id: "personal", name: "Personal Care", image: img("photo-1571781926291-c477ebfd024b"), description: "Hygiene & care" },
  { id: "pooja", name: "Pooja Essentials", image: img("photo-1608571423902-eed4a5ad8108"), description: "Daily pooja needs" },
];

export const PRODUCTS = [
  { id: "k01", name: "Whole Wheat Atta", category: "atta", price: 285, originalPrice: 340, rating: 4.8, reviews: 1500, stock: 55, unit: "5 kg", image: img("photo-1574323347407-f5e1ad6d020b"), description: "Stone-ground chakki atta for soft, fluffy rotis. Made from premium MP wheat.", bestseller: true },
  { id: "k02", name: "Multigrain Atta", category: "atta", price: 345, originalPrice: 399, rating: 4.6, reviews: 620, stock: 40, unit: "5 kg", image: img("photo-1466637574441-749b8f19452f"), description: "Wholesome blend of wheat, soya, oats and ragi for extra nutrition in every roti." },
  { id: "k03", name: "Fine Sooji Rava", category: "atta", price: 68, originalPrice: 80, rating: 4.5, reviews: 410, stock: 60, unit: "1 kg", image: img("photo-1536304993881-ff6e9eefa2a6"), description: "Fine semolina for fluffy idlis, crispy dosas and melt-in-mouth halwa." },
  { id: "k04", name: "Premium Basmati Rice", category: "rice", price: 649, originalPrice: 799, rating: 4.8, reviews: 2100, stock: 45, unit: "5 kg", image: img("photo-1586201375761-83865001e31c"), description: "Extra-long grain aged basmati with rich aroma. Perfect for biryani and pulao.", bestseller: true },
  { id: "k05", name: "Sona Masoori Rice", category: "rice", price: 385, originalPrice: 450, rating: 4.6, reviews: 900, stock: 50, unit: "5 kg", image: img("photo-1516684732162-798a0062be99"), description: "Lightweight daily rice, ideal for steamed rice, pongal and lemon rice." },
  { id: "k06", name: "Regular Daily Rice", category: "rice", price: 72, originalPrice: 85, rating: 4.4, reviews: 530, stock: 70, unit: "1 kg", image: img("photo-1586201375761-83865001e31c"), description: "Value-pack everyday rice for dal-chawal, khichdi and fried rice." },
  { id: "k07", name: "Unpolished Toor Dal", category: "dal", price: 168, originalPrice: 195, rating: 4.7, reviews: 840, stock: 48, unit: "1 kg", image: img("photo-1610725664285-7c57e6eeac3f"), description: "Protein-rich unpolished toor dal that cooks fast and tastes like home.", bestseller: true },
  { id: "k08", name: "Moong Dal Split", category: "dal", price: 142, originalPrice: 165, rating: 4.6, reviews: 510, stock: 52, unit: "1 kg", image: img("photo-1536304993881-ff6e9eefa2a6"), description: "Easy-to-digest split moong dal for khichdi, tadka dal and dosas." },
  { id: "k09", name: "Red Rajma", category: "dal", price: 132, originalPrice: 155, rating: 4.5, reviews: 380, stock: 36, unit: "1 kg", image: img("photo-1547592180-85f173990554"), description: "Bold, creamy Jammu-style rajma for the perfect Sunday rajma-chawal." },
  { id: "k10", name: "Kabuli Chana", category: "dal", price: 118, originalPrice: 140, rating: 4.5, reviews: 340, stock: 42, unit: "1 kg", image: img("photo-1506368249639-73a05d6f6488"), description: "Large, uniform chickpeas for chole, chaat and hummus." },
  { id: "k11", name: "Sunflower Cooking Oil", category: "oil", price: 155, originalPrice: 185, rating: 4.6, reviews: 980, stock: 65, unit: "1 litre", image: img("photo-1474979266404-7eaacbcd87c5"), description: "Light, neutral refined sunflower oil for everyday frying and tadka.", bestseller: true },
  { id: "k12", name: "Cold-Pressed Mustard Oil", category: "oil", price: 219, originalPrice: 259, rating: 4.7, reviews: 610, stock: 38, unit: "1 litre", image: img("photo-1474979266404-7eaacbcd87c5"), description: "Kachi-ghani mustard oil with pungent aroma. Ideal for pickles and sabzi." },
  { id: "k13", name: "Groundnut Oil", category: "oil", price: 189, originalPrice: 225, rating: 4.5, reviews: 430, stock: 44, unit: "1 litre", image: img("photo-1474979266404-7eaacbcd87c5"), description: "Filtered groundnut oil with nutty flavour, great for deep frying." },
  { id: "k14", name: "Turmeric Powder", category: "spices", spiceType: "powder", brand: "FreshCart Select", price: 58, originalPrice: 72, rating: 4.8, reviews: 1120, stock: 80, unit: "200 g", image: img("photo-1596040033229-a9821ebd058d"), description: "High-curcumin Salem haldi, stone-ground for colour and aroma.", bestseller: true },
  { id: "k15", name: "Red Chilli Powder", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 72, originalPrice: 88, rating: 4.7, reviews: 760, stock: 70, unit: "200 g", image: img("photo-1596040033229-a9821ebd058d"), description: "Bright, hot Guntur chilli powder for curries with real punch." },
  { id: "k16", name: "Coriander Powder", category: "spices", spiceType: "powder", brand: "FreshCart Select", price: 62, originalPrice: 75, rating: 4.6, reviews: 540, stock: 66, unit: "200 g", image: img("photo-1509358271058-acd22cc93898"), description: "Freshly milled dhania with citrusy aroma for everyday tadka." },
  { id: "k17", name: "Garam Masala", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 68, originalPrice: 82, rating: 4.7, reviews: 690, stock: 58, unit: "100 g", image: img("photo-1509358271058-acd22cc93898"), description: "Slow-roasted whole-spice blend for rich, restaurant-style curries." },
  { id: "k18", name: "Cumin Seeds", category: "spices", spiceType: "whole", brand: "FreshCart Select", price: 84, originalPrice: 99, rating: 4.6, reviews: 470, stock: 54, unit: "200 g", image: img("photo-1509358271058-acd22cc93898"), description: "Bold Unjha jeera with high oil content for tadka, raita and chaas." },
  { id: "k19", name: "Iodized Salt", category: "salt-sugar", price: 32, originalPrice: 38, rating: 4.7, reviews: 1300, stock: 120, unit: "1 kg", image: img("photo-1466637574441-749b8f19452f"), description: "Free-flow iodized salt for everyday cooking. Stays dry, pours easy." },
  { id: "k20", name: "Refined Sugar", category: "salt-sugar", price: 48, originalPrice: 55, rating: 4.6, reviews: 880, stock: 100, unit: "1 kg", image: img("photo-1587049352846-4a222e784d38"), description: "Fine sulphurless sugar that dissolves fast in chai and desserts." },
  { id: "k21", name: "Jaggery Cubes", category: "salt-sugar", price: 74, originalPrice: 89, rating: 4.5, reviews: 320, stock: 46, unit: "500 g", image: img("photo-1587049352846-4a222e784d38"), description: "Chemical-free gud cubes for chai, dal and traditional sweets." },
  { id: "k22", name: "Marie Biscuits", category: "biscuits", price: 42, originalPrice: 50, rating: 4.5, reviews: 830, stock: 90, unit: "400 g", image: img("photo-1499636136210-6f4ee915583e"), description: "Light, crisp tea-time classic. Low sugar, perfect for dunking." },
  { id: "k23", name: "Glucose Biscuits", category: "biscuits", price: 28, originalPrice: 35, rating: 4.6, reviews: 1150, stock: 110, unit: "300 g", image: img("photo-1499636136210-6f4ee915583e"), description: "Energy-packed glucose biscuits — the evergreen tiffin favourite.", bestseller: true },
  { id: "k24", name: "Cream Biscuits", category: "biscuits", price: 36, originalPrice: 45, rating: 4.4, reviews: 520, stock: 75, unit: "300 g", image: img("photo-1499636136210-6f4ee915583e"), description: "Chocolate-cream sandwich biscuits kids reach for first." },
  { id: "k25", name: "Crispy Rusks", category: "biscuits", price: 48, originalPrice: 58, rating: 4.5, reviews: 390, stock: 62, unit: "400 g", image: img("photo-1509440159596-0249088772ff"), description: "Twice-baked crunchy rusks for slow chai mornings." },
  { id: "k26", name: "Potato Chips", category: "namkeen", price: 52, originalPrice: 60, rating: 4.5, reviews: 940, stock: 85, unit: "150 g", image: img("photo-1566478989037-eec170784d0b"), description: "Thin, salty, extra-crunchy chips in a family sharing pack.", bestseller: true },
  { id: "k27", name: "Bhujia Namkeen", category: "namkeen", price: 58, originalPrice: 70, rating: 4.6, reviews: 720, stock: 78, unit: "400 g", image: img("photo-1621939514649-280e2ee25f60"), description: "Spicy Bikaneri-style bhujia made with moth dal and real spices." },
  { id: "k28", name: "Roasted Peanuts", category: "namkeen", price: 74, originalPrice: 89, rating: 4.5, reviews: 360, stock: 56, unit: "500 g", image: img("photo-1508061253366-f7da158b6d46"), description: "Crunchy roasted peanuts with a hint of salt — chai's best friend." },
  { id: "k29", name: "Masala Instant Noodles", category: "noodles", price: 56, originalPrice: 64, rating: 4.7, reviews: 1350, stock: 95, unit: "4 pack", image: img("photo-1585032226651-759b368d7246"), description: "The 2-minute masala classic. Springy noodles, iconic masala.", bestseller: true },
  { id: "k30", name: "Durum Wheat Pasta", category: "noodles", price: 119, originalPrice: 149, rating: 4.4, reviews: 310, stock: 44, unit: "500 g", image: img("photo-1621996346565-e3dbc646d9a9"), description: "Bronze-cut penne from 100% durum wheat. Cooks al-dente every time." },
  { id: "k31", name: "Roasted Vermicelli", category: "noodles", price: 46, originalPrice: 55, rating: 4.5, reviews: 280, stock: 58, unit: "500 g", image: img("photo-1621996346565-e3dbc646d9a9"), description: "Pre-roasted sevai for upma, kheer and payasam in minutes." },
  { id: "k32", name: "Assam Tea", category: "beverages", price: 145, originalPrice: 175, rating: 4.8, reviews: 1240, stock: 60, unit: "500 g", image: img("photo-1544787219-7f47ccb76574"), description: "Strong, malty CTC chai patti for kadak morning chai.", bestseller: true },
  { id: "k33", name: "Instant Coffee", category: "beverages", price: 249, originalPrice: 299, rating: 4.7, reviews: 720, stock: 33, unit: "200 g", image: img("photo-1447933601403-0c6688de566e"), description: "Rich instant coffee powder for quick filter-style kaapi at home." },
  { id: "k34", name: "Packaged Mango Juice", category: "beverages", price: 129, originalPrice: 159, rating: 4.5, reviews: 280, stock: 40, unit: "1 litre", image: img("photo-1600271886742-f049cd451bba"), description: "Sweet mango drink for parties, tiffins and summer afternoons." },
  { id: "k35", name: "Ready Poha Mix", category: "packaged", price: 64, originalPrice: 78, rating: 4.4, reviews: 260, stock: 48, unit: "400 g", image: img("photo-1466637574441-749b8f19452f"), description: "Ready-to-cook onion poha with peanuts and curry leaves. Breakfast in 5 minutes." },
  { id: "k36", name: "Upma Rava Mix", category: "packaged", price: 58, originalPrice: 70, rating: 4.3, reviews: 190, stock: 0, unit: "400 g", image: img("photo-1466637574441-749b8f19452f"), description: "Instant rava upma mix with roasted rava and mild spices." },
  { id: "k37", name: "Roasted Almonds", category: "dryfruits", price: 349, originalPrice: 429, rating: 4.9, reviews: 890, stock: 30, unit: "500 g", image: img("photo-1508061253366-f7da158b6d46"), description: "Crunchy premium almonds, rich in vitamin E. Ideal for daily snacking.", bestseller: true },
  { id: "k38", name: "Golden Raisins", category: "dryfruits", price: 129, originalPrice: 155, rating: 4.6, reviews: 340, stock: 42, unit: "500 g", image: img("photo-1615485290382-441e4d049cb5"), description: "Plump seedless kishmish for kheer, pulao and lunchboxes." },
  { id: "k39", name: "Mango Pickle Jar", category: "sauces", price: 149, originalPrice: 179, rating: 4.7, reviews: 560, stock: 34, unit: "500 g", image: img("photo-1472476443507-c7a5948772fc"), description: "Homestyle aam ka achaar in mustard oil — tangy, spicy, nostalgic." },
  { id: "k40", name: "Tomato Ketchup", category: "sauces", price: 99, originalPrice: 120, rating: 4.5, reviews: 610, stock: 52, unit: "950 g", image: img("photo-1472476443507-c7a5948772fc"), description: "Thick, tangy tomato ketchup for pakoras, rolls and tiffins." },
  { id: "k41", name: "Dishwashing Liquid", category: "cleaning", price: 115, originalPrice: 139, rating: 4.6, reviews: 480, stock: 60, unit: "500 ml", image: img("photo-1563453392212-326f5e854473"), description: "Lemon-fresh gel that cuts grease fast. Gentle on hands." },
  { id: "k42", name: "Laundry Detergent", category: "cleaning", price: 128, originalPrice: 150, rating: 4.5, reviews: 390, stock: 55, unit: "1 kg", image: img("photo-1528740561666-dc2479dc08ab"), description: "Bright-clean powder with stain lifters for daily family laundry." },
  { id: "k43", name: "Floor Cleaner", category: "cleaning", price: 105, originalPrice: 125, rating: 4.4, reviews: 260, stock: 47, unit: "975 ml", image: img("photo-1528740561666-dc2479dc08ab"), description: "Pine-fresh disinfectant cleaner for sparkling, germ-free floors." },
  { id: "k44", name: "Bath Soap Bar", category: "personal", price: 42, originalPrice: 52, rating: 4.6, reviews: 700, stock: 90, unit: "125 g", image: img("photo-1556228720-195a672e8a03"), description: "Creamy sandalwood soap for soft, nourished skin." },
  { id: "k45", name: "Herbal Shampoo", category: "personal", price: 189, originalPrice: 229, rating: 4.5, reviews: 450, stock: 38, unit: "650 ml", image: img("photo-1571781926291-c477ebfd024b"), description: "Amla-shikakai shampoo for strong, shiny, healthy hair." },
  { id: "k46", name: "Mint Toothpaste", category: "personal", price: 98, originalPrice: 115, rating: 4.6, reviews: 530, stock: 66, unit: "200 g", image: img("photo-1556228578-8c89e6adf883"), description: "Fresh-mint toothpaste for all-day freshness and cavity protection." },
  { id: "k47", name: "Incense Sticks", category: "pooja", price: 65, originalPrice: 80, rating: 4.7, reviews: 410, stock: 72, unit: "100 sticks", image: img("photo-1608571423902-eed4a5ad8108"), description: "Long-burning sandal agarbatti for daily pooja and calm evenings." },
  { id: "k48", name: "Pooja Cotton Wicks", category: "pooja", price: 35, originalPrice: 45, rating: 4.5, reviews: 230, stock: 84, unit: "100 pcs", image: img("photo-1602928321679-560bb453f190"), description: "Hand-rolled cotton batti for diyas. Burns even and steady." },
  { id: "m01", name: "Kashmiri Chilli Powder", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 68, originalPrice: 85, rating: 4.6, reviews: 420, stock: 62, unit: "100 g", image: img("photo-1590301157890-4810ed352733"), description: "Vibrant, mild Kashmiri chillies for rich red colour without excess heat." },
  { id: "m02", name: "Cumin Powder", category: "spices", spiceType: "powder", brand: "FreshCart Select", price: 62, originalPrice: 78, rating: 4.5, reviews: 380, stock: 58, unit: "100 g", image: img("photo-1509358271058-acd22cc93898"), description: "Roasted jeera powder with earthy aroma for raita, chaas and chaat." },
  { id: "m03", name: "Black Pepper Powder", category: "spices", spiceType: "powder", brand: "SpiceRoute", price: 95, originalPrice: 120, rating: 4.7, reviews: 310, stock: 44, unit: "50 g", image: img("photo-1532336414038-cf19250c5757"), description: "Coarse-ground Malabar kali mirch with sharp, woody heat." },
  { id: "m04", name: "Chaat Masala", category: "spices", spiceType: "powder", brand: "FreshCart Select", price: 55, originalPrice: 70, rating: 4.6, reviews: 520, stock: 66, unit: "100 g", image: img("photo-1590301157890-4810ed352733"), description: "Tangy amchur-forward blend that lifts chaat, fruits and fries.", bestseller: true },
  { id: "m05", name: "Chole Masala", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 58, originalPrice: 72, rating: 4.6, reviews: 440, stock: 60, unit: "100 g", image: img("photo-1596040033229-a9821ebd058d"), description: "Dark, aromatic Amritsari-style blend for perfectly spiced chole." },
  { id: "m06", name: "Pav Bhaji Masala", category: "spices", spiceType: "powder", brand: "SpiceRoute", price: 62, originalPrice: 78, rating: 4.7, reviews: 390, stock: 52, unit: "100 g", image: img("photo-1532336414038-cf19250c5757"), description: "Buttery Mumbai-style blend for street-perfect pav bhaji at home." },
  { id: "m07", name: "Kitchen King Masala", category: "spices", spiceType: "powder", brand: "FreshCart Select", price: 64, originalPrice: 80, rating: 4.5, reviews: 350, stock: 56, unit: "100 g", image: img("photo-1509358271058-acd22cc93898"), description: "All-purpose sabzi masala for everyday dals, aloo and mixed veg." },
  { id: "m08", name: "Sambhar Masala", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 60, originalPrice: 75, rating: 4.6, reviews: 300, stock: 50, unit: "100 g", image: img("photo-1590301157890-4810ed352733"), description: "Lentil-and-spice roast ground fresh for authentic sambhar aroma." },
  { id: "m09", name: "Biryani Masala", category: "spices", spiceType: "powder", brand: "SpiceRoute", price: 58, originalPrice: 72, rating: 4.7, reviews: 410, stock: 48, unit: "50 g", image: img("photo-1532336414038-cf19250c5757"), description: "Fragrant dum-style blend with saffron notes for layered biryanis." },
  { id: "m10", name: "Chicken Masala", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 62, originalPrice: 78, rating: 4.5, reviews: 280, stock: 46, unit: "100 g", image: img("photo-1596040033229-a9821ebd058d"), description: "Bold, home-style blend for juicy chicken curries and tandoori." },
  { id: "m11", name: "Meat Masala", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 62, originalPrice: 78, rating: 4.5, reviews: 240, stock: 42, unit: "100 g", image: img("photo-1596040033229-a9821ebd058d"), description: "Deep, warming blend for slow-cooked mutton and keema." },
  { id: "m12", name: "Tea Masala", category: "spices", spiceType: "powder", brand: "FreshCart Select", price: 75, originalPrice: 95, rating: 4.7, reviews: 330, stock: 40, unit: "50 g", image: img("photo-1509358271058-acd22cc93898"), description: "Cardamom-ginger-clove crush for cutting chai with real spice." },
  { id: "m13", name: "Kasuri Methi", category: "spices", spiceType: "powder", brand: "SpiceRoute", price: 48, originalPrice: 60, rating: 4.6, reviews: 260, stock: 8, unit: "50 g", image: img("photo-1590301157890-4810ed352733"), description: "Sun-dried fenugreek leaves to finish dals, paneer-free curries and breads." },
  { id: "m14", name: "Hing Powder", category: "spices", spiceType: "powder", brand: "Kirana Gold", price: 110, originalPrice: 135, rating: 4.6, reviews: 190, stock: 0, unit: "50 g", image: img("photo-1532336414038-cf19250c5757"), description: "Strong compounded heeng — a pinch transforms dal and sambhar." },
  { id: "m15", name: "Mustard Seeds", category: "spices", spiceType: "whole", brand: "FreshCart Select", price: 48, originalPrice: 60, rating: 4.5, reviews: 360, stock: 64, unit: "200 g", image: img("photo-1509358271058-acd22cc93898"), description: "Bold black rai that crackles perfectly for tadka and pickles." },
  { id: "m16", name: "Coriander Seeds", category: "spices", spiceType: "whole", brand: "Kirana Gold", price: 56, originalPrice: 70, rating: 4.5, reviews: 290, stock: 58, unit: "200 g", image: img("photo-1590301157890-4810ed352733"), description: "Plump sabut dhania for fresh-ground masalas and pickles." },
  { id: "m17", name: "Black Peppercorns", category: "spices", spiceType: "whole", brand: "SpiceRoute", price: 120, originalPrice: 150, rating: 4.8, reviews: 350, stock: 38, unit: "100 g", image: img("photo-1532336414038-cf19250c5757"), description: "Bold Malabar kali mirch, graded for size and pungency.", bestseller: true },
  { id: "m18", name: "Green Cardamom", category: "spices", spiceType: "whole", brand: "SpiceRoute", price: 185, originalPrice: 230, rating: 4.9, reviews: 420, stock: 32, unit: "50 g", image: img("photo-1596040033229-a9821ebd058d"), description: "Plump 8mm+ Idukki elaichi for chai, kheer and biryani.", bestseller: true },
  { id: "m19", name: "Black Cardamom", category: "spices", spiceType: "whole", brand: "Kirana Gold", price: 95, originalPrice: 120, rating: 4.6, reviews: 210, stock: 36, unit: "50 g", image: img("photo-1509358271058-acd22cc93898"), description: "Smoky badi elaichi for dals, pulao and slow-cooked gravies." },
  { id: "m20", name: "Cloves", category: "spices", spiceType: "whole", brand: "SpiceRoute", price: 88, originalPrice: 110, rating: 4.7, reviews: 250, stock: 40, unit: "50 g", image: img("photo-1532336414038-cf19250c5757"), description: "Oily, hand-picked laung with intense aroma for garam masalas." },
  { id: "m21", name: "Cinnamon Sticks", category: "spices", spiceType: "whole", brand: "FreshCart Select", price: 72, originalPrice: 90, rating: 4.6, reviews: 230, stock: 46, unit: "100 g", image: img("photo-1590301157890-4810ed352733"), description: "Sweet, woody dalchini quills for pulao, chai and desserts." },
  { id: "m22", name: "Bay Leaves", category: "spices", spiceType: "whole", brand: "Kirana Gold", price: 42, originalPrice: 55, rating: 4.5, reviews: 180, stock: 52, unit: "50 g", image: img("photo-1509358271058-acd22cc93898"), description: "Aromatic tej patta for biryani, dal and slow tadkas." },
  { id: "m23", name: "Fennel Seeds", category: "spices", spiceType: "whole", brand: "FreshCart Select", price: 64, originalPrice: 80, rating: 4.5, reviews: 270, stock: 54, unit: "200 g", image: img("photo-1590301157890-4810ed352733"), description: "Sweet Lucknowi saunf for tadka, pickles and post-meal freshness." },
  { id: "m24", name: "Fenugreek Seeds", category: "spices", spiceType: "whole", brand: "Kirana Gold", price: 52, originalPrice: 65, rating: 4.5, reviews: 220, stock: 50, unit: "200 g", image: img("photo-1509358271058-acd22cc93898"), description: "Bitter-sweet methi dana for tadka, pickles and hair packs." },
  { id: "m25", name: "Carom Seeds", category: "spices", spiceType: "whole", brand: "FreshCart Select", price: 68, originalPrice: 85, rating: 4.6, reviews: 200, stock: 44, unit: "200 g", image: img("photo-1532336414038-cf19250c5757"), description: "Pungent ajwain for parathas, pakoras and digestive teas." },
  { id: "m26", name: "Nigella Seeds", category: "spices", spiceType: "whole", brand: "SpiceRoute", price: 58, originalPrice: 72, rating: 4.5, reviews: 170, stock: 6, unit: "100 g", image: img("photo-1590301157890-4810ed352733"), description: "Peppery kalonji for naan, pickles and Bengali tadka." },
  { id: "m27", name: "Dry Red Chillies", category: "spices", spiceType: "whole", brand: "Kirana Gold", price: 78, originalPrice: 95, rating: 4.6, reviews: 260, stock: 48, unit: "200 g", image: img("photo-1596040033229-a9821ebd058d"), description: "Sun-dried sabut lal mirch for tadka, chutneys and pickles." },
  { id: "m28", name: "Star Anise", category: "spices", spiceType: "whole", brand: "SpiceRoute", price: 105, originalPrice: 130, rating: 4.7, reviews: 150, stock: 30, unit: "50 g", image: img("photo-1532336414038-cf19250c5757"), description: "Liquorice-sweet chakri phool for biryani and garam masala." },
  { id: "m29", name: "Mace", category: "spices", spiceType: "whole", brand: "SpiceRoute", price: 140, originalPrice: 175, rating: 4.7, reviews: 130, stock: 28, unit: "50 g", image: img("photo-1509358271058-acd22cc93898"), description: "Delicate javitri blades for rich gravies and festive sweets." },
  { id: "m30", name: "Nutmeg", category: "spices", spiceType: "whole", brand: "Kirana Gold", price: 98, originalPrice: 125, rating: 4.6, reviews: 160, stock: 34, unit: "50 g", image: img("photo-1590301157890-4810ed352733"), description: "Whole fragrant jaiphal — grate fresh over sweets and chai." },
];

export const TESTIMONIALS = [
  { id: 1, name: "Priya Sharma", location: "Mumbai", rating: 5, text: "FreshCart is my neighbourhood kirana online. Atta, dal and spices arrive on time, and prices beat the local market!", color: "#16a34a" },
  { id: 2, name: "Rahul Verma", location: "Delhi", rating: 5, text: "One place for monthly ration — rice, oil, namkeen and even detergent. Packing is neat and delivery is quick.", color: "#f97316" },
  { id: 3, name: "Ananya Iyer", location: "Bengaluru", rating: 4, text: "Love the monthly essentials list. Biscuits, tea and pooja items in one order — so convenient!", color: "#14532d" },
];

export const HERO_IMAGE = img("photo-1578916171728-46686eac8d58");
export const OFFER_IMAGE = img("photo-1596040033229-a9821ebd058d");

export const FALLBACK_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#dcfce7"/><text x="50%" y="50%" font-family="sans-serif" font-size="36" font-weight="bold" fill="#14532d" text-anchor="middle" dominant-baseline="middle">FreshCart</text></svg>`
  );

export const handleImgError = (e) => {
  if (e?.currentTarget && e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

export const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
export const discountPct = (p) =>
  p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : 0;

// --- Admin demo persistence: merge persisted product/category edits into the
// live exported arrays so the storefront reflects admin changes. No backend.
function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

try {
  const overrides = readLS("freshcart_product_overrides", {});
  const custom = readLS("freshcart_custom_products", []);
  const deleted = new Set(readLS("freshcart_deleted_products", []));
  const merged = PRODUCTS.filter((p) => !deleted.has(p.id))
    .map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));
  custom.forEach((p) => {
    if (p && p.id && !deleted.has(p.id)) merged.push({ ...p });
  });
  PRODUCTS.length = 0;
  merged.forEach((p) => PRODUCTS.push(p));

  const cOverrides = readLS("freshcart_category_overrides", {});
  const cCustom = readLS("freshcart_custom_categories", []);
  const cDeleted = new Set(readLS("freshcart_deleted_categories", []));
  const cMerged = CATEGORIES.filter((c) => !cDeleted.has(c.id))
    .map((c) => (cOverrides[c.id] ? { ...c, ...cOverrides[c.id] } : c));
  cCustom.forEach((c) => {
    if (c && c.id && !cDeleted.has(c.id)) cMerged.push({ ...c });
  });
  CATEGORIES.length = 0;
  cMerged.forEach((c) => CATEGORIES.push(c));
} catch { /* demo hydration must never break the storefront */ }
