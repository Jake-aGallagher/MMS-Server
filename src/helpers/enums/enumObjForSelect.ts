import { ValuesByGroupIds } from "../../types/enums";

export const enumObjForSelect = (raw: ValuesByGroupIds[]) => {
    const obj: { [key: string]: {id: number; value: string}[] } = {};
    raw.forEach((item) => {
        if (!obj[item.enum_group_id]) {
            obj[item.enum_group_id] = [];
        }
        obj[item.enum_group_id].push({id: item.id, value: item.value});
    });
    return obj;
}