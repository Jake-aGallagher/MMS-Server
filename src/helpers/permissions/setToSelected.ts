import { AllPermissions, PermissionsList } from '../../types/permissions';

export default function setToSelected(allPermissions: AllPermissions[], selected: number[]) {
    const permissionsList = <PermissionsList[]>[];
    allPermissions.forEach((permission) => {
        if (selected.includes(permission.id)) {
            permissionsList.push({ ...permission, selected: true });
        } else {
            permissionsList.push({ ...permission, selected: false });
        }
    });
    return permissionsList;
}
