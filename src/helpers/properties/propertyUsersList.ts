import { UserLongName } from "../../types/users";

export default function propertyUsersList(allUsers: UserLongName[], assignedlist: number[]) {
    const usersList = <UserLongName[]>[];
    allUsers.forEach((user) => {
        if (assignedlist.includes(user.id) && user.user_group_id != 1) {
            usersList.push({ ...user, assigned: true });
        } else if (user.user_group_id != 1) {
            usersList.push({ ...user, assigned: false });
        }
    });
    return usersList;
}
