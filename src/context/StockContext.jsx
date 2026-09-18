import { createContext, useContext, useState } from "react";
import { buildInitialStock } from "../data/mockData";

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const [stock, setStock] = useState(() => buildInitialStock());

  /**
   * Update stock for a given pharmacy + medicine.
   * addQty > 0 → restock (QR scan)
   * addQty < 0 → deduction (POS purchase)
   */
  function updateStock(pharmacyId, medicineId, addQty, syncMethod) {
    setStock(prev => {
      const phStock = prev[pharmacyId] ?? {};
      const current = phStock[medicineId] ?? { qty: 0 };
      const newQty = Math.max(0, (current.qty ?? 0) + addQty);
      return {
        ...prev,
        [pharmacyId]: {
          ...phStock,
          [medicineId]: {
            qty: newQty,
            updatedAt: new Date(),
            syncMethod,
          },
        },
      };
    });
  }

  return (
    <StockContext.Provider value={{ stock, updateStock }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  return useContext(StockContext);
}
