import { it, expect } from 'vitest';
import newStockArray from '../../src/helpers/jobs/newStockArray';

const propertyId = 1

it('should return an array with the remaining stock for passed in stock details', () => {
    const stockArray = [{id: 1, used: 2}]
    const currStock = [{id: 1, quant_remain: 4}]
    
    const result = newStockArray(stockArray, currStock, propertyId)

    expect(result[0].quant_remain).toBe(2)
})

it('should return an array with the remaining stock for passed in stock details if stock returned', () => {
    const stockArray = [{id: 1, used: -2}]
    const currStock = [{id: 1, quant_remain: 4}]
    
    const result = newStockArray(stockArray, currStock, propertyId)

    expect(result[0].quant_remain).toBe(6)
})