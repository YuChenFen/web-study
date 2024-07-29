const canvas = document.querySelector("canvas");
const SIZE = Math.min(window.innerWidth, window.innerHeight) / 6 * 5;
canvas.width = SIZE;
canvas.height = SIZE;

// 版本
const VERSION = 10;
const painter = new Painter(canvas, "2d", VERSION);

function toUtf8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

// 绘制网格
painter.drawGrid();
// 添加定位图案
painter.addLocation();
// 添加对齐图案
painter.addAlignment();
// 添加时序图
painter.addTimeline();
// 添加格式信息
painter.addFormatInfo(errorCorrectionLevel = "M", maskPatternReference = 0);
// 添加版本信息
painter.addVersionInfo();
// 添加数据
painter.addData(toUtf8("你在干什么？？？"), 0b0100);
// 添加掩膜
painter.addMask();
// 绘制
painter.drawCode();

