function getPathPoints(svgText, scale = 1, delta = 0.5) {
    const svgTemp = document.createElement("span");
    svgTemp.innerHTML = svgText;

    const svg = svgTemp.firstElementChild;
    const path = svg.querySelectorAll("path");
    let maxX = 0;
    let maxY = 0;
    let pathData = [];
    for (let i = 0; i < path.length; i++) {
        let pathPoints = [];
        let pathLength = path[i].getTotalLength();
        for (let j = 0; j < pathLength; j += delta) {
            let point = path[i].getPointAtLength(j);
            pathPoints.push({
                x: point.x * scale,
                y: point.y * scale
            });
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        pathData.push(pathPoints);
    }
    maxX *= scale;
    maxY *= scale;
    for (let i = 0; i < pathData.length; i++) {
        for (let j = 0; j < pathData[i].length; j++) {
            pathData[i][j].x -= maxX / 2;
            pathData[i][j].y -= maxY / 2;
        }
    }
    return pathData;
}