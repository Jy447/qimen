/**
 * 奇门遁甲地盘干设置模块（转盘排法）
 * 地盘干根据局数排布，是固定不动的底盘
 * 转盘排法：按九宫数字顺序排列
 *   阳遁：戊从局数宫开始，按宫数递增 (1→2→3→4→5→6→7→8→9)
 *   阴遁：戊从局数宫开始，按宫数递减 (9→8→7→6→5→4→3→2→1)
 */

// 三奇六仪顺序（9个）
const SAN_QI_LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

/**
 * 根据阴阳遁和局数计算地盘干分布（转盘排法）
 * @param {String} type 'yang' 阳遁 或 'yin' 阴遁
 * @param {Number} num 局数 (1-9)
 * @returns {Object} 地盘干分布，key 为宫数字符串 '1'-'9'
 */
function getDiPan(type, num) {
    const result = {};
    let currentGong = num;

    for (let i = 0; i < 9; i++) {
        result[currentGong.toString()] = SAN_QI_LIU_YI[i];

        if (type === 'yang') {
            // 阳遁：按宫数递增排布 (1→2→3→4→5→6→7→8→9→1...)
            currentGong++;
            if (currentGong === 10) currentGong = 1;
        } else {
            // 阴遁：按宫数递减排布 (9→8→7→6→5→4→3→2→1→9...)
            currentGong--;
            if (currentGong === 0) currentGong = 9;
        }
    }

    return result;
}

/**
 * 获取基本地盘干分布（阳遁1局的默认分布）
 * @returns {Object} 基本地盘干分布
 */
function getBasicDiPan() {
    return getDiPan('yang', 1);
}

module.exports = {
    getBasicDiPan,
    getDiPan
};
