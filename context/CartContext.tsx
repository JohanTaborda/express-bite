'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ProductOutputDTO, OrderOutputDTO } from '@/lib/clean-architecture/application/dtos/OrderDTO';

export interface CartItem {
  product: ProductOutputDTO;
  quantity: number;
  customizations?: string;
}

export type ActiveTab = 'menu-y-catalogo' | 'mis-pedidos' | 'pagar-y-carrito' | 'clean-arch';

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductOutputDTO, quantity?: number, customizations?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  studentBalance: number;
  rechargeBalance: (amount: number) => void;

  activeOrder: OrderOutputDTO | null;
  setActiveOrder: (order: OrderOutputDTO | null) => void;
  allOrders: OrderOutputDTO[];
  refreshOrders: () => Promise<void>;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu-y-catalogo');
  const [studentBalance, setStudentBalance] = useState<number>(24500);
  const [activeOrder, setActiveOrder] = useState<OrderOutputDTO | null>(null);
  const [allOrders, setAllOrders] = useState<OrderOutputDTO[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/student/balance?studentId=2021-4892');
      const data = await res.json();
      if (data.success && typeof data.balance === 'number') {
        setStudentBalance(data.balance);
      }
    } catch {
      // Fallback
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllOrders(json.data);
        // Find active order (in status RECEIVED or PREPARING or READY)
        const currentActive = json.data.find(
          (o: OrderOutputDTO) => o.status === 'PREPARING' || o.status === 'RECEIVED' || o.status === 'READY'
        );
        if (currentActive) {
          setActiveOrder(currentActive);
        } else if (json.data.length > 0) {
          setActiveOrder(json.data[0]);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Initialize seed orders and initial cart from API or seed
  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      try {
        const [ordersRes, balanceRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/student/balance?studentId=2021-4892'),
        ]);
        const ordersJson = await ordersRes.json();
        const balanceJson = await balanceRes.json();
        if (!isMounted) return;

        if (ordersJson.success && Array.isArray(ordersJson.data)) {
          setAllOrders(ordersJson.data);
          const currentActive = ordersJson.data.find(
            (o: OrderOutputDTO) => o.status === 'PREPARING' || o.status === 'RECEIVED' || o.status === 'READY'
          );
          if (currentActive) {
            setActiveOrder(currentActive);
          } else if (ordersJson.data.length > 0) {
            setActiveOrder(ordersJson.data[0]);
          }
        }
        if (balanceJson.success && typeof balanceJson.balance === 'number') {
          setStudentBalance(balanceJson.balance);
        }
      } catch {
        // Fallback
      }
    };

    initializeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const addItem = (product: ProductOutputDTO, quantity = 1, customizations?: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, customizations: customizations || item.customizations }
            : item
        );
      }
      return [...prev, { product, quantity, customizations }];
    });
    showToast(`Agregado a la bandeja: ${product.name}`);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const rechargeBalance = async (amount: number) => {
    try {
      const res = await fetch('/api/student/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: '2021-4892', amount }),
      });
      const data = await res.json();
      if (data.success) {
        setStudentBalance(data.newBalance);
        showToast(`Recarga exitosa: +$${amount.toLocaleString('es-CO')} a tu carné.`);
      }
    } catch {
      setStudentBalance((prev) => prev + amount);
      showToast(`Recarga local: +$${amount.toLocaleString('es-CO')} al carné.`);
    }
  };

  // Calculations
  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  // Default preview student discount (10%)
  const discount = Math.round(subtotal * 0.1);
  const total = Math.max(0, subtotal - discount);

  const formattedSubtotal = `$${subtotal.toLocaleString('es-CO')}`;
  const formattedDiscount = `-$${discount.toLocaleString('es-CO')}`;
  const formattedTotal = `$${total.toLocaleString('es-CO')}`;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemCount,
        subtotal,
        discount,
        total,
        formattedSubtotal,
        formattedDiscount,
        formattedTotal,
        activeTab,
        setActiveTab,
        studentBalance,
        rechargeBalance,
        activeOrder,
        setActiveOrder,
        allOrders,
        refreshOrders,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
