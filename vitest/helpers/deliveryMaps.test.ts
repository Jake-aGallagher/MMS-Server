import { it, expect } from 'vitest'
import deliveryMaps from '../../src/helpers/spares/deliveryMaps'

const deliveries = [{
        id: 2,
        name: 'nameB',
        supplier: 'supplierB',
        courier: 'courierB',
        placed: '01/01/2000',
        due: '01/01/2001',
        contents: []
    },{
        id: 4,
        name: 'nameA',
        supplier: 'supplierA',
        courier: 'courierA',
        placed: '01/01/2000',
        due: '01/01/2001',
        contents: []
    }];


it('should create a map { delivery Id: position in array }', () => {
    const results = deliveryMaps(deliveries)

    expect(results.deliveryMap[4]).toBe(1)
})

it('should create an array of the delivery Ids', () => {
    const results = deliveryMaps(deliveries)

    expect(results.deliveryIds.length).toBe(deliveries.length)
})