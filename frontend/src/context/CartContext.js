import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { validateCartData } from '../utils/validation';

// Cart context
const CartContext = createContext();

// Initial state
const initialState = {
  cart: [],
  wishlist: [],
  loading: false,
  error: null
};

// Action types
const CART_ACTIONS = {
  CART_START: 'CART_START',
  CART_SUCCESS: 'CART_SUCCESS',
  CART_FAILURE: 'CART_FAILURE',
  ADD_TO_CART_SUCCESS: 'ADD_TO_CART_SUCCESS',
  UPDATE_CART_SUCCESS: 'UPDATE_CART_SUCCESS',
  REMOVE_FROM_CART_SUCCESS: 'REMOVE_FROM_CART_SUCCESS',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  WISHLIST_SUCCESS: 'WISHLIST_SUCCESS',
  ADD_TO_WISHLIST_SUCCESS: 'ADD_TO_WISHLIST_SUCCESS',
  REMOVE_FROM_WISHLIST_SUCCESS: 'REMOVE_FROM_WISHLIST_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.CART_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CART_ACTIONS.CART_SUCCESS:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null
      };

    case CART_ACTIONS.WISHLIST_SUCCESS:
      return {
        ...state,
        wishlist: action.payload,
        loading: false,
        error: null
      };

    case CART_ACTIONS.ADD_TO_CART_SUCCESS:
    case CART_ACTIONS.UPDATE_CART_SUCCESS:
    case CART_ACTIONS.REMOVE_FROM_CART_SUCCESS:
    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null
      };

    case CART_ACTIONS.ADD_TO_WISHLIST_SUCCESS:
    case CART_ACTIONS.REMOVE_FROM_WISHLIST_SUCCESS:
      return {
        ...state,
        wishlist: action.payload,
        loading: false,
        error: null
      };

    case CART_ACTIONS.CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { api, isAuthenticated } = useAuth();

  // Load cart
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.get('/users/cart');
      dispatch({
        type: CART_ACTIONS.CART_SUCCESS,
        payload: response.data.data.cart
      });
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to load cart'
      });
    }
  }, [api]);

  // Load wishlist
  const loadWishlist = useCallback(async () => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.get('/users/wishlist');
      dispatch({
        type: CART_ACTIONS.WISHLIST_SUCCESS,
        payload: response.data.data.wishlist
      });
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to load wishlist'
      });
    }
  }, [api]);

  // Load cart on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadWishlist();
    } else {
      dispatch({ type: CART_ACTIONS.CART_SUCCESS, payload: [] });
      dispatch({ type: CART_ACTIONS.WISHLIST_SUCCESS, payload: [] });
    }
  }, [isAuthenticated, loadCart, loadWishlist]);

  // Add to cart
  const addToCart = async (productId, quantity, size, type = 'purchase', rentalPeriod = null) => {
    try {
      console.log('🛒 CartContext: Adding to cart:', { productId, quantity, size, type, rentalPeriod });
      
      // Validate inputs using centralized validation
      const validation = validateCartData(productId, quantity, size, type, rentalPeriod);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      dispatch({ type: CART_ACTIONS.CART_START });
      
      const response = await api.post('/users/cart', {
        productId,
        quantity,
        size,
        type,
        rentalPeriod: type === 'rental' ? rentalPeriod : undefined
      });
      
      console.log('✅ CartContext: Add to cart response:', response.data);
      
      dispatch({
        type: CART_ACTIONS.ADD_TO_CART_SUCCESS,
        payload: response.data.data.cart
      });
      return { success: true };
    } catch (error) {
      console.error('❌ CartContext: Add to cart error:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to add to cart';
      
      if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Show specific validation errors
          const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
          errorMessage = `Validation failed: ${validationErrors}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: errorMessage
      });
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Update cart item
  const updateCartItem = async (itemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.put(`/users/cart/${itemId}`, { quantity });
      dispatch({
        type: CART_ACTIONS.UPDATE_CART_SUCCESS,
        payload: response.data.data.cart
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to update cart'
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update cart' 
      };
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.delete(`/users/cart/${itemId}`);
      dispatch({
        type: CART_ACTIONS.REMOVE_FROM_CART_SUCCESS,
        payload: response.data.data.cart
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to remove from cart'
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove from cart' 
      };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.delete('/users/cart');
      dispatch({
        type: CART_ACTIONS.CLEAR_CART_SUCCESS,
        payload: response.data.data.cart
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to clear cart'
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to clear cart' 
      };
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.post('/users/wishlist', { productId });
      dispatch({
        type: CART_ACTIONS.ADD_TO_WISHLIST_SUCCESS,
        payload: response.data.data.wishlist
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to add to wishlist'
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to wishlist' 
      };
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.CART_START });
      const response = await api.delete(`/users/wishlist/${productId}`);
      dispatch({
        type: CART_ACTIONS.REMOVE_FROM_WISHLIST_SUCCESS,
        payload: response.data.data.wishlist
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.CART_FAILURE,
        payload: error.response?.data?.message || 'Failed to remove from wishlist'
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove from wishlist' 
      };
    }
  };

  // Check if product is in cart
  const isInCart = useCallback((productId) => {
    return state.cart.some(item => item.product._id === productId);
  }, [state.cart]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return state.wishlist.some(item => item._id === productId);
  }, [state.wishlist]);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  }, [state.cart]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => {
      const price = item.type === 'rental' 
        ? item.product.price.rental[item.rentalPeriod] || 0
        : item.product.price.purchase;
      return total + (price * item.quantity);
    }, 0);
  }, [state.cart]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    loadCart,
    loadWishlist,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInCart,
    isInWishlist,
    getCartItemCount,
    getCartTotal,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
