"use client";

import { PaginatedSelect, makeAdapter, type ListArgs } from "@antd-paginated-select/core";
import { mockUserAPI } from "@/lib/mockApi";

/**
 * UserSelect Component
 *
 * A reusable component that provides user selection functionality
 * with server-side pagination and search. Demonstrates how to create
 * a strongly-typed data adapter for user data.
 */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const userAdapter = makeAdapter<User>()({
  list: async ({ page, pageSize, search, params }: ListArgs) => {
    const response = await mockUserAPI.getUsers({
      page,
      limit: pageSize,
      search,
      ...params,
    });
    return {
      items: response.users,
      total: response.total,
    };
  },
  getById: async (id: string) => {
    return mockUserAPI.getUserById(id);
  },
  getByIds: async (ids: string[]) => {
    return mockUserAPI.getUsersByIds(ids);
  },
  getLabel: (user: User) => `${user.name} (${user.email})`,
  getValue: (user: User) => user.id,
});

type UserSelectProps = {
  value?: string | string[];
  onChange?: (value: string | string[], option?: any) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  params?: Record<string, any>;
};

export function UserSelect({
  value,
  onChange,
  multiple = false,
  placeholder = "Select user...",
  disabled = false,
  params,
}: UserSelectProps) {
  return (
    <PaginatedSelect
      dataAdapter={userAdapter}
      multiple={multiple as any}
      value={value as any}
      onChange={onChange as any}
      placeholder={placeholder}
      disabled={disabled}
      params={params}
      pageSize={15}
      debug={process.env.NODE_ENV === "development"}
    />
  );
}
