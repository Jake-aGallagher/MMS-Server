export default function makeIdList(itemsList: any[], idParam: string) {
    const idList = <number[]>[];
    itemsList.forEach((i) => {
        if (i[idParam]) {
            idList.push(i[idParam]);
        }
    });
    return idList;
}
