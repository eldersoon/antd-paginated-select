"use client";

import { useState } from "react";
import { Card, Space, Typography, Divider, Row, Col } from "antd";
import { UserSelect } from "@/components/UserSelect";
import { ProductSelect } from "@/components/ProductSelect";

const { Title, Paragraph } = Typography;

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<string>();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>();

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={1}>Paginated Select Demo</Title>
      <Paragraph>
        This interactive demo showcases the <code>@antd-paginated-select</code>{" "}
        component with various configurations including single/multiple
        selection, server-side search, infinite scrolling, and different data
        adapters. Each example demonstrates real-world usage patterns with mock
        APIs that simulate realistic server responses and network delays.
      </Paragraph>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col span={24} md={12}>
          <Card title="Single User Selection" style={{ height: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Paragraph>
                <strong>Features demonstrated:</strong>
                <br />• Server-side search with 300ms debounce
                <br />• Infinite scroll pagination (500 mock users)
                <br />• Automatic label resolution for controlled values
                <br />• TypeScript type safety
              </Paragraph>
              <UserSelect
                value={selectedUser}
                onChange={(value) => setSelectedUser(value as string)}
                placeholder="Search and select a user..."
              />
              {selectedUser && (
                <Paragraph>
                  Selected: <code>{selectedUser}</code>
                </Paragraph>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24} md={12}>
          <Card title="Multiple User Selection" style={{ height: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Paragraph>
                <strong>Features demonstrated:</strong>
                <br />• Multiple selection with tag display
                <br />• Bulk operations (getByIds for performance)
                <br />• Preserved selections across searches
                <br />• Smart deduplication of options
              </Paragraph>
              <UserSelect
                multiple
                value={selectedUsers}
                onChange={(value) => setSelectedUsers(value as string[])}
                placeholder="Select multiple users..."
              />
              {selectedUsers.length > 0 && (
                <Paragraph>
                  Selected: <code>{selectedUsers.join(", ")}</code>
                </Paragraph>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Product Selection with Custom Formatting">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Paragraph>
                <strong>Features demonstrated:</strong>
                <br />• Custom label formatting (name + price + stock status)
                <br />• Cursor-based pagination (hasMore vs total)
                <br />• Slower API simulation (400-700ms delays)
                <br />• Category-based filtering
              </Paragraph>
              <ProductSelect
                value={selectedProduct}
                onChange={(value) => setSelectedProduct(value)}
                placeholder="Search for products..."
              />
              {selectedProduct && (
                <Paragraph>
                  Selected Product: <code>{selectedProduct}</code>
                </Paragraph>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
