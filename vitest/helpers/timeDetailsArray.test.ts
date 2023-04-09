import { it, expect } from 'vitest';
import timeDetailsArray from '../../src/helpers/jobs/timeDetailsArray';

const timeDetails = [{
    id: 1,
    time: 10
}]

it('should set the user details of the logged time if provided', () => {
    const usersArray = [{ id: 1, username: 'testA', authority: 3, first: 'Test', last: 'A'}]

    const result = timeDetailsArray(timeDetails, usersArray)

    expect(result[0].first).toBe('Test')
})

it('should set the user details as unknown if no details provided', () => {
    const usersArray = [{ id: 2, username: 'testA', authority: 3, first: 'Test', last: 'A'}]

    const result = timeDetailsArray(timeDetails, usersArray)

    expect(result[0].first).toBe('Unknown')
})

it('should set the time details correctly', () => {
    const usersArray = [{ id: 1, username: 'testA', authority: 3, first: 'Test', last: 'A'}]

    const result = timeDetailsArray(timeDetails, usersArray)

    expect(result[0].time).toBe(10)
})