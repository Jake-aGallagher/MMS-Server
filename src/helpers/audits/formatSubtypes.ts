import { getAllJobTypes } from "../../models/maintenance/taskTypes";

export const formatSubtypes = async (client: string, type: string, assignments: { assignment_id: number; version_id: number; title: string; event_subtype: number }[]) => {
    let subtypes: { id: number; title: string }[] = [];
    switch (type) {
        case 'jobs':
            subtypes = await jobTypes(client);
            break;
        case 'suppliers':
            subtypes = [
                { id: 1, title: 'Pre-Signup Verification' },
                { id: 2, title: 'Performance Check' },
            ];
    }

    return subtypes.map((subtype) => {
        const foundAssignment = assignments.find((assignment) => subtype.id == assignment.event_subtype);
        const assignment_obj = {
            subtype_id: subtype.id,
            subtype_title: subtype.title,
            assignment_id: foundAssignment?.assignment_id,
            assignment_title: foundAssignment?.title
        }
        return assignment_obj;
    });
};

const jobTypes = async (client: string) => {
    const types = await getAllJobTypes(client);
    return types.map((type) => {
        return { id: type.id, title: type.value };
    });
}