import { Button, Checkbox, Flex, Input, Table } from "antd";
import { useFirstRender } from "../../hook";
import style from './index.module.less'
import { ColumnsType } from "antd/es/table";
import { DataType } from "..";
import { useRef, useState } from "react";

const List = () => {
  useFirstRender(() => {});
  const selectedRowsRef = useRef<DataType[]>([]);
  const [deletable, setDeletable] = useState(false);
  const [filter, setFilter] = useState('')
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      selectedRowsRef.current = selectedRows
      setDeletable(!!selectedRows.length)
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: false,
      name: record.name,
    }),
  };
  const [items, setItems] = useState<DataType[]>(JSON.parse(localStorage.getItem("fence") ?? "[]") ?? []);
  const columns: ColumnsType<DataType> = [
    {
      title: "name",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Fill Color",
      dataIndex: "fillColor",
      width: 200,
      render(_) {
        return <div className={style.color} style={{backgroundColor: _}}></div>
      }
    },
    {
      title: "Border Color",
      dataIndex: "borderColor",
      width: 200,
      render(_) {
        return <div className={style.color} style={{backgroundColor: _}}></div>
      }
    },
    {
      title: "Coordinates",
      dataIndex: "coors",
      render(_) {
        return JSON.stringify(_);
      },
    },
    {
      title: 'Visible',
      dataIndex: 'visible',
      render(_, record) {
        return <Checkbox defaultChecked={_} onChange={v => {
          record.visible = v.target.checked
          localStorage.setItem('fence', JSON.stringify(items))
        }} />
      }
    }
  ];
  const onDelete = () => {
    const newItem = items.reduce((res, item) => {
      if(selectedRowsRef.current.some(({id}) => id === item.id)) return res
      return res.concat(item)
    }, [] as DataType[])
    setItems(newItem)
    localStorage.setItem('fence', JSON.stringify(newItem))
  }
  return (
    <Flex vertical gap={8} style={{paddingTop: 10}} >
      <Flex gap={10}>
        <Button disabled={!deletable} style={{width: 80}} onClick={onDelete}>Delete</Button>
        <Input placeholder="Search Name" onInput={v => setFilter(v.currentTarget.value)} />
      </Flex>
      <Table
      rowKey="id"
      rowSelection={{
        ...rowSelection,
        type: 'checkbox'
      }}
      dataSource={!filter ? items : items.filter(({name}) => name.includes(filter))}
      columns={columns}
      pagination={{
        pageSize: 10
      }}
    />
    </Flex>
  );
};

export default List;
