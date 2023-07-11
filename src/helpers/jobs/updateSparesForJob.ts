import * as Spares from '../../models/spares';
import newStockArray from './newStockArray';
import compareSpareDiff from './compareSpareDiff';
import smallStockArray from './smallStockArray';
import makeIdList from '../makeIdList';
import { NewSpares } from '../../types/spares';


export async function updateSparesForJob(jobId: number, propertyId: number, newSpares: NewSpares[]) {
    let diffArray = <NewSpares[]>[];
    let stockChangesArray = <{ id: number; used: number }[]>[];

    const prevSpares = await Spares.getUsedSpares(jobId);
    if (prevSpares.length === 0) {
        await Spares.insertUsedSpares(newSpares, jobId, propertyId); // table: spares_used
        stockChangesArray = smallStockArray(newSpares);
    } else {
        // compare difference
        const diffAndStock = compareSpareDiff(newSpares, prevSpares);
        diffArray = diffAndStock.diffArray;
        stockChangesArray = diffAndStock.stockChangesArray;

        // insert the diff array (Update replace) table: spares_used
        if (diffArray.length > 0) {
            Spares.updateUsedSpares(diffArray, jobId, propertyId);
        }
    }
    
    // insert stock array changes
    if (stockChangesArray.length > 0) {
        const stockChangeIds = makeIdList(stockChangesArray, 'id');
        const currStock = await Spares.getCurrentSpecificStock(stockChangeIds, propertyId);
        const newStock = newStockArray(stockChangesArray, currStock, propertyId);
        if (newStock.length > 0) {
            await Spares.updateStock(newStock); // table: spares
        }
    }
}
