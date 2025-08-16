import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Paginated Select",
  description:
    "A paginated select component for Ant Design with server-side data fetching",
  base: "/antd-paginated-select/",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API Reference", link: "/api/props" },
      { text: "Examples", link: "/examples/basic" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Basic Usage", link: "/guide/basic-usage" },
            { text: "Data Adapters", link: "/guide/data-adapters" },
            { text: "TypeScript", link: "/guide/typescript" },
            { text: "Performance", link: "/guide/performance" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Props", link: "/api/props" },
            { text: "Types", link: "/api/types" },
            { text: "Utilities", link: "/api/utilities" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [
            { text: "Basic Usage", link: "/examples/basic" },
            { text: "Multiple Selection", link: "/examples/multiple" },
            { text: "Custom Adapters", link: "/examples/custom-adapters" },
            { text: "Advanced Features", link: "/examples/advanced" },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/yourusername/antd-paginated-select",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present",
    },
  },
});
