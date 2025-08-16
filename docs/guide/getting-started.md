# Getting Started

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install @antd-paginated-select
```

```bash [yarn]
yarn add @antd-paginated-select
```

```bash [pnpm]
pnpm add @antd-paginated-select
```

:::

## Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react react-dom antd @tanstack/react-query
```

## Setup Query Client

The component requires TanStack Query for data fetching. Set up the QueryClient in your app:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

## First Example

Here's a minimal example to get you started:

```tsx
import { PaginatedSelect, makeAdapter } from "@antd-paginated-select";

// Define your data type
type User = {
  id: string;
  name: string;
  email: string;
};

// Create a data adapter
const userAdapter = makeAdapter<User>()({
  list: async ({ page, pageSize, search }) => {
    const response = await fetch(
      `/api/users?page=${page}&limit=${pageSize}&search=${search || ""}`
    );
    const data = await response.json();
    return {
      items: data.users,
      total: data.total,
    };
  },
  getLabel: (user) => user.name,
  getValue: (user) => user.id,
});

// Use the component
function UserSelect() {
  const [selectedUser, setSelectedUser] = useState<string>();

  return (
    <PaginatedSelect
      dataAdapter={userAdapter}
      value={selectedUser}
      onChange={setSelectedUser}
      placeholder="Select a user..."
    />
  );
}
```

## Next Steps

- [Learn about data adapters →](/guide/data-adapters)
- [Explore TypeScript features →](/guide/typescript)
- [See more examples →](/examples/basic)
