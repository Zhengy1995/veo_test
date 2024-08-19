import { useFirstRender } from "../../hook";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useMemo, useRef, useState } from "react";
import { Button, ColorPicker, Flex, Form, Input, message, Modal } from "antd";
import { Control, FeatureGroup, latLng, polygon, Polygon } from "leaflet";
import "leaflet-draw";

const MapLayer = () => {
  return (
    <TileLayer
      url="http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}"
      maxZoom={20}
      subdomains={["mt0", "mt1", "mt2", "mt3"]}
    />
  );
};

const Operator = () => {
  const map = useMap();
  const [userPosition, setUserPosition] = useState<[number, number]>([0, 0]);
  useFirstRender(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 13);
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        message.error("Fail to get your location");
      },
      {
        enableHighAccuracy: true,
      }
    );
  });
  return <Marker position={userPosition} />;
};

const Draw = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editState, setEditState] = useState(false);
  const [deleteState, setDeleteState] = useState(false);
  const editStateRef = useRef(editState);
  const deleteStateRef = useRef(deleteState);
  editStateRef.current = editState;
  deleteStateRef.current = deleteState;
  const [openModal, setOpenModal] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const toggleModal = () => setOpenModal((f) => !f);
  const toggleEdit = () => setOpenEdit((f) => !f);
  const map = useMap();
  const drawItems = useMemo(() => new FeatureGroup(), []);
  const draw = useMemo(
    () =>
      new Control.Draw({
        edit: {
          featureGroup: drawItems,
          edit: false,
          remove: false,
        },
        draw: {
          polygon: false,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
      }),
    []
  );
  const editTool = useMemo(
    () => new L.EditToolbar.Edit(map, { featureGroup: drawItems }),
    []
  );

  const deleteTool = useMemo(
    () => new L.EditToolbar.Delete(map, { featureGroup: drawItems }),
    []
  );

  const storeGeofence = function () {
    const res: any[] = [];
    drawItems.eachLayer((l) => {
      if (l instanceof Polygon) {
        console.warn(l.fenceAttributes)
        res.push({ ...l.fenceAttributes, coors: l.getLatLngs() });
      }
    });
    console.log(res);
    localStorage.setItem("fence", JSON.stringify(res));
  };
  useFirstRender(() => {
    const fenceStr = localStorage.getItem("fence");
    if (fenceStr) {
      const fence = JSON.parse(fenceStr);
      fence.forEach(({ coors, visible, ...other }) => {
        if (visible === false) return;
        const plg = polygon(
          coors[0].map(({ lat, lng }: { lat: number; lng: number }) =>
            latLng(lat, lng)
          ),
          { color: other.borderColor, fillColor: other.fillColor, opacity: 0.5 }
        );
        plg.addEventListener("click", () => {
          if (editStateRef.current) {
            setOpenEdit(true);
            editForm.setFieldsValue(other);
          }
        });
        plg.fenceAttributes = other;
        drawItems.addLayer(plg);
      });
    }
    map.addLayer(drawItems);
    map.addControl(draw);
    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      const { name, fillColor, borderColor } = form.getFieldsValue();
      layer.fenceAttributes = {
        name,
        fillColor: fillColor.toHexString(),
        borderColor: borderColor.toHexString(),
        visible: true,
        id: new Date().valueOf()
      };
      layer.addEventListener("click", () => {
        if (editStateRef.current) {
          setOpenEdit(true);
          editForm.setFieldsValue(layer.fenceAttributes);
        }
      });
      drawItems.addLayer(layer);
    });
    map.on(L.Draw.Event.DRAWSTOP, storeGeofence);
  });
  const onDraw = async () => {
    await form.validateFields();
    const { fillColor, borderColor } = form.getFieldsValue();
    new L.Draw.Polygon(map, {
      shapeOptions: {
        color: borderColor.toHexString(),
        fillColor: fillColor.toHexString(),
      },
    }).enable();
    toggleModal();
  };
  const onEdit = () => {
    if (!editState) editTool.enable();
    else {
      editTool.disable();
      storeGeofence();
    }
    setEditState((f) => !f);
  };

  const onDelete = () => {
    if (!deleteState) deleteTool.enable();
    else {
      deleteTool.disable();
      storeGeofence();
    }
    setDeleteState((f) => !f);
  };

  const onEditProps = async () => {
    await editForm.validateFields();
    const form = editForm.getFieldsValue();
    const removeL: Polygon[] = [];
    drawItems.eachLayer((l) => {
      if (l instanceof Polygon && l.fenceAttributes.id === form.id) {
        removeL.push(l);
        const plg = polygon(l.getLatLngs(), {
          fillColor: form.fillColor.toHexString?.() ?? form.fillColor,
          color: form.borderColor.toHexString?.() ?? form.borderColor,
        });
        plg.fenceAttributes = {
          name: form.name,
          fillColor: form.fillColor.toHexString?.() ?? form.fillColor,
          borderColor: form.borderColor.toHexString?.() ?? form.borderColor,
          visible: l.fenceAttributes.visible,
          id: l.fenceAttributes.id
        };
        plg.addEventListener("click", () => {
        if (editStateRef.current) {
          setOpenEdit(true);
          editForm.setFieldsValue(plg.fenceAttributes);
        }
      });
        drawItems.addLayer(plg);
      }
    });
    removeL.forEach((l) => drawItems.removeLayer(l));
    storeGeofence();
    toggleEdit();
  };
  return (
    <>
      <Flex gap={8} style={{ position: "absolute", top: 5, left: 5, zIndex: 999 }}>
        <Button onClick={toggleModal}>Add Geofence</Button>
        <Button onClick={onEdit}>
          {editState ? "Stop Edit" : "Edit Geofence"}
        </Button>
        <Button onClick={onDelete}>
          {deleteState ? "Stop Delete" : "Delete Geofence"}
        </Button>
      </Flex>
      <Modal
        title="Add Geofence"
        mask={false}
        open={openModal}
        onCancel={toggleModal}
        onOk={onDraw}
        okText="Draw"
      >
        <Form form={form} labelAlign="right" labelCol={{ span: 6 }}>
          <Form.Item rules={[{ required: true }]} label="Name" name="name">
            <Input style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Fill Color"
            name="fillColor"
          >
            <ColorPicker />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Border color"
            name="borderColor"
          >
            <ColorPicker />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Geofence"
        mask={false}
        open={openEdit}
        onCancel={toggleEdit}
        onOk={onEditProps}
      >
        <Form form={editForm} labelAlign="right" labelCol={{ span: 6 }}>
          <Form.Item rules={[{ required: true }]} label="Name" name="name">
            <Input style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Fill Color"
            name="fillColor"
          >
            <ColorPicker />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Border color"
            name="borderColor"
          >
            <ColorPicker />
          </Form.Item>
          <Form.Item name="id" style={{display: 'none'}}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const Map = () => {
  useFirstRender(() => {
    console.log("aaa");
  });

  const defaultLocation = [51.505, -0.09] as [number, number];
  return (
    <MapContainer
      style={{ width: "100%", height: "100%", position: "relative" }}
      zoom={13}
      center={defaultLocation}
      attributionControl={false}
      zoomControl={false}
    >
      <MapLayer />
      <Operator />
      <Draw />
    </MapContainer>
  );
};

export default Map;
