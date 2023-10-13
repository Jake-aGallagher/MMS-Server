export default function calcTotalLoggedTime(timeArray: [{ id: number; time: number }]) {
    let totalTime = 0;
    timeArray.forEach((item) => {
        totalTime += item.time;
    });

    return totalTime;
}
