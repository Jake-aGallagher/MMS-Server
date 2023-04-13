export default function propIdsForUser(propertiesList: {id: number}[], ) {
    let propIds = <number[]>[]
    propertiesList.forEach((property) => {
        propIds.push(property.id);
    });
    return propIds
} 