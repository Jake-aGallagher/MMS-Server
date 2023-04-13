/// @ts-nocheck
import { it, expect } from 'vitest'
import deliveryArrivedUpdateStock from '../../src/helpers/spares/deliveryArrivedUpdateStock'
import { CurrentStock, DeliveryItem } from '../../src/types/spares'

const oldStock: CurrentStock[] = [{id: 1, quant_remain: 5}, {id: 2, quant_remain: 2}]

it('should update stock level if included in delivery', () => {
    const deliveryItems: DeliveryItem[] = [{spare_id: 1, quantity: 3}]

    const result = deliveryArrivedUpdateStock(oldStock, deliveryItems)

    expect(result[0].quant_remain).toBe(8)
})

it('should not update stock level if not included in delivery', () => {
    const deliveryItems: DeliveryItem[] = [{spare_id: 1, quantity: 3}]

    const result = deliveryArrivedUpdateStock(oldStock, deliveryItems)

    expect(result.length).toBe(1)
})


