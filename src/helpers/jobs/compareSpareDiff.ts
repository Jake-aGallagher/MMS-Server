import { NewSpares, UsedSpares } from "../../types/spares";

export default function compareSpareDiff(newSpares: NewSpares[], prevSpares: UsedSpares[]) {
    let stockChangesArray = <{ id: number; used: number }[]>[];
    let diffArray = <NewSpares[]>[];
    newSpares.forEach((newSpare) => {
        const data = prevSpares.find((x) => x.id === newSpare.id);
        if (data) {
            const difference = newSpare.quantity - data.quantity;
            
            if (difference != 0) {
                pushToArrays(newSpare, difference, diffArray, stockChangesArray)
            }
        } else {
            // add straight to diff array as it doesn't previously exist
            pushToArrays(newSpare, 0, diffArray, stockChangesArray)
        }
    });
    return {diffArray, stockChangesArray}
}

function pushToArrays(newSpare: NewSpares, difference: number, diffArray: NewSpares[], stockChangesArray: { id: number; used: number }[]) {
    diffArray.push({ id: newSpare.id, part_no: newSpare.part_no, name: newSpare.name, quantity: newSpare.quantity });
    stockChangesArray.push({ id: newSpare.id, used: (difference !== 0 ? difference : newSpare.quantity) });
}
