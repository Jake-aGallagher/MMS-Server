import * as Spares from '../../models/spares';
import newStockArray from './newStockArray';
import compareSpareDiff from './compareSpareDiff';
import smallStockArray from './smallStockArray';
import makeIdList from '../makeIdList';
import { NewSpares } from '../../types/spares';


export async function updateSparesForJob(client: string, modelId: number, facilityId: number, newSpares: NewSpares[], model: 'job' | 'pm', type: 'used' | 'missing') {
    let diffArray = <NewSpares[]>[];
    let negativeDiffArray = <NewSpares[]>[];
    let stockChangesArray = <{ id: number; used: number }[]>[];

    const prevSpares = await Spares.getUsedSpares(client, model, modelId, type);
    if (prevSpares.length === 0) {
        await Spares.insertUsedSpares(client, newSpares, model, modelId, facilityId, type); // table: spares_used
        stockChangesArray = smallStockArray(newSpares);
    } else {
        // compare difference
        const diffAndStock = compareSpareDiff(newSpares, prevSpares);
        diffArray = diffAndStock.diffArray;
        negativeDiffArray = diffAndStock.negativeDiffArray;
        stockChangesArray = diffAndStock.stockChangesArray;

        // insert the diff array (Update replace) table: spares_used
        if (diffArray.length > 0) {
            Spares.updateUsedSparesPositive(client, diffArray, model, modelId, facilityId, type);
        }
        if (negativeDiffArray.length > 0) {
            Spares.updateUsedSparesNegative(client, negativeDiffArray, model, modelId, facilityId, type);
        }
    }
    
    // insert stock array changes
    if (stockChangesArray.length > 0 && type === 'used') {
        const stockChangeIds = makeIdList(stockChangesArray, 'id');
        const currStock = await Spares.getCurrentSpecificStock(client, stockChangeIds, facilityId);
        const newStock = newStockArray(stockChangesArray, currStock, facilityId);
        if (newStock.length > 0) {
            await Spares.updateStock(client, newStock); // table: spares
        }
    }
}
