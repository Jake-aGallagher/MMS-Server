import { FacilityBasics } from "../../types/facilities";

export default function lastFacilityMapping(allFacilities: FacilityBasics[], lastFacilityId: number) {
    const facilityListWithMapping = allFacilities.map((facility) => {
        if (facility.id === lastFacilityId) {
            return { ...facility, lastFacility: true };
        } else {
            return { ...facility };
        }
    });
    return facilityListWithMapping
}