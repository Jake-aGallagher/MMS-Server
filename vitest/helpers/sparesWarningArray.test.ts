import { it, expect } from 'vitest';
import sparesWarningArray from '../../src/helpers/spares/sparesWarningArray';

it('should create appropriate arrays for out of stock and low stock items', () => {
    const sparesCount = [
        { id: 1, quant_remain: 0, part_no: '1', name: 'testA', supplier: 'testA' },
        { id: 2, quant_remain: 1, part_no: '2', name: 'testB', supplier: 'testB' }
    ];

    const sparesUsed = [{spare_id: 1, total_used: 1}, {spare_id: 2, total_used: 10}]
    const monthsOfData = 3

    const result = sparesWarningArray(sparesCount, sparesUsed, monthsOfData)

    expect(result.outArray.length).toBe(1)
    expect(result.warningsArray.length).toBe(1)
});
