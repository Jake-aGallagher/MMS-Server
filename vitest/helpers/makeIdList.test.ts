import { it, expect } from 'vitest';
import makeIdList from '../../src/helpers/makeIdList';

it('should return array of Ids for passed in array', () => {
    const list = [{id: 1}, {id:3}]

    const results = makeIdList(list, 'id')

    expect(results.length).toEqual(list.length)
})

it('should not return array of Ids for passed in array if search key is wrong', () => {
    const list = [{id: 1}, {id:3}]

    const results = makeIdList(list, '')

    expect(results.length).toBe(0)
})