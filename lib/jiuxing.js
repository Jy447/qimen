/**
 * 九星分布计算模块（转盘排法）
 * 转盘：值符星随时干走，值符星从值符宫转到时干落宫，其余星整体同步转动
 * 转动步数 = 时干落宫在洛书环上的位置 - 值符宫在洛书环上的位置
 * 阳遁和阴遁的转动方向相同（均沿洛书顺时针方向计算步数）
 */

// 洛书九宫环形顺序（顺时针，不含中宫5）
// 坎1→艮8→震3→巽4→离9→坤2→兑7→乾6
const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

// 九星原位分布（固定不变）
const BASIC_XING = {
    '1': '天蓬',
    '2': '天芮',
    '3': '天冲',
    '4': '天辅',
    '5': '天禽',  // 中宫，寄坤2宫
    '6': '天心',
    '7': '天柱',
    '8': '天任',
    '9': '天英'
};

/**
 * 在地盘上查找某天干所在的宫位（排除中宫5，中宫寄坤2宫）
 * @param {Object} diPan 地盘干分布
 * @param {String} gan 要查找的天干
 * @returns {String|null} 宫位字符串，找不到返回 null
 */
function findGanOnDiPan(diPan, gan) {
    // 优先查找8个外宫
    for (const gong of LUO_SHU_ORDER) {
        if (diPan[gong] === gan) return gong;
    }
    // 如果只在中宫5，寄坤2宫
    if (diPan['5'] === gan) return '2';
    return null;
}

/**
 * 排布九星（转盘排法）
 * @param {Object} diPan 地盘干分布
 * @param {String} xunShou 旬首六仪（戊/己/庚/辛/壬/癸）
 * @param {String} shiGan 时干
 * @returns {Object} { zhiFuGong, zhiFuLuoGong, zhiFuXing, jiuXing }
 */
function distributeJiuXing(diPan, xunShou, shiGan) {
    // 1. 找旬首六仪在地盘上的位置 = 值符宫
    let zhiFuGong = findGanOnDiPan(diPan, xunShou);
    if (!zhiFuGong) zhiFuGong = '2'; // fallback

    // 2. 确定值符星 = 值符宫原位的星
    const zhiFuXing = BASIC_XING[zhiFuGong];

    // 3. 如果没有时干，返回原位九星
    if (!shiGan) {
        return {
            zhiFuGong,
            zhiFuXing,
            jiuXing: { ...BASIC_XING }
        };
    }

    // 4. 找时干在地盘上的位置 = 时干落宫
    let luoGong = findGanOnDiPan(diPan, shiGan);
    if (!luoGong) {
        // 时干为甲，甲隐于旬首六仪之下，落宫就是值符宫
        luoGong = zhiFuGong;
    }

    // 5. 计算转动步数（沿洛书顺时针方向）
    const zhiFuIndex = LUO_SHU_ORDER.indexOf(zhiFuGong);
    const luoGongIndex = LUO_SHU_ORDER.indexOf(luoGong);

    if (zhiFuIndex === -1 || luoGongIndex === -1) {
        return {
            zhiFuGong,
            zhiFuXing,
            jiuXing: { ...BASIC_XING }
        };
    }

    const steps = (luoGongIndex - zhiFuIndex + 8) % 8;

    // 6. 九星整体转动
    const jiuXing = {};
    for (let i = 0; i < 8; i++) {
        const originalGong = LUO_SHU_ORDER[i];
        const newIndex = (i + steps) % 8;
        const newGong = LUO_SHU_ORDER[newIndex];

        // 天禽(5宫)寄坤2宫，2宫原位同时有天芮和天禽
        if (originalGong === '2') {
            jiuXing[newGong] = '天芮(天禽)';
        } else {
            jiuXing[newGong] = BASIC_XING[originalGong];
        }
    }

    // 中宫显示天禽
    jiuXing['5'] = '天禽';

    return {
        zhiFuGong,                // 值符原位宫（旬首六仪在地盘的位置）
        zhiFuLuoGong: luoGong,    // 值符落宫（转动后的位置，即时干落宫）
        zhiFuXing,                // 值符星名
        jiuXing                   // 九星分布
    };
}

module.exports = {
    distributeJiuXing,
    findGanOnDiPan,
    LUO_SHU_ORDER,
    BASIC_XING
};
