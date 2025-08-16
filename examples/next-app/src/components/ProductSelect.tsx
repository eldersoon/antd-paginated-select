"use client";

import { PaginatedSelect, makeAdapter } from "@antd-paginated-select/core";
import { mockProductAPI } from "@/lib/mockApi";

/**
 * ProductSelect Component
 *
 * Demonstrates product selection with custom formatting and
 * cursor-based pagination (hasMore instead of total count).
 * Shows how to handle out-of-stock indicators in the display.
 */

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
};

const productAdapter = makeAdapter<Product>()({
  list: async ({ page, pageSize, search }) => {
    const response = await mockProductAPI.getProducts({
      page,
      limit: pageSize,
      search,
    });
    return {
      items: response.products,
      hasMore: response.hasMore,
    };
  },
  getById: async (id: string) => {
    return mockProductAPI.getProductById(id);
  },
  getLabel: (product) =>
    `${product.name} - $${product.price} ${
      !product.inStock ? "(Out of Stock)" : ""
    }`,
  getValue: (product) => product.id,
});

type ProductSelectProps = {
  value?: string;
  onChange?: (value: string, option?: any) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function ProductSelect({
  value,
  onChange,
  placeholder = "Select product...",
  disabled = false,
}: ProductSelectProps) {
  return (
    <PaginatedSelect
      dataAdapter={productAdapter}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      pageSize={10}
      debug={process.env.NODE_ENV === "development"}
    />
  );
}
