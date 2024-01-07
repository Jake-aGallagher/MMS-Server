import { ExtendedStock, recentlyUsed, WarningArrays } from "../../types/spares";

export default function sparesWarningArray(sparesCount: ExtendedStock[], sparesUsed: recentlyUsed[], monthsOfData: number) {
    const warningsArray = <WarningArrays[]>[];
    const outArray = <WarningArrays[]>[];
    sparesCount.forEach((item) => {
        const data = sparesUsed.find((x) => x.spare_id === item.id);
        if (item.quant_remain <= 0) {
            outArray.push({
                id: item.id,
                part_no: item.part_no,
                name: item.name,
                supplier: item.supplier,
                quant_remain: item.quant_remain,
                monthly_usage: data?.total_used ? Math.round((data.total_used / monthsOfData + Number.EPSILON) * 100) / 100 : 'Unknown',
            });
        } else {
            if (data) {
                if (item.quant_remain / (data.total_used / monthsOfData) <= 1) {
                    warningsArray.push({
                        id: item.id,
                        part_no: item.part_no,
                        name: item.name,
                        supplier: item.supplier,
                        quant_remain: item.quant_remain,
                        monthly_usage: Math.round((data.total_used / monthsOfData + Number.EPSILON) * 100) / 100,
                    });
                }
            }
        }
    });
    return { outArray, warningsArray };
}
