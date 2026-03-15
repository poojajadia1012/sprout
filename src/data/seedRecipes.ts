export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Recipe = {
  id: string;
  name: string;
  description: string;
  meal_type: MealType;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prep_time: number;   // minutes
  cook_time: number;   // minutes
  dietary_tags: string[];  // display tags: 'Vegetarian' | 'Vegan' | 'Gluten-free'
  allergens: string[];     // allergens this recipe CONTAINS — shown as a warning if user is allergic
  save_count: number;
};

export const MEAL_TYPE_GRADIENTS: Record<MealType, [string, string]> = {
  breakfast: ['#FEF08A', '#EAB308'],  // bright yellow → amber (distinct from orange CTA button)
  lunch:     ['#BBF7D0', '#16A34A'],  // light green → deep green
  dinner:    ['#C4B5FD', '#4F46E5'],  // soft lavender → deep indigo
  snack:     ['#FECDD3', '#F43F5E'],  // soft rose → coral
};

// Allergen names must exactly match the values in the user's health_profiles.allergens array.
// Reference list (14 major EU allergens):
// Gluten, Crustaceans, Eggs, Fish, Peanuts, Soybeans, Dairy, Tree nuts,
// Celery, Mustard, Sesame, Sulphites, Lupin, Molluscs

export const SEED_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Masala Oats Bowl',
    description: 'Savoury spiced oats with tomatoes, peas, and cumin — a warming high-fibre breakfast.',
    meal_type: 'breakfast',
    protein_g: 12, carbs_g: 38, fat_g: 6,
    prep_time: 5, cook_time: 10,
    dietary_tags: ['Vegan'],
    allergens: ['Gluten'],
    save_count: 0,
  },
  {
    id: '2',
    name: 'Greek Yoghurt Parfait',
    description: 'Creamy yoghurt layered with mixed berries, honey, and toasted granola.',
    meal_type: 'breakfast',
    protein_g: 18, carbs_g: 42, fat_g: 5,
    prep_time: 5, cook_time: 0,
    dietary_tags: ['Vegetarian', 'Gluten-free'],
    allergens: ['Dairy'],
    save_count: 0,
  },
  {
    id: '3',
    name: 'Avocado Toast with Poached Egg',
    description: 'Smashed avocado on sourdough with a perfectly poached egg and chilli flakes.',
    meal_type: 'breakfast',
    protein_g: 16, carbs_g: 28, fat_g: 18,
    prep_time: 5, cook_time: 8,
    dietary_tags: ['Vegetarian'],
    allergens: ['Gluten', 'Eggs'],
    save_count: 0,
  },
  {
    id: '4',
    name: 'Banana Peanut Butter Smoothie',
    description: 'Thick, creamy smoothie with banana, peanut butter, oat milk, and a dash of cinnamon.',
    meal_type: 'breakfast',
    protein_g: 14, carbs_g: 48, fat_g: 10,
    prep_time: 5, cook_time: 0,
    dietary_tags: ['Vegan'],
    allergens: ['Peanuts', 'Gluten'],
    save_count: 0,
  },
  {
    id: '5',
    name: 'Mediterranean Lentil Salad',
    description: 'Green lentils tossed with roasted peppers, olives, feta, and a lemon-herb dressing.',
    meal_type: 'lunch',
    protein_g: 22, carbs_g: 45, fat_g: 12,
    prep_time: 10, cook_time: 20,
    dietary_tags: ['Vegetarian', 'Gluten-free'],
    allergens: ['Dairy'],
    save_count: 0,
  },
  {
    id: '6',
    name: 'Spiced Chickpea Wrap',
    description: 'Crispy spiced chickpeas with tahini, pickled red onion, and rocket in a warm flatbread.',
    meal_type: 'lunch',
    protein_g: 18, carbs_g: 52, fat_g: 10,
    prep_time: 10, cook_time: 15,
    dietary_tags: ['Vegan'],
    allergens: ['Gluten', 'Sesame'],
    save_count: 0,
  },
  {
    id: '7',
    name: 'Miso Soup with Tofu & Noodles',
    description: 'Silken tofu, soba noodles, wakame, and spring onion in a rich umami miso broth.',
    meal_type: 'lunch',
    protein_g: 20, carbs_g: 40, fat_g: 7,
    prep_time: 5, cook_time: 10,
    dietary_tags: ['Vegan'],
    allergens: ['Soybeans', 'Gluten'],
    save_count: 0,
  },
  {
    id: '8',
    name: 'Caprese Quinoa Bowl',
    description: 'Fluffy quinoa with cherry tomatoes, fresh mozzarella, basil, and a balsamic glaze.',
    meal_type: 'lunch',
    protein_g: 24, carbs_g: 38, fat_g: 14,
    prep_time: 10, cook_time: 15,
    dietary_tags: ['Vegetarian', 'Gluten-free'],
    allergens: ['Dairy'],
    save_count: 0,
  },
  {
    id: '9',
    name: 'Thai Peanut Noodle Salad',
    description: 'Rice noodles, edamame, shredded carrot, and cucumber in a zesty peanut-lime dressing.',
    meal_type: 'lunch',
    protein_g: 16, carbs_g: 55, fat_g: 13,
    prep_time: 15, cook_time: 5,
    dietary_tags: ['Vegan', 'Gluten-free'],
    allergens: ['Peanuts', 'Soybeans'],
    save_count: 0,
  },
  {
    id: '10',
    name: 'Black Bean Tacos',
    description: 'Smoky black beans with charred corn, avocado, lime crema, and pickled jalapeños.',
    meal_type: 'lunch',
    protein_g: 20, carbs_g: 60, fat_g: 11,
    prep_time: 10, cook_time: 10,
    dietary_tags: ['Vegan', 'Gluten-free'],
    allergens: [],
    save_count: 0,
  },
  {
    id: '11',
    name: 'Paneer Tikka Masala',
    description: 'Tender paneer cubes simmered in a fragrant tomato-cream sauce with warm Indian spices.',
    meal_type: 'dinner',
    protein_g: 28, carbs_g: 30, fat_g: 18,
    prep_time: 15, cook_time: 25,
    dietary_tags: ['Vegetarian', 'Gluten-free'],
    allergens: ['Dairy'],
    save_count: 0,
  },
  {
    id: '12',
    name: 'Mushroom Risotto',
    description: 'Creamy Arborio rice with mixed wild mushrooms, parmesan, white wine, and fresh thyme.',
    meal_type: 'dinner',
    protein_g: 16, carbs_g: 62, fat_g: 14,
    prep_time: 10, cook_time: 30,
    dietary_tags: ['Vegetarian', 'Gluten-free'],
    allergens: ['Dairy'],
    save_count: 0,
  },
  {
    id: '13',
    name: 'Dal Tadka with Jeera Rice',
    description: 'Yellow lentils tempered with cumin, garlic, and dried chilli, served over fragrant jeera rice.',
    meal_type: 'dinner',
    protein_g: 22, carbs_g: 68, fat_g: 8,
    prep_time: 10, cook_time: 30,
    dietary_tags: ['Vegan', 'Gluten-free'],
    allergens: [],
    save_count: 0,
  },
  {
    id: '14',
    name: 'Eggplant Parmigiana',
    description: 'Layers of roasted aubergine, rich tomato sauce, and melted mozzarella, baked until golden.',
    meal_type: 'dinner',
    protein_g: 18, carbs_g: 35, fat_g: 16,
    prep_time: 20, cook_time: 35,
    dietary_tags: ['Vegetarian'],
    allergens: ['Dairy', 'Gluten'],
    save_count: 0,
  },
  {
    id: '15',
    name: 'Tofu Stir-Fry with Bok Choy',
    description: 'Crispy tofu and baby bok choy tossed in a ginger-sesame sauce over steamed jasmine rice.',
    meal_type: 'dinner',
    protein_g: 24, carbs_g: 45, fat_g: 12,
    prep_time: 10, cook_time: 15,
    dietary_tags: ['Vegan', 'Gluten-free'],
    allergens: ['Soybeans', 'Sesame'],
    save_count: 0,
  },
  {
    id: '16',
    name: 'Spinach & Ricotta Stuffed Pasta Shells',
    description: 'Jumbo pasta shells filled with spinach and ricotta, baked in a robust tomato-basil sauce.',
    meal_type: 'dinner',
    protein_g: 26, carbs_g: 55, fat_g: 14,
    prep_time: 15, cook_time: 30,
    dietary_tags: ['Vegetarian'],
    allergens: ['Gluten', 'Dairy'],
    save_count: 0,
  },
  {
    id: '17',
    name: 'Hummus & Veggie Plate',
    description: 'Smooth homemade hummus with warm pitta, carrot sticks, cucumber, and roasted peppers.',
    meal_type: 'snack',
    protein_g: 10, carbs_g: 32, fat_g: 9,
    prep_time: 10, cook_time: 0,
    dietary_tags: ['Vegan'],
    allergens: ['Sesame', 'Gluten'],
    save_count: 0,
  },
  {
    id: '18',
    name: 'Apple Slices with Almond Butter',
    description: 'Crisp apple slices paired with natural almond butter and a sprinkle of chia seeds.',
    meal_type: 'snack',
    protein_g: 6, carbs_g: 28, fat_g: 10,
    prep_time: 3, cook_time: 0,
    dietary_tags: ['Vegan', 'Gluten-free'],
    allergens: ['Tree nuts'],
    save_count: 0,
  },
  {
    id: '19',
    name: 'Cottage Cheese & Berries',
    description: 'Light, protein-packed cottage cheese topped with fresh strawberries and a drizzle of honey.',
    meal_type: 'snack',
    protein_g: 14, carbs_g: 18, fat_g: 3,
    prep_time: 3, cook_time: 0,
    dietary_tags: ['Vegetarian', 'Gluten-free'],
    allergens: ['Dairy'],
    save_count: 0,
  },
  {
    id: '20',
    name: 'Roasted Chickpeas',
    description: 'Crispy oven-roasted chickpeas seasoned with smoked paprika, cumin, and sea salt.',
    meal_type: 'snack',
    protein_g: 8, carbs_g: 22, fat_g: 5,
    prep_time: 5, cook_time: 25,
    dietary_tags: ['Vegan', 'Gluten-free'],
    allergens: [],
    save_count: 0,
  },
];
