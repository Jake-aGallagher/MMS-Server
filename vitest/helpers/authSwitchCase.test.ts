import { it, expect } from 'vitest'
import authSwitchCase from '../../src/helpers/users/authSwitchCase'

it('should return 4 if Admin string is provided', () => {
    const authString = 'Admin'

    const result = authSwitchCase(authString)

    expect(result).toBe(4)
})

it('should return 3 if Manager string is provided', () => {
    const authString = 'Manager'

    const result = authSwitchCase(authString)

    expect(result).toBe(3)
})

it('should return 2 if Engineer string is provided', () => {
    const authString = 'Engineer'

    const result = authSwitchCase(authString)

    expect(result).toBe(2)
})

it('should return default of 1 if invalid string is passed', () => {
    const authString = 'invalid'

    const result = authSwitchCase(authString)

    expect(result).toBe(1)
})