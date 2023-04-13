import { SparesDetails, recentlyUsed } from '../../types/spares';

export default function allSparesAddUsage(spares: SparesDetails[], sparesUsed: recentlyUsed[], monthsOfData: number) {
    const map: { [key: number]: number } = {};

    sparesUsed.forEach((i) => {
        map[i.spare_id] = i.total_used;
    });

    for (let i = 0; i < spares.length; i++) {
        if (map[spares[i].id] != undefined) {
            spares[i].avg_usage = Math.round((map[spares[i].id] / monthsOfData) * 100) / 100;
        } else {
            spares[i].avg_usage = 0;
        }
    }

    return spares;
}
