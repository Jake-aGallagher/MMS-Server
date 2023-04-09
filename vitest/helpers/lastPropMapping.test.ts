import { it, expect } from 'vitest'
import lastPropMapping from '../../src/helpers/properties/lastPropMapping'

const properties = [{id: 1, name: 'testA'},{id: 2, name: 'testB'}]

it('should return array of properties with a last viewed property', () => {
    const result = lastPropMapping(properties, 1)

    expect(result[0]).toHaveProperty('lastProperty')
    expect(result[1]).not.toHaveProperty('lastProperty')
})