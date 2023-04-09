import { Delivery } from "../../types/spares";

export default function deliveryMaps(deliveries: Delivery[]) {
    let deliveryIds = <number[]>[];
    let deliveryMap: { [key: number]: number } = {};
    for (let i = 0; i < deliveries.length; i += 1) {
        deliveryMap[deliveries[i].id] = i;
        deliveryIds.push(deliveries[i].id);
        deliveries[i]['contents'] = <{ delivery_id: number; spare_id: number; quantity: number; part_no: string; name: string }[]>[];
    }
    return {deliveryMap, deliveryIds, deliveries}
}