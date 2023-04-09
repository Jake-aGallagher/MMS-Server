import { it, expect } from 'vitest'
import deliveryContents from '../../src/helpers/spares/deliveryContents'

const delivery = [{
    id: 2,
    name: 'nameB',
    supplier: 'supplierB',
    courier: 'courierB',
    placed: '01/01/2000',
    due: '01/01/2001',
    contents: []
}];


it('should add the items to the appropriate delivery', () => {
    const deliveryItems = [{
        delivery_id: 4,
        spare_id: 4,
        quantity: 4,
        part_no: 'PartA',
        name: 'nameA'
    }]

    const deliveryMap = { 4: 0 };

    const result = deliveryContents(deliveryItems, delivery, deliveryMap)

    expect(result[0].contents.length).toBe(1)
})