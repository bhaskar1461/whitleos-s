export const INDIAN_DISHES = [
  { id: "idli", name: "Idli", category: "Breakfast", calories: 58, serving: "1 piece" },
  { id: "masala-dosa", name: "Masala Dosa", category: "Breakfast", calories: 387, serving: "1 dosa" },
  { id: "poha", name: "Poha", category: "Breakfast", calories: 250, serving: "1 bowl" },
  { id: "aloo-paratha", name: "Aloo Paratha", category: "Breakfast", calories: 290, serving: "1 paratha" },
  { id: "dal-tadka", name: "Dal Tadka", category: "Main Veg", calories: 220, serving: "1 cup" },
  { id: "paneer-butter-masala", name: "Paneer Butter Masala", category: "Main Veg", calories: 390, serving: "1 cup" },
  { id: "chana-masala", name: "Chana Masala", category: "Main Veg", calories: 280, serving: "1 cup" },
  { id: "butter-chicken", name: "Butter Chicken", category: "Main Non-Veg", calories: 490, serving: "1 cup" },
  { id: "chicken-biryani", name: "Chicken Biryani", category: "Rice", calories: 520, serving: "1 cup" },
  { id: "jeera-rice", name: "Jeera Rice", category: "Rice", calories: 250, serving: "1 cup" },
  { id: "naan", name: "Naan", category: "Bread", calories: 260, serving: "1 naan" },
  { id: "roti", name: "Roti", category: "Bread", calories: 110, serving: "1 roti" },
  { id: "pav-bhaji", name: "Pav Bhaji", category: "Snacks", calories: 410, serving: "1 plate" },
  { id: "dhokla", name: "Dhokla", category: "Snacks", calories: 160, serving: "4 pieces" },
  { id: "gulab-jamun", name: "Gulab Jamun", category: "Sweets", calories: 150, serving: "1 piece" },
  { id: "rasmalai", name: "Rasmalai", category: "Sweets", calories: 250, serving: "1 piece" },
  { id: "sweet-lassi", name: "Sweet Lassi", category: "Drinks", calories: 220, serving: "1 glass" },
  { id: "coconut-water", name: "Coconut Water", category: "Drinks", calories: 45, serving: "1 glass" },
] as const;

export const DISH_CATEGORIES = ["All", ...new Set(INDIAN_DISHES.map((dish) => dish.category))];
