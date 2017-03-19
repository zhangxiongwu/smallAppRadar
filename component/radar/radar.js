let width = 750; // canvas的宽
let height = 750; // canvas的高

let angleNum = 7; // 角数，即多少个数据项 【3，10】
let angleAvg = 360 / angleNum; // 分角度平均值
let angleOffset = 13; // 角度偏移量
let layerNum = 7; // 层数，即环层数量
let layerWidth = 0; // 层宽
let bgLineColor = '#ffffff'; // 背景线条颜色
let bgLineWidth = 0; // 背景线条宽度
let centerPoint = [0, 0]; // 中心点坐标
let layerPoints = []; // 各层上的点

let wordColor = '#ffffff'; // 字体颜色
let fontSize = 0; // 字体大小
let wordArr = ['项A', '项B', '项C', '项D', '项E', '项F', '项G']; // 字体数组
let wordOffset = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
let circleWidth = 0; // 圆点宽度

// 绘制的雷达比例数据
let dataArr = [5, 2, 6, 2, 6, 0, 3];

let context =null;
let windowWidth = 0;

let radar = {
    init: function(data) {
        centerPoint = [rpx(375), rpx(375)];
        layerWidth = rpx(34);
        bgLineWidth = rpx(1.6);
        fontSize = rpx(26);
        circleWidth = rpx(8);
        wordOffset = [
            [rpx(-30), rpx(40)], 
            [rpx(40), rpx(40)], 
            [rpx(65), rpx(10)], 
            [rpx(90), rpx(0)], 
            [rpx(-25), rpx(15)], 
            [rpx(15), rpx(-5)], 
            [rpx(10), rpx(15)]
        ];
    },
    draw: function(data) {
        let n = 0, m = 0, k = 0;
        this.init(data);
        //画背景线条
        context = wx.createContext();
        context.setLineWidth(bgLineWidth);
        context.setStrokeStyle(bgLineColor);
        context.beginPath();
        context.setFontSize(fontSize);
        context.setFillStyle(wordColor);

        for(n = 0; n < layerNum; n++) {
            layerPoints[n] = [];
            for(k = 0; k < angleNum; k++) { 
                context.moveTo(centerPoint[0], centerPoint[1]);
                let offsetX = layerWidth * (n + 1) * getXParam(angleAvg * (k + 1) + angleOffset);
                let offsetY = layerWidth * (n + 1) * getYParam(angleAvg * (k + 1) + angleOffset);
                let distX = centerPoint[0] + offsetX;
                let distY = centerPoint[1] + offsetY;
                if(n == layerNum - 1) {
                    context.lineTo(distX, distY);
                    if(wordArr[k]) {
                        let wordOffsetX = offsetX >= 0 ? 1 : -1;
                        wordOffsetX = distX + wordOffsetX * wordOffset[k][0];
                        let wordOffsetY = offsetY >= 0 ? 1 : -1;
                        wordOffsetY = distY + wordOffsetY * wordOffset[k][1];
                        context.fillText(wordArr[k], wordOffsetX, wordOffsetY); 
                    }
                }
                layerPoints[n][k] = [distX, distY];
            }
        }

        for(m = 0; m < layerPoints.length; m++) {
            for(n = 0; n < layerPoints[m].length; n++) {
                context.moveTo(layerPoints[m][n][0], layerPoints[m][n][1]);
                if(n < layerPoints[m].length - 1) {
                    context.lineTo(layerPoints[m][n + 1][0], layerPoints[m][n + 1][1]);
                } else {
                    context.moveTo(layerPoints[m][n][0], layerPoints[m][n][1]);
                    context.lineTo(layerPoints[m][0][0], layerPoints[m][0][1]);
                }
            }
        }
        context.stroke();

        // 绘制比例:
        context.beginPath();
        context.setStrokeStyle("rgba(77,168,213,0.85)");
        context.setFillStyle("rgba(77,168,213,0.85)");

        let isFirstPoint = true;
        let tmpPoints = [];
        for(m = 0; m < angleNum; m++) {
            tmpPoints = centerPoint;
            if(dataArr[m] > 0) {
                for(n = 0; n < layerNum; n++) {
                    if(dataArr[m] == (n + 1)) {
                        tmpPoints = layerPoints[n][m];
                        break;
                    }
                }
            }
            if(isFirstPoint) {
                context.moveTo(tmpPoints[0], tmpPoints[1]);
                isFirstPoint = false;
            } else {
                context.lineTo(tmpPoints[0], tmpPoints[1]);
            }
        }

        context.fill();
        context.stroke();
        context.closePath();

        // 绘制圆点：
       

        for(m = 0; m < angleNum; m++) {
            tmpPoints = centerPoint;
            if(dataArr[m] > 0) {
                for(n = 0; n < layerNum; n++) {
                    if(dataArr[m] == (n + 1)) {
                        tmpPoints = layerPoints[n][m];
                        break;
                    }
                }
            }
            context.beginPath();
            context.setStrokeStyle("rgba(61,147,189,0.9)");
            context.setFillStyle("rgba(61,147,189,0.9)");
            context.closePath();
            context.arc(tmpPoints[0], tmpPoints[1], circleWidth, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
            context.stroke();
        }

        

        wx.drawCanvas({
            canvasId: 'radarCanvas',
            actions: context.getActions()
        });
    }
};

let rpx = (param) => { 
    if(windowWidth == 0) {
        wx.getSystemInfo({
            success: function (res) {
                windowWidth = res.windowWidth;
            }
        });
    }
    return Number((windowWidth / 750 * param).toFixed(2));
};

let getXParam = (angle) => {
    let param = 1;
    if(angle >= 0 && angle < 90) {
        param = 1;
    } else if(angle >= 90 && angle < 180) {
        param = -1;
        angle = 180 - angle;
    } else if(angle >= 180 && angle < 270) {
        param = -1;
        angle = angle - 180;
    } else if(angle >= 270 && angle <= 360) {
        param = 1;
        angle = 360 - angle;
    }

    let angleCos = Math.cos(Math.PI / 180 * angle);
    if(angleCos < 0) {
        angleCos = angleCos * -1;
    }
    return angleCos * param;
};

let getYParam = (angle) => {
    let param = 1;
    if(angle >= 0 && angle < 90) {
        param = 1;
    } else if(angle >= 90 && angle < 180) {
        param = 1;
        angle = 180 - angle;
    } else if(angle >= 180 && angle < 270) {
        param = -1;
        angle = angle - 180;
    } else if(angle >= 270 && angle <= 360) {
        param = -1;
        angle = 360 - angle;
    }

    let angleSin = Math.sin(Math.PI / 180 * angle);
    if(angleSin < 0) {
        angleSin = angleSin * -1;
    }
    return angleSin * param;
};

module.exports = {
    radar
};
