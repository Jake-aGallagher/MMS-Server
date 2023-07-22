import { it, expect } from 'vitest'
import assignedIdList from '../../src/helpers/assignedIdsList';

it('should return list of ids if users array is passed', () => {
    const usersList = [{id: 5}, {id: 12}]

    const result = assignedIdList(usersList)

    expect(result).toStrictEqual([5, 12])
})

it('should return empty list empty users array is passed', () => {
    const usersList = []

    const result = assignedIdList(usersList)

    expect(result).toStrictEqual([])
})