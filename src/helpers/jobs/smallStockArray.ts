import { NewSpares } from "../../types/spares";

export default function smallStockArray(newSpares: NewSpares[], ) {
    let stockArray = <{ id: number; used: number }[]>[]
    newSpares.forEach((spare) => {
        stockArray.push({ id: spare.id, used: spare.num_used });
    });
    return stockArray
}