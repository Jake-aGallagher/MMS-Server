import { it, expect } from 'vitest';
import smallStockArray from '../../src/helpers/jobs/smallStockArray';

it('should create a new array containing all of the passed array with the correct keys', () => {
    const newSpares = [{
        id: 1,
        part_no: 'testA',
        name: 'TestA',
        num_used: 5
    }]

    const result = smallStockArray(newSpares)

    expect(result[0]).haveOwnPropertyDescriptor('id')
    expect(result[0]).haveOwnPropertyDescriptor('used')
})

it('should create a new array containing all of the passed array', () => {
    const newSpares = [{
        id: 1,
        part_no: 'testA',
        name: 'TestA',
        num_used: 5
    }]

    const result = smallStockArray(newSpares)

    expect(result.length).toBe(1)
})