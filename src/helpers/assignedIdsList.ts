export default function assignedIdsList(assigned: {id: number}[]) {
    const assignedlist = <number[]>[];
    assigned.forEach((user) => {
        assignedlist.push(user.id);
    });
    return assignedlist
}