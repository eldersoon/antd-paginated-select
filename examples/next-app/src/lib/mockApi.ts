/**
 * Mock API to simulate server-side data fetching
 *
 * This module provides realistic mock data and API functions to demonstrate
 * the PaginatedSelect component functionality. In a real application,
 * you would replace these with actual API calls to your backend.
 */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
};

// Generate mock users
const generateUsers = (count: number): User[] => {
  const roles = ["admin", "user", "moderator", "guest"];
  const firstNames = [
    "John",
    "Jane",
    "Bob",
    "Alice",
    "Charlie",
    "Diana",
    "Eva",
    "Frank",
    "Grace",
    "Henry",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName =
      lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${
      i > 99 ? i : ""
    }@example.com`;

    return {
      id: `user-${i + 1}`,
      name,
      email,
      role: roles[i % roles.length],
    };
  });
};

// Generate mock products
const generateProducts = (count: number): Product[] => {
  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Beauty",
    "Toys",
    "Automotive",
  ];
  const productNames = [
    "Premium Wireless Headphones",
    "Organic Cotton T-Shirt",
    "JavaScript Guide Book",
    "Garden Hose Set",
    "Running Shoes",
    "Face Moisturizer",
    "Building Blocks Set",
    "Car Phone Mount",
    "Bluetooth Speaker",
    "Denim Jeans",
    "Python Cookbook",
    "Plant Fertilizer",
    "Yoga Mat",
    "Vitamin C Serum",
    "Action Figure",
    "Dash Camera",
    "Laptop Stand",
    "Hoodie Sweater",
    "Design Patterns Book",
    "Watering Can",
    "Basketball",
    "Sunscreen Lotion",
    "Board Game",
    "Air Freshener",
  ];

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length];
    const baseName = productNames[i % productNames.length];
    const name =
      i >= productNames.length
        ? `${baseName} ${Math.floor(i / productNames.length) + 1}`
        : baseName;

    return {
      id: `product-${i + 1}`,
      name,
      category,
      price: Math.floor(Math.random() * 500) + 10,
      inStock: Math.random() > 0.1, // 90% chance of being in stock
    };
  });
};

const USERS = generateUsers(500);
const PRODUCTS = generateProducts(200);

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockUserAPI = {
  async getUsers({
    page = 1,
    limit = 10,
    search = "",
    role,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    await delay(300 + Math.random() * 200); // 300-500ms delay

    let filteredUsers = USERS;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const users = filteredUsers.slice(start, end);

    return {
      users,
      total: filteredUsers.length,
      page,
      limit,
    };
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(100 + Math.random() * 100); // 100-200ms delay
    return USERS.find((user) => user.id === id) || null;
  },

  async getUsersByIds(ids: string[]): Promise<User[]> {
    await delay(150 + Math.random() * 100); // 150-250ms delay
    return USERS.filter((user) => ids.includes(user.id));
  },
};

export const mockProductAPI = {
  async getProducts({
    page = 1,
    limit = 10,
    search = "",
    category,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    await delay(400 + Math.random() * 300); // 400-700ms delay

    let filteredProducts = PRODUCTS;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const products = filteredProducts.slice(start, end);
    const hasMore = end < filteredProducts.length;

    return {
      products,
      hasMore,
      page,
      limit,
    };
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(100 + Math.random() * 100); // 100-200ms delay
    return PRODUCTS.find((product) => product.id === id) || null;
  },
};
