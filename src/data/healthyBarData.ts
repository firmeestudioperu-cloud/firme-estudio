export type HealthyBarCategory =
  | 'todos'
  | 'batidos_proteina'
  | 'jugos_detox'
  | 'cafeteria_te'
  | 'hidratacion'
  | 'barras_snacks'
  | 'bowls_yogur'
  | 'frutas_frutos_secos'
  | 'sandwiches_wraps'
  | 'ensaladas';

export type DietaryTag = 'vegano' | 'sin_azucar' | 'sin_gluten' | 'proteico' | 'keto' | 'organico';

export interface HealthyBarProduct {
  id: string;
  name: string;
  category: HealthyBarCategory;
  price: number; // en Soles (PEN)
  description: string;
  image: string;
  allergens: string[];
  dietaryTags: DietaryTag[];
  isAvailable: boolean;
  stock: number;
  calories?: number;
  proteinGrams?: number;
}

export interface HealthyConsumptionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StudentConsumptionRecord {
  id: string;
  clientDni: string;
  clientName: string;
  roomId: string;
  roomName: string;
  items: HealthyConsumptionItem[];
  totalAmount: number;
  discountApplied: number; // Descuento por membresía
  finalAmount: number;
  paymentMethod: 'cuenta_interna' | 'yape' | 'pos' | 'efectivo';
  paymentStatus: 'pagado' | 'pendiente_en_cuenta';
  createdAt: string; // ISO / legible
}

export const HEALTHY_BAR_CATEGORIES: Array<{ id: HealthyBarCategory; label: string; icon: string }> = [
  { id: 'todos', label: 'Todo el Menú', icon: '✨' },
  { id: 'batidos_proteina', label: 'Batidos Proteicos', icon: '🥤' },
  { id: 'jugos_detox', label: 'Jugos & Detox', icon: '🌿' },
  { id: 'cafeteria_te', label: 'Café & Matcha', icon: '☕' },
  { id: 'hidratacion', label: 'Hidratación & Kombucha', icon: '💧' },
  { id: 'bowls_yogur', label: 'Bowls & Yogur', icon: '🥣' },
  { id: 'barras_snacks', label: 'Barras & Snacks', icon: '🍫' },
  { id: 'frutas_frutos_secos', label: 'Frutos Secos', icon: '🥜' },
  { id: 'sandwiches_wraps', label: 'Wraps & Tostadas', icon: '🥪' },
  { id: 'ensaladas', label: 'Ensaladas Saludables', icon: '🥗' },
];

export const INITIAL_HEALTHY_BAR_PRODUCTS: HealthyBarProduct[] = [
  // 1. Batidos de frutas y proteína
  {
    id: 'hb-1',
    name: 'Reformer Power Shake (Whey Isolate)',
    category: 'batidos_proteina',
    price: 18.0,
    description: 'Batido post-entreno con proteína aislada de vainilla, plátano de seda, leche de almendras y semillas de chía.',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
    allergens: ['Almendras'],
    dietaryTags: ['sin_azucar', 'proteico', 'sin_gluten'],
    isAvailable: true,
    stock: 24,
    calories: 260,
    proteinGrams: 27,
  },
  {
    id: 'hb-2',
    name: 'Wild Berry Antioxidant Smoothie',
    category: 'batidos_proteina',
    price: 16.0,
    description: 'Arándanos frescos, fresas andinas, proteína vegetal de arveja orgánica y agua de coco purificada.',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_gluten', 'sin_azucar', 'proteico'],
    isAvailable: true,
    stock: 18,
    calories: 210,
    proteinGrams: 20,
  },
  {
    id: 'hb-3',
    name: 'Choco-Peanut Recovery Shake',
    category: 'batidos_proteina',
    price: 19.0,
    description: 'Cacao puro al 100% de Cusco, mantequilla artesanal de maní sin azúcar y proteína concentrada.',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=80',
    allergens: ['Maní'],
    dietaryTags: ['sin_gluten', 'proteico', 'keto'],
    isAvailable: true,
    stock: 15,
    calories: 320,
    proteinGrams: 30,
  },

  // 2. Jugos naturales y bebidas detox
  {
    id: 'hb-4',
    name: 'Green Tonic Detox (Espinaca & Manzana)',
    category: 'jugos_detox',
    price: 14.0,
    description: 'Extracto prensado en frío con espinaca baby, pepino japonés, manzana verde criolla, jengibre y limón tahití.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_azucar', 'sin_gluten', 'organico'],
    isAvailable: true,
    stock: 30,
    calories: 95,
    proteinGrams: 2,
  },
  {
    id: 'hb-5',
    name: 'Golden Glow (Naranja, Zanahoria & Cúrcuma)',
    category: 'jugos_detox',
    price: 13.0,
    description: 'Zumo recién exprimido de naranjas huando, zanahoria bio, cúrcuma fresca y una pizca de pimienta cayena activadora.',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_azucar', 'sin_gluten'],
    isAvailable: true,
    stock: 20,
    calories: 120,
    proteinGrams: 2,
  },

  // 3. Café, té, infusiones y matcha
  {
    id: 'hb-6',
    name: 'Matcha Latte Ceremonial (Grado A)',
    category: 'cafeteria_te',
    price: 15.0,
    description: 'Matcha ceremonial japonés batido al estilo tradicional con leche vegetal de avena sin gluten o almendra.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
    allergens: ['Avena / Almendras según elección'],
    dietaryTags: ['vegano', 'sin_azucar', 'organico'],
    isAvailable: true,
    stock: 35,
    calories: 80,
    proteinGrams: 3,
  },
  {
    id: 'hb-7',
    name: 'Café de Especialidad Villa Rica (Americano / Espresso)',
    category: 'cafeteria_te',
    price: 9.0,
    description: 'Café de origen único tostado medio de Villa Rica (86 pts SCA), notas a chocolate amargo y frutos rojos.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_azucar', 'keto', 'sin_gluten'],
    isAvailable: true,
    stock: 50,
    calories: 5,
    proteinGrams: 0,
  },
  {
    id: 'hb-8',
    name: 'Infusión Calm & Flow (Manzanilla, Lavanda & Menta)',
    category: 'cafeteria_te',
    price: 8.0,
    description: 'Flores enteras de manzanilla deshidratada, pétalos de lavanda orgánica y hojas frescas de menta andina.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_azucar', 'sin_gluten', 'organico'],
    isAvailable: true,
    stock: 40,
    calories: 2,
    proteinGrams: 0,
  },

  // 4. Agua, bebidas isotónicas y kombucha
  {
    id: 'hb-9',
    name: 'Kombucha Artesanal Arándano & Jengibre 330ml',
    category: 'hidratacion',
    price: 13.5,
    description: 'Té fermentado naturalmente con probióticos vivos para la salud digestiva y energía limpia.',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_gluten', 'organico'],
    isAvailable: true,
    stock: 28,
    calories: 45,
    proteinGrams: 1,
  },
  {
    id: 'hb-10',
    name: 'Agua Alcalina FIRME Mineralizada 750ml',
    category: 'hidratacion',
    price: 6.0,
    description: 'Agua purificada pH 8.5 en botella deportiva reciclable con electrolitos de magnesio y potasio.',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['vegano', 'sin_azucar', 'sin_gluten'],
    isAvailable: true,
    stock: 60,
    calories: 0,
    proteinGrams: 0,
  },

  // 5. Barras energéticas o proteicas
  {
    id: 'hb-11',
    name: 'Barra Proteica FIRME 20g (Cacao & Nibs)',
    category: 'barras_snacks',
    price: 11.0,
    description: 'Barra con 20g de proteína de suero, dátiles medjool, almendras tostadas y nibs de cacao orgánico.',
    image: 'https://images.unsplash.com/photo-1622484216834-09945391a84f?w=500&auto=format&fit=crop&q=80',
    allergens: ['Almendras', 'Lácteos'],
    dietaryTags: ['sin_gluten', 'sin_azucar', 'proteico'],
    isAvailable: true,
    stock: 35,
    calories: 220,
    proteinGrams: 20,
  },

  // 6. Yogur con granola y frutas
  {
    id: 'hb-12',
    name: 'Greek Yogurt & Berry Bowl',
    category: 'bowls_yogur',
    price: 17.0,
    description: 'Yogur griego natural sin azúcar, granola artesanal horneada con miel de abeja orgánica, fresas y arándanos.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
    allergens: ['Lácteos', 'Avena'],
    dietaryTags: ['proteico', 'sin_azucar'],
    isAvailable: true,
    stock: 14,
    calories: 280,
    proteinGrams: 18,
  },

  // 7. Frutas y frutos secos
  {
    id: 'hb-13',
    name: 'Mix de Frutos Secos Activos 120g',
    category: 'frutas_frutos_secos',
    price: 12.0,
    description: 'Almendras sin sal, nueces de nogal, castañas de Madre de Dios y arándanos deshidratados.',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=80',
    allergens: ['Nueces', 'Almendras', 'Castañas'],
    dietaryTags: ['vegano', 'sin_gluten', 'sin_azucar', 'keto'],
    isAvailable: true,
    stock: 22,
    calories: 190,
    proteinGrams: 6,
  },

  // 8. Sándwiches, wraps y tostadas integrales
  {
    id: 'hb-14',
    name: 'Wrap Integral de Pavo & Palta Fuerte',
    category: 'sandwiches_wraps',
    price: 21.0,
    description: 'Tortilla de trigo integral con pechuga de pavo horneada a las finas hierbas, palta hass en rodajas y queso ricotta bio.',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80',
    allergens: ['Gluten', 'Lácteos'],
    dietaryTags: ['proteico'],
    isAvailable: true,
    stock: 10,
    calories: 340,
    proteinGrams: 24,
  },

  // 9. Ensaladas y bowls saludables
  {
    id: 'hb-15',
    name: 'Quinoa Zen Bowl con Pollo a la Plancha',
    category: 'ensaladas',
    price: 24.0,
    description: 'Quinua tricolor orgánica de Puno, pechuga de pollo marinada en limón, tomates cherry, espinaca y vinagreta de maracuyá.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
    allergens: [],
    dietaryTags: ['sin_gluten', 'proteico', 'sin_azucar'],
    isAvailable: true,
    stock: 8,
    calories: 390,
    proteinGrams: 32,
  },
];

export const INITIAL_CONSUMPTION_HISTORY: StudentConsumptionRecord[] = [
  {
    id: 'cons-1',
    clientDni: '70112233',
    clientName: 'Valentino R.',
    roomId: 'sala-1',
    roomName: 'Sala 1 Reformer',
    items: [
      {
        productId: 'hb-1',
        productName: 'Reformer Power Shake (Whey Isolate)',
        quantity: 1,
        unitPrice: 18.0,
        subtotal: 18.0,
      },
    ],
    totalAmount: 18.0,
    discountApplied: 1.8,
    finalAmount: 16.2,
    paymentMethod: 'cuenta_interna',
    paymentStatus: 'pendiente_en_cuenta',
    createdAt: 'Hoy, 07:15 AM',
  },
  {
    id: 'cons-2',
    clientDni: '70889912',
    clientName: 'Sofía Valdivia',
    roomId: 'sala-1',
    roomName: 'Sala 1 Reformer',
    items: [
      {
        productId: 'hb-6',
        productName: 'Matcha Latte Ceremonial (Grado A)',
        quantity: 1,
        unitPrice: 15.0,
        subtotal: 15.0,
      },
      {
        productId: 'hb-11',
        productName: 'Barra Proteica FIRME 20g',
        quantity: 1,
        unitPrice: 11.0,
        subtotal: 11.0,
      },
    ],
    totalAmount: 26.0,
    discountApplied: 2.6,
    finalAmount: 23.4,
    paymentMethod: 'yape',
    paymentStatus: 'pagado',
    createdAt: 'Hoy, 08:05 AM',
  },
];
