import { LatLng } from "leaflet";

export { default as List } from "./List";
export { default as Map } from "./Map";

export type DataType = {
    coors: [LatLng[]]
    name: string
    borderColor: string
    fillColor: string
    visible: boolean
    id: number
}
