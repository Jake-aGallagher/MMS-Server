import { it, expect } from 'vitest'
import assignedUsersList from '../../src/helpers/properties/assignedUsersList'

it('should return list of ids if users array is passed', () => {
    const usersList = [{id: 5}, {id: 12}]

    const result = assignedUsersList(usersList)

    expect(result).toStrictEqual([5, 12])
})

it('should return empty list empty users array is passed', () => {
    const usersList = []

    const result = assignedUsersList(usersList)

    expect(result).toStrictEqual([])
})