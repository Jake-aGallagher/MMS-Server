import { it, expect } from 'vitest';
import propertyUsersList from '../../src/helpers/properties/propertyUsersList';

const users = [
    { id: 1, username: 'testA', first_name: 'testA', last_name: 'testA', user_group_id: 2 },
    { id: 2, username: 'testB', first_name: 'testB', last_name: 'testB', user_group_id: 4 },
    { id: 3, username: 'testC', first_name: 'testC', last_name: 'testC', user_group_id: 1 },
];

it('should return array of assigned an unassigned Users', () => {
    const assignedList = [1,2,]

    // @ts-ignore
    const result = propertyUsersList(users, assignedList)

    expect(result.length).toBe(2)
    expect(result[0].assigned).toBeTruthy
    expect(result[1].assigned).toBeFalsy
});


