export const mockProducts = [
  {
    id: 1,
    title: "Choco Chip Cookies",
    price: "199.00",
    original_price: "249.00",
    rating: 4.8,
    reviews_count: 124,
    stock: 45,
    category: "biscuits",
    description: "Experience the ultimate indulgence with our Premium Choco Chip Cookies. Baked to perfection, these cookies feature a crispy golden exterior and a chewy, melt-in-your-mouth center loaded with rich, dark chocolate chips.",
    image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"
    ],
    is_bestseller: true,
    is_new_arrival: false,
    specifications: [
      { label: "Brand", value: "Crunch Bakery" },
      { label: "Weight", value: "500g" },
      { label: "Dietary Preference", value: "Vegetarian" }
    ]
  },
  {
    id: 2,
    title: "Spicy Masala Kurkure",
    price: "45.00",
    original_price: "50.00",
    rating: 4.5,
    reviews_count: 89,
    stock: 120,
    category: "kurkure",
    description: "Crunchy, spicy, and absolutely addictive! Our Spicy Masala Kurkure is made with the finest ingredients and a secret blend of Indian spices to satisfy your evening snack cravings.",
    image_url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80"
    ],
    is_new_arrival: true,
    is_bestseller: false,
    specifications: [
      { label: "Brand", value: "Crunch Snacks" },
      { label: "Weight", value: "100g" },
      { label: "Flavor", value: "Spicy Masala" }
    ]
  },
  {
    id: 3,
    title: "Black Forest Cake",
    price: "599.00",
    original_price: "699.00",
    rating: 4.9,
    reviews_count: 215,
    stock: 5,
    category: "cakes",
    description: "A classic Black Forest cake with layers of moist chocolate sponge, whipped cream, and tart cherries, topped with chocolate shavings. Perfect for birthdays and celebrations.",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      "https://images.unsplash.com/photo-1557925923-33b251d592cd?w=800&q=80"
    ],
    is_bestseller: true,
    is_new_arrival: false,
    specifications: [
      { label: "Brand", value: "Crunch Bakery" },
      { label: "Weight", value: "1kg" },
      { label: "Type", value: "Eggless available" }
    ]
  },
  {
    id: 4,
    title: "Mega Family Snack Combo",
    price: "349.00",
    original_price: "450.00",
    rating: 4.7,
    reviews_count: 56,
    stock: 25,
    category: "combos",
    description: "Get the best of everything in one giant pack! Includes assorted biscuits, namkeen, and kurkure. The perfect combo for family movie nights or weekend get-togethers.",
    image_url: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80"
    ],
    is_bestseller: true,
    is_new_arrival: false,
    specifications: [
      { label: "Brand", value: "Crunch Bundles" },
      { label: "Contains", value: "4 Biscuits, 3 Snacks" }
    ]
  },
  {
    id: 5,
    title: "Butter Delight Biscuits",
    price: "120.00",
    original_price: "150.00",
    rating: 4.6,
    reviews_count: 78,
    stock: 60,
    category: "biscuits",
    description: "Rich, buttery cookies that melt in your mouth. Baked using traditional recipes with 100% pure butter.",
    image_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80"
    ],
    is_new_arrival: true,
    is_bestseller: false,
    specifications: [
      { label: "Brand", value: "Crunch Bakery" },
      { label: "Weight", value: "400g" }
    ]
  },
  {
    id: 6,
    title: "Tangy Tomato Kurkure",
    price: "45.00",
    original_price: "50.00",
    rating: 4.3,
    reviews_count: 42,
    stock: 0,
    category: "kurkure",
    description: "A tangy and sweet tomato twist to your favorite crunchy snack. Kids love it, and adults can't stop eating it!",
    image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
    images: [
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80"
    ],
    is_new_arrival: false,
    is_bestseller: false,
    specifications: [
      { label: "Brand", value: "Crunch Snacks" },
      { label: "Weight", value: "100g" },
      { label: "Flavor", value: "Tangy Tomato" }
    ]
  }
];

// Reusable mock reviews
export const mockReviews = [
  { id: 1, user: "Aisha K.", rating: 5, date: "Oct 12, 2026", comment: "Absolutely delicious! Highly recommended." },
  { id: 2, user: "Rohan M.", rating: 4, date: "Sep 28, 2026", comment: "Great taste, fast delivery." },
  { id: 3, user: "Priya S.", rating: 5, date: "Sep 15, 2026", comment: "Best snacks we've ordered online by far." }
];
