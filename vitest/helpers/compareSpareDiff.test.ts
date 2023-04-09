import { it, expect } from 'vitest';
import compareSpareDiff from '../../src/helpers/jobs/compareSpareDiff';

const prevSpares = [{ id: 1, part_no: 'testA', name: 'testA', num_used: 3 }];

it('should return empty arrays if no changes', () => {
    const newSpares = [{ id: 1, part_no: 'testA', name: 'testA', num_used: 3 }];

    const result = compareSpareDiff(newSpares, prevSpares)

    expect(result.diffArray).toHaveLength(0)
    expect(result.stockChangesArray).toHaveLength(0)
})

it('should return the correct change of quantity of items used', () => {
    const newSpares = [{ id: 1, part_no: 'testA', name: 'testA', num_used: 5 }];

    const result = compareSpareDiff(newSpares, prevSpares)

    expect(result.stockChangesArray[0].used).toBe(2)
})

it('should return the correct change of quantity of items used when items returned from a job', () => {
    const newSpares = [{ id: 1, part_no: 'testA', name: 'testA', num_used: 1 }];

    const result = compareSpareDiff(newSpares, prevSpares)

    expect(result.stockChangesArray[0].used).toBe(-2)
})

it('should push the spares item to the difference array if there is a difference in quantity used', () => {
    const newSpares = [{ id: 1, part_no: 'testA', name: 'testA', num_used: 4 }];

    const result = compareSpareDiff(newSpares, prevSpares)

    expect(result.diffArray[0].id).toBe(1)
    expect(result.diffArray[0].num_used).toBe(4)
})
