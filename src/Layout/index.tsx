import React, { useMemo, useState } from "react";
import { DribbbleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import Container from "./Container";
import * as modules from "../modules";
import { Header } from "antd/es/layout/layout";

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Map", "Map", <DribbbleOutlined />),
  getItem("List", "List", <UnorderedListOutlined />),
];

const Skeleton = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [currentModule, setCurrentModule] = useState("Map");

  const onMenuChange = ({ key }: { key: string }) => {
    setCurrentModule(key);
  };

  const Module = useMemo(
    () => modules[currentModule as "Map"],
    [currentModule]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["Map"]}
          mode="inline"
          items={items}
          onClick={onMenuChange}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: "0 10px", background: colorBgContainer }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>{currentModule}</Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Container>
            <Module />
          </Container>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ronin Z
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Skeleton;
