export default function assignedUsersList(assigned: {id: number}[]) {
    const assignedlist = <number[]>[];
    assigned.forEach((user) => {
        assignedlist.push(user.id);
    });
    return assignedlist
}