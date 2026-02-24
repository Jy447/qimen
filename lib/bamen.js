/**
 * 八门分布计算模块（转盘排法）
 *
 * 八门转动规则与九星不同！
 * - 九星：值符星随时干走，按洛书环计算位移
 * - 八门：值使门从值符宫出发，按九宫数字顺序(1→2→3→4→5→6→7→8→9)
 *         走"时辰距旬首的步数"（hourDiff），阳遁递增，阴遁递减
 *         中宫(5)经过时计入步数，落在5宫则寄坤2宫
 *         其他门在洛书环上与值使门保持相对位置整体平移
 */

const { LUO_SHU_ORDER } = require('./jiuxing');

// 八门原位分布（固定不变）
const BASIC_MEN = {
    '1': '休门',
    '2': '死门',
    '3': '伤门',
    '4': '杜门',
    '5': '',      // 中宫无门
    '6': '开门',
    '7': '惊门',
    '8': '生门',
    '9': '景门'
};

/**
 * 排布八门（转盘排法）
 * @param {String} zhiFuGong 值符宫（旬首六仪在地盘的宫位）
 * @param {Number} hourDiff 当前时辰距旬首时辰的步数 (0-9)
 * @param {String} type 阴阳遁类型 'yang' 或 'yin'
 * @returns {Object} { zhiShiGong, zhiShiMen, baMen }
 */
function distributeBaMen(zhiFuGong, hourDiff, type) {
    // 1. 确定值使门 = 值符宫原位的门
    const zhiShiMen = BASIC_MEN[zhiFuGong] || '';

    // 2. 值使门从值符宫出发，按九宫数字顺序走 hourDiff 步
    const zhiFuGongNum = parseInt(zhiFuGong);
    let zhiShiLuoGongNum;

    if (type === 'yang') {
        // 阳遁：按宫数递增 (1→2→3→4→5→6→7→8→9→1...)
        zhiShiLuoGongNum = ((zhiFuGongNum - 1 + hourDiff) % 9) + 1;
    } else {
        // 阴遁：按宫数递减 (9→8→7→6→5→4→3→2→1→9...)
        zhiShiLuoGongNum = ((zhiFuGongNum - 1 - (hourDiff % 9) + 9) % 9) + 1;
    }

    // 中宫(5)寄坤(2)
    if (zhiShiLuoGongNum === 5) zhiShiLuoGongNum = 2;

    const zhiShiLuoGong = zhiShiLuoGongNum.toString();

    // 3. 计算洛书环上的转动步数（值使门从原位到落宫的环形位移）
    const zhiFuIndex = LUO_SHU_ORDER.indexOf(zhiFuGong);
    const luoGongIndex = LUO_SHU_ORDER.indexOf(zhiShiLuoGong);

    if (zhiFuIndex === -1 || luoGongIndex === -1) {
        return {
            zhiShiGong: zhiShiLuoGong,
            zhiShiMen,
            baMen: { ...BASIC_MEN }
        };
    }

    const ringSteps = (luoGongIndex - zhiFuIndex + 8) % 8;

    // 4. 八门在洛书环上整体转动
    const baMen = {};
    baMen['5'] = ''; // 中宫无门

    for (let i = 0; i < 8; i++) {
        const originalGong = LUO_SHU_ORDER[i];
        const originalMen = BASIC_MEN[originalGong];
        const newIndex = (i + ringSteps) % 8;
        const newGong = LUO_SHU_ORDER[newIndex];
        baMen[newGong] = originalMen;
    }

    return {
        zhiShiGong: zhiShiLuoGong,
        zhiShiMen,
        baMen
    };
}

module.exports = {
    distributeBaMen,
    BASIC_MEN
};
