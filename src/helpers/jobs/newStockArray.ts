import { NewStock, CurrentStock } from "../../types/spares";

export default function newStockArray(stockArray: { id: number; used: number }[], currStock: CurrentStock[], facilityId: number) {
    const newStock = <NewStock[]>[];
    stockArray.forEach((item) => {
        const data = currStock.find((x) => x.id === item.id);
        if (data) {
            newStock.push({ id: item.id, facility_id: facilityId, quant_remain: data.quant_remain - item.used });
        }
    });
    return newStock
}
