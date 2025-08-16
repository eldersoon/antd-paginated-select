# Paginated Select for Ant Design

A React component that provides a paginated select with server-side data fetching for Ant Design.

## Features

- 🚀 **Server-side pagination** - Efficiently handle large datasets
- 🔍 **Search with debouncing** - Real-time search with 300ms debounce
- 📦 **TypeScript support** - Full type safety with generic adapters
- 🎯 **Flexible data adapters** - Work with any API structure
- 🔄 **Infinite scroll** - Seamless pagination through scrolling
- 💾 **Smart caching** - Built on TanStack Query for optimal performance
- 🎨 **Ant Design integration** - Seamlessly works with your existing Ant Design theme

## Quick Start

Install the package:

```bash
npm install @antd-paginated-select/core
```

Set up your data adapter:

```tsx
import { PaginatedSelect, makeAdapter } from "@antd-paginated-select/core";

const userAdapter = makeAdapter<User>()({
  list: async ({ page, pageSize, search }) => {
    const response = await fetch(
      `/api/users?page=${page}&limit=${pageSize}&search=${search || ""}`
    );
    const data = await response.json();
    return { items: data.users, total: data.total };
  },
  getLabel: (user) => user.name,
  getValue: (user) => user.id,
});
```

Use the component:

```tsx
<PaginatedSelect
  dataAdapter={userAdapter}
  placeholder="Select a user..."
  onChange={(value) => console.log("Selected:", value)}
/>
```

## Why Paginated Select?

Traditional select components load all options at once, which doesn't scale well with large datasets. Paginated Select solves this by:

- Loading data in chunks as needed
- Providing server-side search capabilities
- Maintaining smooth UX with infinite scrolling
- Offering type-safe data adapters for any API

[Get Started →](/guide/getting-started)
