import { CurrentStock, DeliveryItem } from '../../types/spares';

export default function deliveryArrivedUpdateStock(oldStock: CurrentStock[], justArrivedStock: DeliveryItem[]) {
    let newStockLevels = <{ id: number; quant_remain: number }[]>[];
    // inefficient but unlikely to order more than 10 items in any one delivery
    for (let i = 0; i < oldStock.length; i++) {
        for (let j = 0; j < justArrivedStock.length; j++) {
            if (oldStock[i].id === justArrivedStock[j].spare_id) {
                newStockLevels.push({ id: oldStock[i].id, quant_remain: oldStock[i].quant_remain + justArrivedStock[j].quantity });
            }
        }
    }
    return newStockLevels;
}
