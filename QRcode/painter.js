class DataEncode {
    /**
     * 版本   | 数字模式 | 字母数字模式 | 8位字节模式 | 日本汉字模式 | 中国汉字模式
     *  1~9   |   10    |      9      |     8      |      8      |
     *  10~26 |   12    |      11     |     16     |      10     |
     *  27~40 |   14    |      13     |     16     |      12     |
     */
    static CHRE_COUNT_BITS = [
        [10, 9, 8, 8],
        [12, 11, 16, 10],
        [14, 13, 16, 12]
    ];
    /* 字母数字表格 */
    static LETTER_NUMBER_ENCODE_TABLE = {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "A": 10,
        "B": 11,
        "C": 12,
        "D": 13,
        "E": 14,
        "F": 15,
        "G": 16,
        "H": 17,
        "I": 18,
        "J": 19,
        "K": 20,
        "L": 21,
        "M": 22,
        "N": 23,
        "O": 24,
        "P": 25,
        "Q": 26,
        "R": 27,
        "S": 28,
        "T": 29,
        "U": 30,
        "V": 31,
        "W": 32,
        "X": 33,
        "Y": 34,
        "Z": 35,
        " ": 36,
        "$": 37,
        "%": 38,
        "*": 39,
        "+": 40,
        "-": 41,
        ".": 42,
        "/": 43,
        ":": 44,
    }

    /**
     * ECI                  0b0111
     * 数字                 0b0001
     * 字母数字             0b0010
     * 8位字节              0b0100
     * 日本汉字             0b1000
     * 中国汉字             0b1101
     * 结构链接             0b0011
     * FNC1                 0b0101 (第一位置)
     *                      0b1001 (第二位置)
     * 终止符（信息结尾）    0b0000
     */
    /**
     * @param {Object} data 数据 
     * @param {number} version 版本
     * @param {number} mode 模式
     */
    static getDataEncode(data, version, mode) {
        let modeIndex = -1;
        let versionIndex = -1;
        switch (mode) {
            case 0b0001: modeIndex = 0; break;
            case 0b0010: modeIndex = 1; break;
            case 0b0100: modeIndex = 2; break;
            case 0b1000: modeIndex = 3; break;
        }
        if (version >= 1 && version <= 9) {
            versionIndex = 0;
        } else if (version >= 10 && version <= 26) {
            versionIndex = 1;
        } else if (version >= 27 && version <= 40) {
            versionIndex = 2;
        }
        if (modeIndex == -1) {
            throw new Error("没有找到对应的模式");
        }
        if (versionIndex == -1) {
            throw new Error("没有找到对应的版本");
        }
        // 数字编码
        let dataArray = [];
        let dataBitArray = [];
        // 添加编码模式
        let charCountLength = DataEncode.CHRE_COUNT_BITS[versionIndex][modeIndex];
        for (let i = 3; i >= 0; i--) {
            dataBitArray.push((mode >> i) & 1);
        }
        // 添加长度
        let dataLength = data.length;
        for (let i = charCountLength - 1; i >= 0; i--) {
            dataBitArray.push((dataLength >> i) & 1);
        }

        switch (mode) {
            case 0b0001: DataEncode.numberEncode(data, dataBitArray); break;
            case 0b0010: DataEncode.letterNumberEncode(data, dataBitArray); break;
            case 0b0100: DataEncode.byteEncode(data, dataBitArray); break;
            case 0b1000: DataEncode.japaneseEncode(data, dataBitArray); break;
        }


        // 添加结束符
        for (let i = 0; i < 4; i++) {
            dataBitArray.push(0);
        }

        // 长度为8的倍数
        while (dataBitArray.length % 8 != 0) {
            dataBitArray.push(0);
        }

        let i = 0, end = dataBitArray.length;
        while (i < end) {
            let value = 0;
            for (let j = 0; j < 8; j++) {
                value += dataBitArray[i + j] << (7 - j);
            }
            dataArray.push(value);
            i += 8;
        }

        return dataArray;
    }

    /**
     * 数字编码
     * @param {string} data 数据
     * @param {Array} dataBitArray 数据位数组
     */
    static numberEncode(data, dataBitArray) {
        // 每3个一位
        let charArray = [];
        for (let i = 0; i < data.length; i += 3) {
            charArray.push(data.substring(i, i + 3));
        }
        // 添加数据
        for (let i = 0; i < charArray.length; i++) {
            let num = Number(charArray[i]);
            let bitLength = 0;
            if (charArray[i].length === 3) {
                bitLength = 10;
            } else if (charArray[i].length === 2) {
                bitLength = 7;
            } else if (charArray[i].length === 1) {
                bitLength = 4;
            }

            for (let i = bitLength - 1; i >= 0; i--) {
                dataBitArray.push((num >> i) & 1);
            }
        }
        return dataBitArray;
    }

    /**
     * 字母数字编码
     * @param {*} data 
     * @param {*} dataBitArray 
     */
    static letterNumberEncode(data, dataBitArray) {
        let charArray = [];
        for (let i = 0; i < data.length; i += 2) {
            charArray.push(data.substring(i, i + 2));
        }
        for (let i = 0; i < charArray.length; i++) {
            let num, bitLength;
            if (charArray[i].length == 2) {
                num = DataEncode.LETTER_NUMBER_ENCODE_TABLE[charArray[i][0]] * 45 + DataEncode.LETTER_NUMBER_ENCODE_TABLE[charArray[i][1]];
                bitLength = 11;
            } else {
                num = DataEncode.LETTER_NUMBER_ENCODE_TABLE[charArray[i][0]];
                bitLength = 6;
            }
            for (let i = bitLength - 1; i >= 0; i--) {
                dataBitArray.push((num >> i) & 1);
            }
        }
        return dataBitArray;
    }

    /**
     * 8位字节编码
     * @param {*} data 
     * @param {*} dataBitArray 
     */
    static byteEncode(data, dataBitArray) {
        for (let i = 0; i < data.length; i++) {
            let num = data.charCodeAt(i);
            for (let j = 7; j >= 0; j--) {
                dataBitArray.push((num >> j) & 1);
            }
        }
    }

    /**
     * 日本汉字编码
     * @param {*} data 
     * @param {*} dataBitArray 
     */
    static japaneseEncode(data, dataBitArray) {
        throw new Error("暂不支持");
    }
}

class PaddingData {
    static PADDING_DATA = {
        "1-L": 152,
        "1-M": 128,
        "1-Q": 104,
        "1-H": 72,
        "2-L": 272,
        "2-M": 224,
        "2-Q": 176,
        "2-H": 128,
        "3-L": 440,
        "3-M": 352,
        "3-Q": 272,
        "3-H": 208,
        "4-L": 640,
        "4-M": 512,
        "4-Q": 384,
        "4-H": 288,
        "5-L": 864,
        "5-M": 688,
        "5-Q": 496,
        "5-H": 368,
        "6-L": 1088,
        "6-M": 864,
        "6-Q": 608,
        "6-H": 480,
        "7-L": 1248,
        "7-M": 992,
        "7-Q": 704,
        "7-H": 528,
        "8-L": 1552,
        "8-M": 1232,
        "8-Q": 880,
        "8-H": 688,
        "9-L": 1856,
        "9-M": 1456,
        "9-Q": 1056,
        "9-H": 800,
        "10-L": 2192,
        "10-M": 1728,
        "10-Q": 1232,
        "10-H": 976,
        "11-L": 2592,
        "11-M": 2032,
        "11-Q": 1440,
        "11-H": 1120,
        "12-L": 2960,
        "12-M": 2320,
        "12-Q": 1648,
        "12-H": 1264,
        "13-L": 3424,
        "13-M": 2672,
        "13-Q": 1952,
        "13-H": 1440,
        "14-L": 3688,
        "14-M": 3920,
        "14-Q": 2088,
        "14-H": 1576,
        "15-L": 4184,
        "15-M": 3320,
        "15-Q": 2360,
        "15-H": 1784,
        "16-L": 4712,
        "16-M": 3624,
        "16-Q": 2600,
        "16-H": 2024,
        "17-L": 5176,
        "17-M": 4056,
        "17-Q": 2936,
        "17-H": 2264,
        "18-L": 5768,
        "18-M": 4504,
        "18-Q": 3176,
        "18-H": 2504,
        "19-L": 6360,
        "19-M": 5016,
        "19-Q": 3560,
        "19-H": 2728,
        "20-L": 6888,
        "20-M": 5352,
        "20-Q": 3880,
        "20-H": 3080,
        "21-L": 7456,
        "21-M": 5712,
        "21-Q": 4096,
        "21-H": 3248,
        "22-L": 8048,
        "22-M": 6256,
        "22-Q": 4544,
        "22-H": 3536,
        "23-L": 8752,
        "23-M": 6880,
        "23-Q": 4912,
        "23-H": 3712,
        "24-L": 9392,
        "24-M": 7312,
        "24-Q": 5312,
        "24-H": 4112,
        "25-L": 10208,
        "25-M": 8000,
        "25-Q": 5744,
        "25-H": 4304,
        "26-L": 10960,
        "26-M": 8496,
        "26-Q": 6032,
        "26-H": 4768,
        "27-L": 11744,
        "27-M": 9024,
        "27-Q": 6464,
        "27-H": 5024,
        "28-L": 12248,
        "28-M": 9544,
        "28-Q": 6968,
        "28-H": 5288,
        "29-L": 13048,
        "29-M": 10136,
        "29-Q": 7288,
        "29-H": 5608,
        "30-L": 13880,
        "30-M": 10984,
        "30-Q": 7880,
        "30-H": 5960,
        "31-L": 14744,
        "31-M": 11640,
        "31-Q": 8264,
        "31-H": 6344,
        "32-L": 15640,
        "32-M": 12328,
        "32-Q": 8920,
        "32-H": 6760,
        "33-L": 16568,
        "33-M": 13048,
        "33-Q": 9368,
        "33-H": 7208,
        "34-L": 17528,
        "34-M": 13800,
        "34-Q": 9848,
        "34-H": 7688,
        "35-L": 18448,
        "35-M": 14496,
        "35-Q": 10288,
        "35-H": 7888,
        "36-L": 19472,
        "36-M": 15312,
        "36-Q": 10832,
        "36-H": 8432,
        "37-L": 20528,
        "37-M": 15936,
        "37-Q": 11408,
        "37-H": 8768,
        "38-L": 21616,
        "38-M": 16816,
        "38-Q": 12016,
        "38-H": 9136,
        "39-L": 22496,
        "39-M": 17728,
        "39-Q": 12656,
        "39-H": 9776,
        "40-L": 23648,
        "40-M": 18672,
        "40-Q": 13328,
        "40-H": 10208
    }

    static padding(data, version, errorCorrectionLevel) {
        let paddingData = PaddingData.PADDING_DATA[`${version}-${errorCorrectionLevel}`] / 8;
        let dataLength = data.length;
        const a = 0b11101100;
        const b = 0b00010001;
        while (dataLength < paddingData) {
            data.push(a);
            dataLength += 1;
            if (dataLength >= paddingData) {
                break;
            }
            data.push(b);
            dataLength += 1;
        }
        return data;
    }
}

class ECC {
    static PRIM = 0x11d;
    static GF_EXP = new Array(512);    // 逆对数（指数）表
    static GF_LOG = new Array(256);    // 对数表

    // 码字总数
    static DATA_BLOCKS_NUMBER = {
        "1-L": {
            blocksNumber: [1],
            dataCodes: [
                [26, 12, 2]
            ]
        },
        "1-M": {
            blocksNumber: [1],
            dataCodes: [
                [26, 16, 4]
            ]
        },
        "1-Q": {
            blocksNumber: [1],
            dataCodes: [
                [26, 13, 6]
            ]
        },
        "1-H": {
            blocksNumber: [1],
            dataCodes: [
                [26, 9, 8]
            ]
        },
        "2-L": {
            blocksNumber: [1],
            dataCodes: [
                [44, 34, 4]
            ]
        },
        "2-M": {
            blocksNumber: [1],
            dataCodes: [
                [44, 28, 8]
            ]
        },
        "2-Q": {
            blocksNumber: [1],
            dataCodes: [
                [44, 22, 11]
            ]
        },
        "2-H": {
            blocksNumber: [1],
            dataCodes: [
                [44, 16, 14]
            ]
        },
        "3-L": {
            blocksNumber: [1],
            dataCodes: [
                [70, 55, 7]
            ]
        },
        "3-M": {
            blocksNumber: [1],
            dataCodes: [
                [70, 44, 13]
            ]
        },
        "3-Q": {
            blocksNumber: [2],
            dataCodes: [
                [35, 17, 9]
            ]
        },
        "3-H": {
            blocksNumber: [2],
            dataCodes: [
                [35, 13, 11]
            ]
        },
        "4-L": {
            blocksNumber: [1],
            dataCodes: [
                [100, 80, 10]
            ]
        },
        "4-M": {
            blocksNumber: [2],
            dataCodes: [
                [50, 32, 9]
            ]
        },
        "4-Q": {
            blocksNumber: [2],
            dataCodes: [
                [50, 24, 13]
            ]
        },
        "4-H": {
            blocksNumber: [4],
            dataCodes: [
                [25, 9, 8]
            ]
        },
        "5-L": {
            blocksNumber: [1],
            dataCodes: [
                [134, 108, 13]
            ]
        },
        "5-M": {
            blocksNumber: [2],
            dataCodes: [
                [67, 43, 12]
            ]
        },
        "5-Q": {
            blocksNumber: [2, 2],
            dataCodes: [
                [33, 15, 9],
                [34, 16, 9]
            ]
        },
        "5-H": {
            blocksNumber: [2, 2],
            dataCodes: [
                [33, 11, 11],
                [34, 12, 11]
            ]
        },
        "6-L": {
            blocksNumber: [2],
            dataCodes: [
                [86, 68, 9]
            ]
        },
        "6-M": {
            blocksNumber: [4],
            dataCodes: [
                [43, 27, 8]
            ]
        },
        "6-Q": {
            blocksNumber: [4],
            dataCodes: [
                [43, 19, 12]
            ]
        },
        "6-H": {
            blocksNumber: [4],
            dataCodes: [
                [43, 15, 14]
            ]
        },
        "7-L": {
            blocksNumber: [2],
            dataCodes: [
                [98, 78, 10]
            ]
        },
        "7-M": {
            blocksNumber: [4],
            dataCodes: [
                [49, 31, 9]
            ]
        },
        "7-Q": {
            blocksNumber: [2, 4],
            dataCodes: [
                [32, 14, 9],
                [33, 15, 9]
            ]
        },
        "7-H": {
            blocksNumber: [4, 1],
            dataCodes: [
                [39, 13, 13],
                [40, 14, 13]
            ]
        },
        "8-L": {
            blocksNumber: [2],
            dataCodes: [
                [121, 97, 12]
            ]
        },
        "8-M": {
            blocksNumber: [2, 2],
            dataCodes: [
                [60, 38, 11],
                [61, 39, 11]
            ]
        },
        "8-Q": {
            blocksNumber: [4, 2],
            dataCodes: [
                [40, 18, 11],
                [41, 19, 11]
            ]
        },
        "8-H": {
            blocksNumber: [4, 2],
            dataCodes: [
                [40, 14, 13],
                [41, 15, 13]
            ]
        },
        "9-L": {
            blocksNumber: [2],
            dataCodes: [
                [146, 116, 15]
            ]
        },
        "9-M": {
            blocksNumber: [3, 2],
            dataCodes: [
                [58, 36, 11],
                [59, 37, 11]
            ]
        },
        "9-Q": {
            blocksNumber: [4, 4],
            dataCodes: [
                [36, 16, 10],
                [37, 17, 10]
            ]
        },
        "9-H": {
            blocksNumber: [4, 4],
            dataCodes: [
                [36, 12, 12],
                [37, 13, 12]
            ]
        },
        "10-L": {
            blocksNumber: [2, 2],
            dataCodes: [
                [86, 68, 9],
                [87, 69, 9]
            ]
        },
        "10-M": {
            blocksNumber: [4, 1],
            dataCodes: [
                [69, 43, 13],
                [70, 44, 13]
            ]
        },
        "10-Q": {
            blocksNumber: [6, 2],
            dataCodes: [
                [43, 19, 12],
                [44, 20, 12]
            ]
        },
        "10-H": {
            blocksNumber: [6, 2],
            dataCodes: [
                [43, 15, 14],
                [44, 16, 14]
            ]
        },
        "11-L": {
            blocksNumber: [4],
            dataCodes: [
                [101, 81, 10]
            ]
        },
        "11-M": {
            blocksNumber: [1, 4],
            dataCodes: [
                [80, 50, 15],
                [81, 51, 15]
            ]
        },
        "11-Q": {
            blocksNumber: [4, 4],
            dataCodes: [
                [50, 22, 14],
                [51, 23, 14]
            ]
        },
        "11-H": {
            blocksNumber: [3, 8],
            dataCodes: [
                [36, 12, 12],
                [37, 13, 12]
            ]
        },
        "12-L": {
            blocksNumber: [2, 2],
            dataCodes: [
                [116, 92, 12],
                [117, 93, 12]
            ]
        },
        "12-M": {
            blocksNumber: [6, 2],
            dataCodes: [
                [58, 36, 11],
                [59, 37, 11]
            ]
        },
        "12-Q": {
            blocksNumber: [4, 6],
            dataCodes: [
                [46, 20, 13],
                [47, 21, 13]
            ]
        },
        "12-H": {
            blocksNumber: [7, 4],
            dataCodes: [
                [42, 14, 14],
                [43, 15, 14]
            ]
        },
        "13-L": {
            blocksNumber: [4],
            dataCodes: [
                [133, 107, 13]
            ]
        },
        "13-M": {
            blocksNumber: [8, 1],
            dataCodes: [
                [59, 37, 11],
                [60, 38, 11]
            ]
        },
        "13-Q": {
            blocksNumber: [8, 4],
            dataCodes: [
                [44, 20, 12],
                [45, 21, 12]
            ]
        },
        "13-H": {
            blocksNumber: [12, 4],
            dataCodes: [
                [33, 11, 11],
                [34, 12, 11]
            ]
        },
        "14-L": {
            blocksNumber: [3, 1],
            dataCodes: [
                [145, 115, 15],
                [146, 116, 15]
            ]
        },
        "14-M": {
            blocksNumber: [4, 5],
            dataCodes: [
                [64, 40, 12],
                [65, 41, 12]
            ]
        },
        "14-Q": {
            blocksNumber: [11, 5],
            dataCodes: [
                [36, 16, 10],
                [37, 17, 10]
            ]
        },
        "14-H": {
            blocksNumber: [11, 5],
            dataCodes: [
                [36, 12, 12],
                [37, 13, 12]
            ]
        },
        "15-L": {
            blocksNumber: [5, 1],
            dataCodes: [
                [109, 87, 11],
                [110, 88, 11]
            ]
        },
        "15-M": {
            blocksNumber: [5, 5],
            dataCodes: [
                [65, 41, 12],
                [66, 42, 12]
            ]
        },
        "15-Q": {
            blocksNumber: [5, 7],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "15-H": {
            blocksNumber: [11, 7],
            dataCodes: [
                [36, 12, 12],
                [37, 13, 12]
            ]
        },
        "16-L": {
            blocksNumber: [5, 1],
            dataCodes: [
                [122, 98, 12],
                [123, 99, 12]
            ]
        },
        "16-M": {
            blocksNumber: [7, 3],
            dataCodes: [
                [73, 45, 14],
                [74, 46, 14]
            ]
        },
        "16-Q": {
            blocksNumber: [15, 2],
            dataCodes: [
                [43, 19, 12],
                [44, 20, 12]
            ]
        },
        "16-H": {
            blocksNumber: [3, 13],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "17-L": {
            blocksNumber: [1, 5],
            dataCodes: [
                [135, 107, 14],
                [136, 108, 14]
            ]
        },
        "17-M": {
            blocksNumber: [10, 1],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "17-Q": {
            blocksNumber: [1, 15],
            dataCodes: [
                [50, 22, 14],
                [51, 23, 14]
            ]
        },
        "17-H": {
            blocksNumber: [2, 17],
            dataCodes: [
                [42, 14, 14],
                [43, 15, 14]
            ]
        },
        "18-L": {
            blocksNumber: [5, 1],
            dataCodes: [
                [150, 120, 15],
                [151, 121, 15]
            ]
        },
        "18-M": {
            blocksNumber: [9, 4],
            dataCodes: [
                [69, 43, 13],
                [70, 44, 13]
            ]
        },
        "18-Q": {
            blocksNumber: [17, 1],
            dataCodes: [
                [50, 22, 14],
                [51, 23, 14]
            ]
        },
        "18-H": {
            blocksNumber: [2, 19],
            dataCodes: [
                [42, 14, 14],
                [43, 15, 14]
            ]
        },
        "19-L": {
            blocksNumber: [3, 4],
            dataCodes: [
                [141, 113, 14],
                [142, 114, 14]
            ]
        },
        "19-M": {
            blocksNumber: [3, 11],
            dataCodes: [
                [70, 44, 13],
                [71, 45, 13]
            ]
        },
        "19-Q": {
            blocksNumber: [17, 4],
            dataCodes: [
                [47, 21, 13],
                [48, 22, 13]
            ]
        },
        "19-H": {
            blocksNumber: [9, 16],
            dataCodes: [
                [39, 13, 13],
                [40, 14, 13]
            ]
        },
        "20-L": {
            blocksNumber: [3, 5],
            dataCodes: [
                [135, 107, 14],
                [136, 108, 14]
            ]
        },
        "20-M": {
            blocksNumber: [3, 13],
            dataCodes: [
                [67, 41, 13],
                [68, 42, 13]
            ]
        },
        "20-Q": {
            blocksNumber: [15, 5],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "20-H": {
            blocksNumber: [15, 10],
            dataCodes: [
                [43, 15, 14],
                [44, 16, 14]
            ]
        },
        "21-L": {
            blocksNumber: [4, 4],
            dataCodes: [
                [144, 116, 14],
                [145, 117, 14]
            ]
        },
        "21-M": {
            blocksNumber: [17],
            dataCodes: [
                [68, 42, 13]
            ]
        },
        "21-Q": {
            blocksNumber: [17, 6],
            dataCodes: [
                [50, 22, 14],
                [51, 23, 14]
            ]
        },
        "21-H": {
            blocksNumber: [19, 6],
            dataCodes: [
                [46, 16, 15],
                [47, 17, 15]
            ]
        },
        "22-L": {
            blocksNumber: [2, 7],
            dataCodes: [
                [139, 111, 14],
                [140, 112, 14]
            ]
        },
        "22-M": {
            blocksNumber: [17],
            dataCodes: [
                [74, 46, 14]
            ]
        },
        "22-Q": {
            blocksNumber: [7, 16],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "22-H": {
            blocksNumber: [34],
            dataCodes: [
                [37, 13, 12]
            ]
        },
        "23-L": {
            blocksNumber: [4, 5],
            dataCodes: [
                [151, 121, 15],
                [152, 122, 15]
            ]
        },
        "23-M": {
            blocksNumber: [4, 14],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "23-Q": {
            blocksNumber: [11, 14],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "23-H": {
            blocksNumber: [16, 14],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "24-L": {
            blocksNumber: [6, 4],
            dataCodes: [
                [147, 117, 15],
                [148, 118, 15]
            ]
        },
        "24-M": {
            blocksNumber: [6, 14],
            dataCodes: [
                [73, 45, 14],
                [74, 46, 14]
            ]
        },
        "24-Q": {
            blocksNumber: [11, 16],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "24-H": {
            blocksNumber: [30, 2],
            dataCodes: [
                [46, 16, 15],
                [47, 17, 15]
            ]
        },
        "25-L": {
            blocksNumber: [8, 4],
            dataCodes: [
                [132, 106, 13],
                [133, 107, 13]
            ]
        },
        "25-M": {
            blocksNumber: [8, 13],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "25-Q": {
            blocksNumber: [7, 22],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "25-H": {
            blocksNumber: [22, 13],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "26-L": {
            blocksNumber: [10, 2],
            dataCodes: [
                [142, 114, 14],
                [143, 115, 14]
            ]
        },
        "26-M": {
            blocksNumber: [19, 4],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "26-Q": {
            blocksNumber: [28, 6],
            dataCodes: [
                [50, 22, 14],
                [51, 23, 14]
            ]
        },
        "26-H": {
            blocksNumber: [33, 4],
            dataCodes: [
                [46, 16, 15],
                [47, 17, 15]
            ]
        },
        "27-L": {
            blocksNumber: [8, 4],
            dataCodes: [
                [152, 122, 15],
                [153, 123, 15]
            ]
        },
        "27-M": {
            blocksNumber: [22, 3],
            dataCodes: [
                [73, 45, 14],
                [74, 46, 14]
            ]
        },
        "27-Q": {
            blocksNumber: [8, 26],
            dataCodes: [
                [53, 23, 15],
                [54, 24, 15]
            ]
        },
        "27-H": {
            blocksNumber: [12, 28],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "28-L": {
            blocksNumber: [3, 10],
            dataCodes: [
                [147, 117, 15],
                [148, 118, 15]
            ]
        },
        "28-M": {
            blocksNumber: [3, 23],
            dataCodes: [
                [73, 45, 14],
                [74, 46, 14]
            ]
        },
        "28-Q": {
            blocksNumber: [55, 25],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "28-H": {
            blocksNumber: [11, 31],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "29-L": {
            blocksNumber: [7, 7],
            dataCodes: [
                [146, 116, 15],
                [147, 117, 15]
            ]
        },
        "29-M": {
            blocksNumber: [21, 7],
            dataCodes: [
                [73, 45, 14],
                [74, 46, 14]
            ]
        },
        "29-Q": {
            blocksNumber: [1, 37],
            dataCodes: [
                [53, 23, 15],
                [54, 24, 15]
            ]
        },
        "29-H": {
            blocksNumber: [19, 26],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "30-L": {
            blocksNumber: [5, 10],
            dataCodes: [
                [145, 115, 15],
                [146, 116, 15]
            ]
        },
        "30-M": {
            blocksNumber: [19, 10],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "30-Q": {
            blocksNumber: [15, 25],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "30-H": {
            blocksNumber: [23, 25],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "31-L": {
            blocksNumber: [13, 3],
            dataCodes: [
                [145, 115, 15],
                [146, 116, 15]
            ]
        },
        "31-M": {
            blocksNumber: [2, 29],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "31-Q": {
            blocksNumber: [42, 1],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "31-H": {
            blocksNumber: [23, 28],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "32-L": {
            blocksNumber: [17],
            dataCodes: [
                [145, 115, 15]
            ]
        },
        "32-M": {
            blocksNumber: [10, 23],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "32-Q": {
            blocksNumber: [10, 35],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "32-H": {
            blocksNumber: [19, 35],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "33-L": {
            blocksNumber: [17, 1],
            dataCodes: [
                [145, 115, 15],
                [146, 116, 15]
            ]
        },
        "33-M": {
            blocksNumber: [14, 21],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "33-Q": {
            blocksNumber: [29, 19],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "33-H": {
            blocksNumber: [11, 46],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "34-L": {
            blocksNumber: [13, 6],
            dataCodes: [
                [145, 115, 15],
                [146, 116, 15]
            ]
        },
        "34-M": {
            blocksNumber: [14, 23],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "34-Q": {
            blocksNumber: [44, 7],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "34-H": {
            blocksNumber: [59, 1],
            dataCodes: [
                [46, 16, 15],
                [47, 17, 15]
            ]
        },
        "35-L": {
            blocksNumber: [12, 7],
            dataCodes: [
                [151, 121, 15],
                [152, 122, 15]
            ]
        },
        "35-M": {
            blocksNumber: [12, 26],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "35-Q": {
            blocksNumber: [39, 14],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "35-H": {
            blocksNumber: [22, 41],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "36-L": {
            blocksNumber: [6, 14],
            dataCodes: [
                [151, 121, 15],
                [152, 122, 15]
            ]
        },
        "36-M": {
            blocksNumber: [6, 34],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "36-Q": {
            blocksNumber: [46, 10],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "36-H": {
            blocksNumber: [2, 64],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "37-L": {
            blocksNumber: [17, 4],
            dataCodes: [
                [152, 122, 15],
                [153, 123, 15]
            ]
        },
        "37-M": {
            blocksNumber: [29, 14],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "37-Q": {
            blocksNumber: [49, 10],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "37-H": {
            blocksNumber: [24, 46],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "38-L": {
            blocksNumber: [4, 18],
            dataCodes: [
                [152, 122, 15],
                [153, 123, 15]
            ]
        },
        "38-M": {
            blocksNumber: [13, 32],
            dataCodes: [
                [74, 46, 14],
                [75, 47, 14]
            ]
        },
        "38-Q": {
            blocksNumber: [48, 14],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "38-H": {
            blocksNumber: [42, 32],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "39-L": {
            blocksNumber: [20, 4],
            dataCodes: [
                [147, 117, 15],
                [148, 118, 15]
            ]
        },
        "39-M": {
            blocksNumber: [40, 7],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "39-Q": {
            blocksNumber: [43, 22],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "39-H": {
            blocksNumber: [10, 67],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        },
        "40-L": {
            blocksNumber: [19, 6],
            dataCodes: [
                [148, 118, 15],
                [149, 119, 15]
            ]
        },
        "40-M": {
            blocksNumber: [18, 31],
            dataCodes: [
                [75, 47, 14],
                [76, 48, 14]
            ]
        },
        "40-Q": {
            blocksNumber: [34, 34],
            dataCodes: [
                [54, 24, 15],
                [55, 25, 15]
            ]
        },
        "40-H": {
            blocksNumber: [20, 61],
            dataCodes: [
                [45, 15, 15],
                [46, 16, 15]
            ]
        }
    };

    constructor() {
        let x = 1;
        for (let i = 0; i < 256; i++) {
            ECC.GF_EXP[i] = x;
            ECC.GF_LOG[x] = i;
            x = this.Gf_MultNoLUT(x, 2);
        }
        for (let i = 255; i < 512; i++) {
            ECC.GF_EXP[i] = ECC.GF_EXP[i - 255];
        }
    }

    //伽罗华域乘法
    Gf_MultNoLUT(a, b) {
        let p = 0;
        while (b != 0) {
            if ((b & 1) != 0) {
                p ^= a;
            }
            b >>= 1;
            a <<= 1;
            if ((a & 256) != 0) {
                a ^= ECC.PRIM;
            }
        }
        return p;
    }

    //伽罗华域乘法
    Gf_Mul(a, b) {
        if (a === 0 || b === 0) {
            return 0;
        }
        return ECC.GF_EXP[ECC.GF_LOG[a] + ECC.GF_LOG[b]];
    }

    //伽罗华域幂
    Gf_Pow(x, power) {
        return ECC.GF_EXP[(ECC.GF_LOG[x] * power) % 255];
    }

    // 多项式乘法
    Gf_PolyMul(p, q) {
        let result = new Array(p.length + q.length - 1);
        for (let i = 0; i < q.length; i++) {
            for (let j = 0; j < p.length; j++) {
                result[i + j] ^= this.Gf_Mul(p[j], q[i]);
            }
        }
        return result;
    }

    // 获取纠错码字的生成多项式
    RsGeneratorPoly(nsym) {
        let g = [1];
        for (let i = 0; i < nsym; i++) {
            g = this.Gf_PolyMul(g, [1, this.Gf_Pow(2, i)]);
        }
        return g;
    }

    // 生成纠错码，并添加在数据码字之后
    RsEncodeMsg(msgIn, nsym) {
        if (msgIn.length + nsym > 255) {
            throw new Error("Array length > 255");
        }
        let gen = this.RsGeneratorPoly(nsym);
        let msgOut = new Array(msgIn.length + gen.length - 1);
        for (let i = 0; i < msgIn.length; i++) {
            msgOut[i] = msgIn[i];
        }
        for (let i = 0; i < msgIn.length; i++) {
            let coef = msgOut[i];
            if (coef != 0) {
                for (let j = 1; j < gen.length; j++) {
                    msgOut[i + j] ^= this.Gf_Mul(gen[j], coef);
                }
            }
        }
        for (let i = 0; i < msgIn.length; i++) {
            msgOut[i] = msgIn[i];
        }
        return msgOut;
    }

    // 根据码字总数生成纠错码
    getECC(data, version, errorCorrectionLevel) {
        let eccBlock = ECC.DATA_BLOCKS_NUMBER[`${version}-${errorCorrectionLevel}`];
        let result = [];
        let dataBlocks = [];
        let eccBlocks = [];
        let currentIndex = 0;
        for (let i = 0; i < eccBlock.blocksNumber.length; i++) {
            let blocksNumber = eccBlock.blocksNumber[i];
            let c = eccBlock.dataCodes[i][0];
            let k = eccBlock.dataCodes[i][1];
            for (let j = 0; j < blocksNumber; j++) {
                let block = data.slice(currentIndex, currentIndex + k);
                dataBlocks.push(block);
                eccBlocks.push(this.RsEncodeMsg(block, (c - k)).slice(k));
                currentIndex += k;
            }
        }
        for (let i = 0; i < dataBlocks[dataBlocks.length - 1].length; i++) {
            for (let j = 0; j < dataBlocks.length; j++) {
                if (dataBlocks[j].length > i) {
                    result.push(dataBlocks[j][i]);
                }
            }
        }
        for (let i = 0; i < eccBlocks[eccBlocks.length - 1].length; i++) {
            for (let j = 0; j < eccBlocks.length; j++) {
                if (eccBlocks[j].length > i) {
                    result.push(eccBlocks[j][i]);
                }
            }
        }
        return result;
    }
}

class MaskPattern {
    constructor(size) {
        this.size = size;
    }

    getMask(maskPatternReference) {
        let maskPattern = [];
        let maskPatternFunction = {
            0: this.MaskPattern000(),
            1: this.MaskPattern001(),
            2: this.MaskPattern010(),
            3: this.MaskPattern011(),
            4: this.MaskPattern100(),
            5: this.MaskPattern101(),
            6: this.MaskPattern110(),
            7: this.MaskPattern111(),
        }
        for (let i = 0; i < this.size; i++) {
            maskPattern.push([]);
            for (let j = 0; j < this.size; j++) {
                maskPattern[i][j] = maskPatternFunction[maskPatternReference](i, j);
            }
        }
        return maskPattern;
    }

    MaskPattern000() {
        return (i, j) => {
            return (i + j) % 2 === 0;
        }
    }

    MaskPattern001() {
        return (i, j) => {
            return i % 2 === 0;
        }
    }

    MaskPattern010() {
        return (i, j) => {
            return j % 3 === 0;
        }
    }

    MaskPattern011() {
        return (i, j) => {
            return (i + j) % 3 === 0;
        }
    }

    MaskPattern100() {
        return (i, j) => {
            return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        }
    }

    MaskPattern101() {
        return (i, j) => {
            return ((i * j) % 2) + ((i * j) % 3) === 0;
        }
    }

    MaskPattern110() {
        return (i, j) => {
            return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
        }
    }

    MaskPattern111() {
        return (i, j) => {
            return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
        }
    }
}

class Painter {
    static LOCATION = {
        1: [6, 14],
        2: [6, 18],
        3: [6, 22],
        4: [6, 26],
        5: [6, 30],
        6: [6, 34],
        7: [6, 22, 38],
        8: [6, 24, 42],
        9: [6, 26, 46],
        10: [6, 28, 50],
        11: [6, 30, 54],
        12: [6, 32, 58],
        13: [6, 34, 62],
        14: [6, 26, 46, 66],
        15: [6, 26, 48, 70],
        16: [6, 26, 50, 74],
        17: [6, 30, 54, 78],
        18: [6, 30, 56, 82],
        19: [6, 30, 58, 86],
        20: [6, 34, 62, 90],
        21: [6, 28, 50, 72, 94],
        22: [6, 26, 50, 74, 98],
        23: [6, 30, 54, 78, 102],
        24: [6, 28, 54, 80, 106],
        25: [6, 32, 58, 84, 110],
        26: [6, 30, 58, 86, 114],
        27: [6, 34, 62, 90, 118],
        28: [6, 26, 50, 74, 98, 122],
        29: [6, 30, 54, 78, 102, 126],
        30: [6, 26, 52, 78, 104, 130],
        31: [6, 30, 56, 82, 108, 134],
        32: [6, 34, 60, 86, 112, 138],
        33: [6, 30, 58, 86, 114, 142],
        34: [6, 34, 62, 90, 118, 146],
        35: [6, 30, 54, 78, 102, 126, 150],
        36: [6, 24, 50, 76, 102, 128, 154],
        37: [6, 28, 54, 80, 106, 132, 158],
        38: [6, 32, 58, 84, 110, 136, 162],
        39: [6, 26, 54, 82, 110, 138, 166],
        40: [6, 30, 58, 86, 114, 142, 170],
    }

    static ONE_CHANGE = true;
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} contextId
     */
    constructor(canvas, contextId = '2d', version = 1) {
        this.canvas = canvas;
        this.ctx = canvas.getContext(contextId);
        this.version = version;
        // 大小
        this.size = 21 + (version - 1) * 4;
        this._spacing = Math.min(canvas.width, canvas.height) / this.size;
        this.end = Math.min(canvas.width, canvas.height);
        this._codeMap = [];
        for (let i = 0; i < this.size; i++) {
            let row = [];
            row.flag = [];
            this._codeMap.push(row);
            for (let j = 0; j < this.size; j++) {
                row.push(0);
                row.flag.push(false);
            }
        }
        this._codeMap = new Proxy(this._codeMap, {
            get(target, prop) {
                // 如果不是数字（访问属性），则直接返回该属性
                if (isNaN(Number(prop))) {
                    return target[prop];
                }
                target[prop].y = Number(prop);
                return new Proxy(target[prop], {
                    set(target, prop, value) {
                        if (isNaN(Number(prop))) {
                            return target[prop];
                        }
                        if (target.flag[Number(prop)] === false) {
                            if (Painter.ONE_CHANGE) {
                                target.flag[Number(prop)] = true;
                            }
                            target[prop] = value;
                        }
                        return true;
                    }
                });
            }
        });
    }

    // 绘制网格
    drawGrid(color = '#000') {
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeStyle = color;
        let end = this.end + this._spacing;
        for (let i = 0; i < end; i += this._spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.end);
            this.ctx.stroke();
        }
        for (let i = 0; i < end; i += this._spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.end, i);
            this.ctx.stroke();
        }
    }

    // 添加定位
    addLocation() {
        let location = Painter.LOCATION[this.version];
        function setLocation(x, y, codeMap) {
            for (let i = 0; i < 7; i++) {
                codeMap[y][x + i] = 1;
                codeMap[y + 6][x + i] = 1;
                codeMap[y + i][x] = 1;
                codeMap[y + i][x + 6] = 1;
            }
            for (let i = x + 2; i < x + 5; i++) {
                for (let j = y + 2; j < y + 5; j++) {
                    codeMap[j][i] = 1;
                }
            }
            for (let i = x + 1; i < x + 6; i++) {
                for (let j = y + 1; j < y + 6; j++) {
                    if (codeMap[j][i] !== 1) {
                        codeMap[j][i] = 0;
                    }
                }
            }
            if (y - 1 >= 0) {
                for (let i = 0; i < 8; i++) {
                    if (x + i < codeMap.length) {
                        codeMap[y - 1][x + i] = 0;
                    }
                }
            }
            if (x + 7 < codeMap.length) {
                for (let i = 0; i <= 8; i++) {
                    if (y + i < codeMap.length) {
                        codeMap[y + i][x + 7] = 0;
                    }
                }
            }
            if (y + 7 < codeMap.length) {
                for (let i = 0; i < 8; i++) {
                    if (x + i < codeMap.length) {
                        codeMap[y + 7][x + i] = 0;
                    }
                }
            }
            if (x - 1 >= 0) {
                for (let i = 0; i <= 8; i++) {
                    if (y + i < codeMap.length) {
                        codeMap[y + i][x - 1] = 0;
                    }
                }
            }
        }
        // 定位图案
        setLocation(0, 0, this._codeMap);
        setLocation(location[location.length - 1], 0, this._codeMap);
        setLocation(0, location[location.length - 1], this._codeMap);
    }

    // 添加对齐
    addAlignment() {
        // 版本2（不包括）以下无对齐元素
        if (this.version < 2) {
            return;
        }
        let location = Painter.LOCATION[this.version];
        function setLocation(x, y, codeMap) {
            for (let i = -2; i < 3; i++) {
                codeMap[y - 2][x + i] = 1;
                codeMap[y + 2][x + i] = 1;
                codeMap[y + i][x - 2] = 1;
                codeMap[y + i][x + 2] = 1;
            }
            codeMap[y][x] = 1;
            for (let i = y - 1; i <= y + 1; i++) {
                for (let j = x - 1; j <= x + 1; j++) {
                    if (codeMap[i][j] !== 1) {
                        codeMap[i][j] = 0;
                    }
                }
            }
        }
        for (let i = 0; i < location.length; i++) {
            for (let j = 0; j < location.length; j++) {
                if ((i === 0 && j === 0) || (i === 0 && j === location.length - 1) || (i === location.length - 1 && j === 0)) {
                    continue;
                }
                setLocation(location[i], location[j], this._codeMap);
            }
        }
    }

    // 添加时序图
    addTimeline() {
        let location = Painter.LOCATION[this.version];
        for (let i = 7; i < location[location.length - 1]; i += 2) {
            this._codeMap[6][i] = 0;
            this._codeMap[6][i + 1] = 1;
            this._codeMap[i][6] = 0;
            this._codeMap[i + 1][6] = 1;
        }
    }

    // 添加格式信息
    addFormatInfo(errorCorrectionLevel = "M", maskPatternReference = 0) {
        if (errorCorrectionLevel !== "L" && errorCorrectionLevel !== "M" && errorCorrectionLevel !== "Q" && errorCorrectionLevel !== "H") {
            throw new Error("errorCorrectionLevel must be L, M, Q or H");
        }
        if (maskPatternReference < 0 || maskPatternReference > 7) {
            throw new Error("maskPatternReference must be between 0 and 7");
        }
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.maskPatternReference = maskPatternReference;
        // 纠错级别
        switch (errorCorrectionLevel) {
            case "L": errorCorrectionLevel = 0b01; break;
            case "M": errorCorrectionLevel = 0b00; break;
            case "Q": errorCorrectionLevel = 0b11; break;
            case "H": errorCorrectionLevel = 0b10; break;
        }
        // 数据位
        let dataBit = (errorCorrectionLevel << 3) | maskPatternReference;
        function BCH_15_To_5_Encode(data) {
            const g = 0x537;
            data <<= 10;
            let encode = data;
            for (let i = 4; i >= 0; i--) {
                if ((data & (1 << (i + 10))) != 0) {
                    data ^= g << i;
                }
            }
            return encode ^ data;
        }
        // 纠错位
        let errorCorrectionBit = BCH_15_To_5_Encode(dataBit);
        dataBit ^= 0b10101;
        errorCorrectionBit ^= 0b0000010010;
        let formatInfo = [];
        for (let i = 0; i < 10; i++) {
            formatInfo.push((errorCorrectionBit & (1 << i)) !== 0 ? 1 : 0);
        }
        for (let i = 0; i < 5; i++) {
            formatInfo.push((dataBit & (1 << i)) !== 0 ? 1 : 0);
        }

        // 添加15位信息
        this._codeMap[0][8] = formatInfo[0];
        this._codeMap[1][8] = formatInfo[1];
        this._codeMap[2][8] = formatInfo[2];
        this._codeMap[3][8] = formatInfo[3];
        this._codeMap[4][8] = formatInfo[4];
        this._codeMap[5][8] = formatInfo[5];
        this._codeMap[7][8] = formatInfo[6];
        this._codeMap[8][8] = formatInfo[7];
        this._codeMap[8][7] = formatInfo[8];
        this._codeMap[8][5] = formatInfo[9];
        this._codeMap[8][4] = formatInfo[10];
        this._codeMap[8][3] = formatInfo[11];
        this._codeMap[8][2] = formatInfo[12];
        this._codeMap[8][1] = formatInfo[13];
        this._codeMap[8][0] = formatInfo[14];

        for (let i = 1; i <= 8; i++) {
            this._codeMap[8][this.size - i] = formatInfo[i - 1];
        }
        for (let i = 0; i < 7; i++) {
            this._codeMap[this.size - 7 + i][8] = formatInfo[i + 8];
        }
        this._codeMap[this.size - 8][8] = 1;
    }

    // 添加版本信息
    addVersionInfo() {
        if (this.version < 7) {
            Painter.ONE_CHANGE = false;
            return;
        }
        function BCH_18_To_6_Encode(data) {
            const g = 0x1f25;
            data <<= 12;
            let encode = data;
            for (let i = 5; i >= 0; i--) {
                if ((data & (1 << (i + 12))) != 0) {
                    data ^= g << i;
                }
            }
            return encode ^ data;
        }
        let versionInfoBit = (this.version << 12) | BCH_18_To_6_Encode(this.version);
        let versionInfo = [];
        for (let i = 0; i < 18; i++) {
            versionInfo.push((versionInfoBit & (1 << i)) !== 0 ? 1 : 0);
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                this._codeMap[this.size - 11 + j][i] = versionInfo[i * 3 + j];
                this._codeMap[i][this.size - 11 + j] = versionInfo[i * 3 + j];
            }
        }
        Painter.ONE_CHANGE = false;
    }

    // 添加数据
    addData(data, mode) {
        // let dataArray = [0x10, 0x20, 0x0C, 0x56, 0x61, 0x80, 0xEC, 0x11, 0xEC, 0x0E, 0x9D, 0x02, 0xC8, 0xC2, 0x94, 0xF3, 0xA7, 0xAD, 0x8D, 0xE2, 0x0A, 0xF4, 0xA5, 0x2B, 0xAC, 0xDF];

        let dataArray = DataEncode.getDataEncode(data, this.version, mode);
        dataArray = PaddingData.padding(dataArray, this.version, this.errorCorrectionLevel);
        dataArray = new ECC().getECC(dataArray, this.version, this.errorCorrectionLevel);

        let y = this.size - 1;
        let x = this.size - 1;
        let direction = -1;
        // let points = [];
        for (let i = 0; i < dataArray.length; i++) {
            for (let j = 0; j < 8; j++) {
                this._codeMap[y][x] = (dataArray[i] & (1 << (7 - j))) !== 0 ? 1 : 0;
                // points.push({ x, y });
                while (true) {
                    if (x < 0) {
                        // throw new Error("Need a higher version");
                        break;
                    }
                    if (x > 6) {
                        if (x % 2 === 0) {
                            if (!this._codeMap[y].flag[x - 1]) {
                                x -= 1;
                                break;
                            } else {
                                x -= 1;
                                continue;
                            }
                        } else {
                            if (y + direction < 0 || y + direction >= this.size) {
                                direction *= -1;
                                x -= 2;
                                y -= direction;
                                if (x <= 6) {
                                    x -= 1;
                                }
                                continue;
                            }
                            if (!this._codeMap[y + direction].flag[x + 1]) {
                                x += 1;
                                y += direction;
                                break;
                            } else {
                                x += 1;
                                y += direction;
                                continue;
                            }
                        }
                    } else {
                        if (x % 2 === 1) {
                            if (!this._codeMap[y].flag[x - 1]) {
                                x -= 1;
                                break;
                            } else {
                                x -= 1;
                                continue;
                            }
                        } else {
                            if (y + direction < 0 || y + direction >= this.size) {
                                direction *= -1;
                                x -= 2;
                                y -= direction;
                                continue;
                            }
                            if (!this._codeMap[y + direction].flag[x + 1]) {
                                x += 1;
                                y += direction;
                                break;
                            } else {
                                x += 1;
                                y += direction;
                                continue;
                            }
                        }
                    }

                }
            }
        }
        // {
        //     console.log(points);
        //     this.ctx.strokeStyle = "#ff0000";
        //     this.ctx.fillStyle = "#ff0000";
        //     for (let i = 1; i < points.length; i++) {
        //         this.ctx.beginPath();
        //         this.ctx.moveTo(points[i - 1].x * this._spacing + this._spacing / 2, points[i - 1].y * this._spacing + this._spacing / 2);
        //         this.ctx.lineTo(points[i].x * this._spacing + this._spacing / 2, points[i].y * this._spacing + this._spacing / 2);
        //         this.ctx.stroke();
        //         // this.ctx.fillRect(points[i].x * this._spacing, points[i].y * this._spacing, this._spacing, this._spacing);
        //     }
        // }
    }

    // 添加掩膜
    addMask() {
        let maskPattern = new MaskPattern(this.size);
        let mask = maskPattern.getMask(this.maskPatternReference);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this._codeMap[i].flag[j]) {
                    this._codeMap[i][j] ^= mask[i][j];
                }
            }
        }
    }

    // 绘制
    drawCode(color = "#000000") {
        this.ctx.fillStyle = color;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this._codeMap[i][j]) {
                    this.ctx.fillRect(j * this._spacing, i * this._spacing, this._spacing, this._spacing);
                }
            }
        }
    }
}