# Ant Design Paginated Select

A React component that provides a paginated select with server-side data fetching for Ant Design.

## 🎯 Key Features

- 🚀 **High-performance server-side pagination** - Handle massive datasets (1M+ records) efficiently
- 🔍 **Intelligent search** - Real-time search with 300ms debounce and server-side filtering
- 📦 **Complete TypeScript support** - Strongly-typed generic adapters with full IntelliSense
- 🎯 **Flexible data adapters** - Support for REST, GraphQL, and any custom API structure
- 🔄 **Smooth infinite scroll** - Seamless pagination with optimized scroll detection
- 💾 **Advanced caching & optimization** - Built on TanStack Query with deduplication and background updates
- 🎨 **Native Ant Design integration** - Perfect theme compatibility and component consistency
- ⚡ **Optimized performance** - Virtualized rendering and smart re-render prevention
- 🔧 **Highly customizable** - Extensive configuration options for any use case
- 🌐 **SSR ready** - Full Next.js and other SSR framework compatibility

## 📁 Project Structure

```
paginated-select/
├─ packages/
│  └─ paginated-select/        # the library (what goes to npm)
│     ├─ src/
│     │  ├─ PaginatedSelect.tsx
│     │  └─ index.ts
│     ├─ package.json
│     ├─ tsconfig.json
│     ├─ tsup.config.ts
│     └─ README.md
├─ examples/
│  └─ next-app/                # live playground using the lib
├─ docs/                       # documentation site (VitePress)
├─ .github/workflows/release.yml
└─ pnpm-workspace.yaml
```

## 🚀 Quick Start

### Installation

```bash
pnpm install
```

### Development

```bash
# Start the example app
cd examples/next-app
pnpm dev

# Start the documentation site
cd docs
pnpm dev

# Build the library
cd packages/paginated-select
pnpm build
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @antd-paginated-select/core build
```

## 📖 Usage

```tsx
import { PaginatedSelect, makeAdapter } from "@antd-paginated-select/core";

// Define your data structure
type User = { id: string; name: string; email: string };

// Create a type-safe data adapter
const userAdapter = makeAdapter<User>()({
  list: async ({ page, pageSize, search, params }) => {
    const response = await fetch(
      `/api/users?page=${page}&limit=${pageSize}&search=${search || ""}`
    );
    const data = await response.json();
    return { items: data.users, total: data.total };
  },
  getById: async (id) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  getLabel: (user) => `${user.name} (${user.email})`,
  getValue: (user) => user.id,
});

// Use with full type safety
<PaginatedSelect
  dataAdapter={userAdapter}
  placeholder="Search users..."
  onChange={(value) => console.log("Selected user ID:", value)}
  pageSize={20}
/>;
```

## 📚 Documentation

- [Getting Started](./docs/guide/getting-started.md)
- [API Reference](./docs/api/props.md)
- [Examples](./docs/examples/basic.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗️ Development & Contributing

### Project Structure

```
antd-paginated-select/
├── packages/
│   └── paginated-select/     # 📦 Main library package
├── examples/
│   └── next-app/            # 🎮 Interactive demo app
├── docs/                    # 📚 VitePress documentation
└── .github/workflows/       # 🔄 CI/CD automation
```

### Tech Stack

- **🔧 pnpm workspaces** - Efficient monorepo management
- **⚡ tsup** - Lightning-fast TypeScript bundler
- **🎮 Next.js 14** - Modern React framework for examples
- **📚 VitePress** - Documentation site with hot reload
- **🔄 GitHub Actions** - Automated testing and publishing
- **📋 Changesets** - Semantic versioning and changelog generation

### Getting Started

```bash
# Clone and install
git clone https://github.com/yourusername/antd-paginated-select.git
cd antd-paginated-select
pnpm install

# Start development
pnpm dev              # Start all packages in watch mode
pnpm build            # Build all packages
pnpm test             # Run tests

# Try the examples
cd examples/next-app && pnpm dev    # Interactive demo at http://localhost:3000
cd docs && pnpm dev                 # Documentation at http://localhost:5173
```

### Contributing

1. 🍴 Fork the repository
2. 🌟 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.
