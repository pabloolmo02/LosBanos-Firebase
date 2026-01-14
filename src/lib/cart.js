
export const getCart = () => {
  const cart = localStorage.getItem('quimxel_cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity
    });
  }

  localStorage.setItem('quimxel_cart', JSON.stringify(cart));
  return cart;
};

export const updateCartItemQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('quimxel_cart', JSON.stringify(cart));
  }
  
  return cart;
};

export const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('quimxel_cart', JSON.stringify(cart));
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem('quimxel_cart');
  return [];
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};
