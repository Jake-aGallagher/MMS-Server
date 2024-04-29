import * as Spares from '../../models/spares';
import newStockArray from './newStockArray';
import compareSpareDiff from './compareSpareDiff';
import smallStockArray from './smallStockArray';
import makeIdList from '../makeIdList';
import { NewSpares } from '../../types/spares';


export async function updateSparesForJob(modelId: number, facilityId: number, newSpares: NewSpares[], model: 'job' | 'pm', type: 'used' | 'missing') {
    let diffArray = <NewSpares[]>[];
    let negativeDiffArray = <NewSpares[]>[];
    let stockChangesArray = <{ id: number; used: number }[]>[];

    const prevSpares = await Spares.getUsedSpares(model, modelId, type);
    if (prevSpares.length === 0) {
        await Spares.insertUsedSpares(newSpares, model, modelId, facilityId, type); // table: spares_used
        stockChangesArray = smallStockArray(newSpares);
    } else {
        // compare difference
        const diffAndStock = compareSpareDiff(newSpares, prevSpares);
        diffArray = diffAndStock.diffArray;
        negativeDiffArray = diffAndStock.negativeDiffArray;
        stockChangesArray = diffAndStock.stockChangesArray;

        // insert the diff array (Update replace) table: spares_used
        if (diffArray.length > 0) {
            Spares.updateUsedSparesPositive(diffArray, model, modelId, facilityId, type);
        }
        if (negativeDiffArray.length > 0) {
            Spares.updateUsedSparesNegative(negativeDiffArray, model, modelId, facilityId, type);
        }
    }
    
    // insert stock array changes
    if (stockChangesArray.length > 0 && type === 'used') {
        const stockChangeIds = makeIdList(stockChangesArray, 'id');
        const currStock = await Spares.getCurrentSpecificStock(stockChangeIds, facilityId);
        const newStock = newStockArray(stockChangesArray, currStock, facilityId);
        if (newStock.length > 0) {
            await Spares.updateStock(newStock); // table: spares
        }
    }
}
