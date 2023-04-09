import { PropertyBasics } from "../../types/properties";

export default function lastPropMapping(allProps: PropertyBasics[], lastPropId: number) {
    const propsListWithMapping = allProps.map((property) => {
        if (property.id === lastPropId) {
            return { ...property, lastProperty: true };
        } else {
            return { ...property };
        }
    });
    return propsListWithMapping
}