import { TimeDetails, TimeDetailsFull } from "../../types/maintenance/jobs";
import { UserShortName } from "../../types/users";

export default function timeDetailsArray(timeDetails: TimeDetails[], users: UserShortName[]) {
    let timeDetailsFull = <TimeDetailsFull[]>[];
    timeDetails.forEach((pair) => {
        const i = users.findIndex((j) => j.id === pair.id);
        if (i > -1) {
            timeDetailsFull.push({ id: pair.id, time: pair.time, first: users[i].first, last: users[i].last });
        } else {
            timeDetailsFull.push({ id: pair.id, time: pair.time, first: 'Unknown', last: 'Unknown' });
        }
    });
    return timeDetailsFull
}
