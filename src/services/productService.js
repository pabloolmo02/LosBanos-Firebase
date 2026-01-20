
import { getProducts, getProductById as getLocalProductById, getProductsByCategory as getLocalProductsByCategory } from '@/lib/products';

export const getAllProducts = async () => {
  // Simulamos una promesa para mantener compatibilidad con componentes que esperan async
  return new Promise((resolve) => {
    resolve(getProducts());
  });
};

export const getProductById = async (id) => {
  return new Promise((resolve) => {
    resolve(getLocalProductById(id));
  });
};

export const getProductsByCategory = async (category) => {
  return new Promise((resolve) => {
    resolve(getLocalProductsByCategory(category));
  });
};

export const seedDatabase = async () => {
  console.log("Seed database function disabled in local mode.");
};
