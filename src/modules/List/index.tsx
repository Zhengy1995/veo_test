import { Table } from "antd";
import { useFirstRender } from "../../hook";

const List = () => {
  useFirstRender(() => {});
  const columns = [
    {
      title: "name",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Fill Color",
      dataIndex: "fillColor",
      width: 200,
    },
    {
      title: "Border Color",
      dataIndex: "borderColor",
      width: 200,
    },
    {
      title: "Coordinates",
      dataIndex: "coors",
      render(_: Record<string, unknown>) {
        return JSON.stringify(_);
      },
    },
  ];
  return (
    <Table
      dataSource={JSON.parse(localStorage.getItem("fence") ?? "") ?? []}
      columns={columns}
    />
  );
};

export default List;
