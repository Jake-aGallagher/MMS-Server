import { UserLongName } from "../../types/users";

export default function propertyUsersList(allUsers: UserLongName[], assignedlist: number[]) {
    const usersList = <UserLongName[]>[];
    allUsers.forEach((user) => {
        if (assignedlist.includes(user.id) && user.authority != 4) {
            usersList.push({ ...user, assigned: true });
        } else if (user.authority != 4) {
            usersList.push({ ...user, assigned: false });
        }
    });
    return usersList;
}
