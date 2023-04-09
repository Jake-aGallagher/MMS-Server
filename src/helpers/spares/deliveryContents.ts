import { DeliveryItem, Delivery } from "../../types/spares";

export default function deliveryContents(deliveryItems: DeliveryItem[], deliveriesWithContentsArr: Delivery[], deliveryMap: { [key: number]: number }) {
    deliveryItems.forEach((item) => {
        deliveriesWithContentsArr[deliveryMap[item.delivery_id]].contents.push(item);
    });
    return deliveriesWithContentsArr
}