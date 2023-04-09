import { it, expect } from 'vitest';
import propertyUsersList from '../../src/helpers/properties/propertyUsersList';

const users = [
    { id: 1, username: 'testA', password: '', first_name: 'testA', last_name: 'testA', authority: 2 },
    { id: 2, username: 'testB', password: '', first_name: 'testB', last_name: 'testB', authority: 4 },
    { id: 3, username: 'testC', password: '', first_name: 'testC', last_name: 'testC', authority: 1 },
];

it('should return array of assigned an unassigned Users', () => {
    const assignedList = [1,2,]

    const result = propertyUsersList(users, assignedList)

    expect(result.length).toBe(2)
    expect(result[0].assigned).toBeTruthy
    expect(result[1].assigned).toBeFalsy
});


