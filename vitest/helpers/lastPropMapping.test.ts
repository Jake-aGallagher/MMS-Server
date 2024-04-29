import { it, expect } from 'vitest'
import lastFacilityMapping from '../../src/helpers/facilities/lastFacilityMapping'

const facilities = [{id: 1, name: 'testA'},{id: 2, name: 'testB'}]

it('should return array of facilities with a last viewed facility', () => {
    // @ts-ignore
    const result = lastFacilityMapping(facilities, 1)

    expect(result[0]).toHaveProperty('lastFacility')
    expect(result[1]).not.toHaveProperty('lastFacility')
})