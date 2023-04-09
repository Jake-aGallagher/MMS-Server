import { it, expect } from 'vitest'
import makeAssetTree from '../../src/helpers/assets/makeAssetTree'

const list = [{
    id: 1,
    parentId: 0,
    name: 'testA',
    breadcrumbs: [],
    children: null
},{
    id: 2,
    parentId: 1,
    name: 'testB',
    breadcrumbs: [],
    children: null
}]

it('should transform the children key into an array', () => {
    const results = makeAssetTree(list)

    expect(results[0]).toHaveProperty('children')
    /// @ts-ignore
    expect(Array.isArray(results[0].children)).toBeTruthy
})

it('should create a tree structure from provided list', () => {
    const results = makeAssetTree(list)

    expect(results.length).toBe(1)
    /// @ts-ignore
    expect(results[0].children[0].id).toBe(2)
})

it('should create a tree structure from provided list if list does not start at root', () => {
    list[0].parentId = 3;
    list[0].id = 4;
    list[1].parentId = 4;
    list[1].id = 5;
    const results = makeAssetTree(list, 3)

    expect(results.length).toBe(1)
    /// @ts-ignore
    expect(results[0].children[0].id).toBe(5)
})

