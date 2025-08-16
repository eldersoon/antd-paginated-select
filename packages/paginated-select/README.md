# @antd-paginated-select/core

A high-performance React component that provides server-side paginated select functionality for Ant Design, built with TypeScript and TanStack Query.

## Features

- 🚀 **Server-side pagination** - Efficiently handle massive datasets (1M+ records)
- 🔍 **Intelligent search** - Real-time search with 300ms debounce and server-side filtering
- 📦 **Full TypeScript support** - Complete type safety with strongly-typed generic adapters
- 🎯 **Flexible data adapters** - Work with any API structure (REST, GraphQL, custom)
- 🔄 **Infinite scroll** - Seamless pagination through smooth scrolling
- 💾 **Smart caching & optimization** - Built on TanStack Query with automatic caching, deduplication, and background updates
- 🎨 **Native Ant Design integration** - Perfect integration with your existing Ant Design theme and components
- ⚡ **High performance** - Virtualized rendering and optimized re-renders for large lists
- 🔧 **Highly customizable** - Support for single/multiple selection, custom formatting, and advanced filtering
- 🌐 **SSR compatible** - Works seamlessly with Next.js and other SSR frameworks

## Installation

```bash
npm install @antd-paginated-select/core
# or
yarn add @antd-paginated-select/core
# or
pnpm add @antd-paginated-select/core
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react react-dom antd @tanstack/react-query
```

## Quick Start

### 1. Setup Query Client (Required)

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

### 2. Basic Usage

```tsx
import { PaginatedSelect, makeAdapter } from "@antd-paginated-select/core";

// Define your data type
type User = {
  id: string;
  name: string;
  email: string;
  department: string;
};

// Create a strongly-typed data adapter
const userAdapter = makeAdapter<User>()({
  // Required: Fetch paginated data
  list: async ({ page, pageSize, search, params }) => {
    const response = await fetch(
      `/api/users?page=${page}&limit=${pageSize}&search=${
        search || ""
      }&department=${params?.department || ""}`
    );
    const data = await response.json();

    return {
      items: data.users,
      total: data.total, // OR use { items, hasMore: boolean }
    };
  },

  // Optional: Fetch specific items by ID (for controlled values)
  getById: async (id: string) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },

  // Optional: Bulk fetch multiple items (more efficient)
  getByIds: async (ids: string[]) => {
    const response = await fetch(`/api/users/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return response.json();
  },

  // Required: How to display each item
  getLabel: (user) => `${user.name} (${user.email})`,

  // Required: Unique identifier for each item
  getValue: (user) => user.id,
});

// Use the component
function UserSelect() {
  const [selectedUser, setSelectedUser] = useState<string>();

  return (
    <PaginatedSelect
      dataAdapter={userAdapter}
      value={selectedUser}
      onChange={(value) => setSelectedUser(value)}
      placeholder="Search and select a user..."
      pageSize={20}
      params={{ department: "engineering" }} // Optional: additional filters
    />
  );
}
```

## API Reference

### PaginatedSelect Props

| Prop            | Type                  | Default | Description                                                      |
| --------------- | --------------------- | ------- | ---------------------------------------------------------------- |
| `dataAdapter`   | `DataAdapter<T>`      | -       | **Required.** Adapter that defines how to fetch and display data |
| `multiple`      | `boolean`             | `false` | Enable multiple selection                                        |
| `pageSize`      | `number`              | `10`    | Number of items to fetch per page                                |
| `params`        | `Record<string, any>` | -       | Additional parameters to pass to the list function               |
| `dependencyKey` | `unknown`             | -       | Key that triggers data refresh when changed                      |
| `debug`         | `boolean`             | `false` | Enable debug logging                                             |
| `...restProps`  | `SelectProps`         | -       | All other Ant Design Select props are supported                  |

### DataAdapter Interface

```tsx
type DataAdapter<T> = {
  list: (args: ListArgs) => Promise<ListResponse<T>>;
  getById?: (id: string) => Promise<T | null>;
  getByIds?: (ids: string[]) => Promise<T[]>;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
};

type ListArgs = {
  page: number;
  pageSize: number;
  search?: string;
  params?: Record<string, any>;
};

type ListResponse<T> =
  | { items: T[]; total: number } // For total-based pagination
  | { items: T[]; hasMore: boolean }; // For cursor-based pagination
```

## Advanced Examples

### Multiple Selection with Custom Formatting

```tsx
function MultiUserSelect() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  return (
    <PaginatedSelect
      dataAdapter={userAdapter}
      multiple
      value={selectedUsers}
      onChange={(values) => setSelectedUsers(values)}
      placeholder="Select multiple users..."
      maxTagCount={3}
      maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
    />
  );
}
```

### Conditional Data Loading with Dependencies

```tsx
function DepartmentUserSelect({ departmentId }: { departmentId?: string }) {
  const [selectedUser, setSelectedUser] = useState<string>();

  const departmentUserAdapter = makeAdapter<User>()({
    list: async ({ page, pageSize, search }) => {
      if (!departmentId) return { items: [], total: 0 };

      const response = await fetch(
        `/api/departments/${departmentId}/users?page=${page}&limit=${pageSize}&search=${
          search || ""
        }`
      );
      return response.json();
    },
    getLabel: (user) => user.name,
    getValue: (user) => user.id,
  });

  return (
    <PaginatedSelect
      dataAdapter={departmentUserAdapter}
      value={selectedUser}
      onChange={setSelectedUser}
      dependencyKey={departmentId} // Reload when department changes
      disabled={!departmentId}
      placeholder={
        departmentId
          ? "Select a user from this department..."
          : "Please select a department first"
      }
    />
  );
}
```

### Custom Response Format (Cursor-based Pagination)

```tsx
const cursorBasedAdapter = makeAdapter<Product>()({
  list: async ({ page, pageSize, search, params }) => {
    const response = await api.getProducts({
      cursor: params?.cursor,
      limit: pageSize,
      search,
      category: params?.category,
    });

    return {
      items: response.products,
      hasMore: !!response.nextCursor,
      // Store cursor for next request
      meta: { nextCursor: response.nextCursor },
    };
  },
  getLabel: (product) => `${product.name} - $${product.price.toFixed(2)}`,
  getValue: (product) => product.id,
});
```

### GraphQL Integration

```tsx
import { gql, request } from "graphql-request";

const graphqlAdapter = makeAdapter<User>()({
  list: async ({ page, pageSize, search, params }) => {
    const query = gql`
      query GetUsers(
        $first: Int!
        $offset: Int!
        $search: String
        $role: String
      ) {
        users(first: $first, offset: $offset, search: $search, role: $role) {
          nodes {
            id
            name
            email
            role
          }
          totalCount
        }
      }
    `;

    const data = await request("/graphql", query, {
      first: pageSize,
      offset: (page - 1) * pageSize,
      search,
      role: params?.role,
    });

    return {
      items: data.users.nodes,
      total: data.users.totalCount,
    };
  },
  getLabel: (user) => user.name,
  getValue: (user) => user.id,
});
```

### Async Validation and Custom Styling

```tsx
function AsyncUserSelect() {
  const [selectedUser, setSelectedUser] = useState<string>();
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = async (value: string) => {
    setIsValidating(true);

    try {
      // Validate selection server-side
      await fetch(`/api/users/${value}/validate`, { method: "POST" });
      setSelectedUser(value);
    } catch (error) {
      message.error("This user cannot be selected");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <PaginatedSelect
      dataAdapter={userAdapter}
      value={selectedUser}
      onChange={handleChange}
      loading={isValidating}
      placeholder="Select and validate user..."
      style={{ width: 300 }}
      dropdownStyle={{ minWidth: 400 }}
      size="large"
    />
  );
}
```

## TypeScript Support

The component provides comprehensive TypeScript support with automatic type inference:

```tsx
// 1. Define your data structure
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  avatar?: string;
}

// 2. Create type-safe adapter
const userAdapter = makeAdapter<User>()({
  list: async (args) => {
    // args is automatically typed as ListArgs
    // Your IDE will provide full autocomplete
    const { page, pageSize, search, params } = args;

    // Return type is validated against ListResponse<User>
    return {
      items: [], // User[]
      total: 0, // number
    };
  },
  getLabel: (user) => {
    // user parameter is typed as User
    return user.name; // Full autocomplete available
  },
  getValue: (user) => user.id, // Typed as User
});

// 3. Component usage with full type safety
function TypeSafeUserSelect() {
  // Single selection: string | undefined
  const [singleUser, setSingleUser] = useState<string>();

  // Multiple selection: string[]
  const [multipleUsers, setMultipleUsers] = useState<string[]>([]);

  return (
    <>
      {/* Single selection - value and onChange are typed correctly */}
      <PaginatedSelect
        dataAdapter={userAdapter}
        value={singleUser}
        onChange={(value) => setSingleUser(value)} // value is string
      />

      {/* Multiple selection - type is inferred from multiple prop */}
      <PaginatedSelect
        dataAdapter={userAdapter}
        multiple
        value={multipleUsers}
        onChange={(values) => setMultipleUsers(values)} // values is string[]
      />
    </>
  );
}
```

### Advanced Type Features

```tsx
// Generic constraint for specific data types
function createUserAdapter<T extends { id: string; name: string }>() {
  return makeAdapter<T>()({
    // Full type safety with constraints
    getValue: (item) => item.id,
    getLabel: (item) => item.name,
    // ... other methods
  });
}

// Utility types for complex scenarios
type SelectValue<T extends boolean> = T extends true ? string[] : string;
type SelectHandler<T extends boolean> = (value: SelectValue<T>) => void;
```

## Performance Optimization

### Best Practices

1. **Optimize `pageSize`** - Balance between UX and network efficiency:

   ```tsx
   // Good for most cases
   <PaginatedSelect pageSize={20} />

   // For mobile or slow networks
   <PaginatedSelect pageSize={10} />

   // For desktop with fast networks
   <PaginatedSelect pageSize={50} />
   ```

2. **Use `dependencyKey` for data invalidation**:

   ```tsx
   <PaginatedSelect
     dataAdapter={userAdapter}
     dependencyKey={[currentTenant.id, selectedDepartment]}
     // Data reloads automatically when dependencies change
   />
   ```

3. **Implement efficient bulk fetching**:

   ```tsx
   const optimizedAdapter = makeAdapter<User>()({
     // Bulk fetch for better performance
     getByIds: async (ids) => {
       const response = await fetch("/api/users/bulk", {
         method: "POST",
         body: JSON.stringify({ ids }),
       });
       return response.json();
     },
     // Single fetch fallback
     getById: async (id) => {
       const response = await fetch(`/api/users/${id}`);
       return response.json();
     },
   });
   ```

4. **Memoize adapters to prevent unnecessary re-renders**:

   ```tsx
   function UserSelect({ departmentId }: { departmentId: string }) {
     const userAdapter = useMemo(
       () =>
         makeAdapter<User>()({
           list: async (args) => {
             // Include departmentId in the request
             return fetchUsers({ ...args, departmentId });
           },
           getLabel: (user) => user.name,
           getValue: (user) => user.id,
         }),
       [departmentId] // Only recreate when departmentId changes
     );

     return <PaginatedSelect dataAdapter={userAdapter} />;
   }
   ```

### Query Configuration

```tsx
// Configure TanStack Query for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep in memory
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 2, // Retry failed requests
    },
  },
});
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Ensure peer dependencies are installed
2. **Infinite loading**: Check your API response format matches `ListResponse<T>`
3. **Selected values not showing**: Implement `getById` or `getByIds` methods
4. **Performance issues**: Reduce `pageSize` or implement `getByIds` for bulk operations

### Debug Mode

Enable debug logging to troubleshoot issues:

```tsx
<PaginatedSelect
  dataAdapter={userAdapter}
  debug={process.env.NODE_ENV === "development"}
  // Check browser console for detailed logs
/>
```

## License

MIT - see [LICENSE](LICENSE) file for details.
