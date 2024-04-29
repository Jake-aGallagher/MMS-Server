/// @ts-nocheck
import { it, expect } from 'vitest'
import { SparesDetails, recentlyUsed } from '../../src/types/spares';
import allSparesAddUsage from '../../src/helpers/spares/allSparesAddUsage'

const spares: SparesDetails[] = [{ id:1 }]

it('should return data with avg used facility attached', () => {
    const sparesUsed: recentlyUsed[] = [{spare_id: 1, total_used: 15}]

    const result = allSparesAddUsage(spares, sparesUsed, 3)

    expect(result[0].avg_usage).toBe(5)
})

it('should return data with avg used set to 0 if not provided any used data', () => {
    const sparesUsed: recentlyUsed[] = [{spare_id: 2, total_used: 15}]

    const result = allSparesAddUsage(spares, sparesUsed, 3)

    expect(result[0].avg_usage).toBe(0)
})