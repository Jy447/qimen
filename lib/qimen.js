/**
 * 奇门遁甲核心计算库（时家拆补转盘）
 * 实现完整的奇门遁甲排盘系统
 */

const {Lunar, Solar} = require('lunar-javascript');
const jiuXingModule = require('./jiuxing');
const baMenModule = require('./bamen');
const baShenModule = require('./bashen');
const diPanModule = require('./dipan');

/**
 * 天干地支
 */
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 九宫位置信息
 */
const JIU_GONG = {
    '1': { name: '坎', direction: '正北', element: 'shui', color: '#03A9F4', yinyang: '阴' },
    '2': { name: '坤', direction: '西南', element: 'tu', color: '#795548', yinyang: '阴' },
    '3': { name: '震', direction: '正东', element: 'mu', color: '#4CAF50', yinyang: '阳' },
    '4': { name: '巽', direction: '东南', element: 'mu', color: '#4CAF50', yinyang: '阳' },
    '5': { name: '中', direction: '中宫', element: 'tu', color: '#795548', yinyang: '阴阳' },
    '6': { name: '乾', direction: '西北', element: 'jin', color: '#FF9800', yinyang: '阳' },
    '7': { name: '兑', direction: '正西', element: 'jin', color: '#FF9800', yinyang: '阴' },
    '8': { name: '艮', direction: '东北', element: 'tu', color: '#795548', yinyang: '阳' },
    '9': { name: '离', direction: '正南', element: 'huo', color: '#F44336', yinyang: '阳' }
};

/**
 * 九星信息（修正别名）
 */
const JIU_XING = {
    '天蓬': { alias: '贪狼', element: 'shui', color: '#03A9F4', feature: '主智慧、口才、机变' },
    '天芮': { alias: '巨门', element: 'tu', color: '#795548', feature: '主疾病、稳重、坚韧' },
    '天冲': { alias: '禄存', element: 'mu', color: '#4CAF50', feature: '主冲击、变化、快速' },
    '天辅': { alias: '文曲', element: 'mu', color: '#4CAF50', feature: '主扶助、支持、辅佐' },
    '天禽': { alias: '廉贞', element: 'tu', color: '#795548', feature: '为中宫之神，主枢纽、核心' },
    '天心': { alias: '武曲', element: 'jin', color: '#FF9800', feature: '主决断、判断、果决' },
    '天柱': { alias: '破军', element: 'jin', color: '#FF9800', feature: '主坚固、支撑、顶天立地' },
    '天任': { alias: '左辅', element: 'tu', color: '#795548', feature: '主责任、重担、实际' },
    '天英': { alias: '右弼', element: 'huo', color: '#F44336', feature: '主才华、聪明、显贵' }
};

/**
 * 八门信息（修正五行：生门=土，杜门=木）
 */
const BA_MEN = {
    '休门': { feature: '为吉门，主休养、安宁、平和。适合休息与调养。', type: 'ji', element: 'shui', color: '#03A9F4' },
    '生门': { feature: '为吉门，主生发、成长、喜庆。适合开始新事物。', type: 'ji', element: 'tu', color: '#795548' },
    '伤门': { feature: '为凶门，主伤害、损失、疾病。需避免冲突与伤害。', type: 'xiong', element: 'mu', color: '#4CAF50' },
    '杜门': { feature: '为凶门，主阻塞、停滞、困难。事情易受阻碍。', type: 'xiong', element: 'mu', color: '#4CAF50' },
    '景门': { feature: '为吉门，主光明、展示、明亮。适合公开场合与展示。', type: 'ji', element: 'huo', color: '#F44336' },
    '死门': { feature: '为凶门，主衰败、结束、死亡。不宜开始重要事情。', type: 'xiong', element: 'tu', color: '#795548' },
    '惊门': { feature: '为凶门，主惊吓、变故、突发状况。需注意意外变化。', type: 'xiong', element: 'jin', color: '#FF9800' },
    '开门': { feature: '为吉门，主通达、顺畅、开始。万事顺利，有好的开端。', type: 'ji', element: 'jin', color: '#FF9800' }
};

/**
 * 八神信息
 */
const BA_SHEN = {
    '值符': { feature: '为贵神，主吉庆、贵人、福星。', type: 'ji' },
    '腾蛇': { feature: '为凶神，主口舌是非、波动起伏。', type: 'xiong' },
    '太阴': { feature: '为吉神，主柔和、隐藏、内敛。', type: 'ji' },
    '六合': { feature: '为吉神，主和谐、团结、合作。', type: 'ji' },
    '白虎': { feature: '为凶神，主凶猛、伤害、灾祸。', type: 'xiong' },
    '玄武': { feature: '为凶神，主隐秘、盗窃、欺诈。', type: 'xiong' },
    '九地': { feature: '为吉神，主地利、丰收、稳固。', type: 'ji' },
    '九天': { feature: '为吉神，主高升、贵人、成功。', type: 'ji' }
};

/**
 * 节气与局数的映射关系
 * numbers: 3位数字分别对应上元、中元、下元的局数
 */
const JIE_QI_JU_SUAN = [
    { jieqi: '冬至', type: 'yang', numbers: '174' },
    { jieqi: '小寒', type: 'yang', numbers: '285' },
    { jieqi: '大寒', type: 'yang', numbers: '396' },
    { jieqi: '立春', type: 'yang', numbers: '852' },
    { jieqi: '雨水', type: 'yang', numbers: '963' },
    { jieqi: '惊蛰', type: 'yang', numbers: '174' },
    { jieqi: '春分', type: 'yang', numbers: '396' },
    { jieqi: '清明', type: 'yang', numbers: '417' },
    { jieqi: '谷雨', type: 'yang', numbers: '528' },
    { jieqi: '立夏', type: 'yang', numbers: '417' },
    { jieqi: '小满', type: 'yang', numbers: '528' },
    { jieqi: '芒种', type: 'yang', numbers: '639' },
    { jieqi: '夏至', type: 'yin', numbers: '936' },
    { jieqi: '小暑', type: 'yin', numbers: '825' },
    { jieqi: '大暑', type: 'yin', numbers: '714' },
    { jieqi: '立秋', type: 'yin', numbers: '258' },
    { jieqi: '处暑', type: 'yin', numbers: '147' },
    { jieqi: '白露', type: 'yin', numbers: '936' },
    { jieqi: '秋分', type: 'yin', numbers: '714' },
    { jieqi: '寒露', type: 'yin', numbers: '693' },
    { jieqi: '霜降', type: 'yin', numbers: '582' },
    { jieqi: '立冬', type: 'yin', numbers: '693' },
    { jieqi: '小雪', type: 'yin', numbers: '582' },
    { jieqi: '大雪', type: 'yin', numbers: '471' }
];

/**
 * 洛书九宫环形顺序（顺时针，不含中宫5）
 */
const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

/**
 * 计算干支在六十甲子中的序号 (0-59)
 * @param {String} ganZhi 干支字符串，如 '甲子'
 * @returns {Number} 序号 0-59
 */
function ganZhiIndex(ganZhi) {
    const gan = ganZhi[0];
    const zhi = ganZhi[1];
    const ganIdx = TIAN_GAN.indexOf(gan);
    const zhiIdx = DI_ZHI.indexOf(zhi);
    if (ganIdx === -1 || zhiIdx === -1) return 0;
    for (let i = 0; i < 60; i++) {
        if (i % 10 === ganIdx && i % 12 === zhiIdx) return i;
    }
    return 0;
}

/**
 * 计算阴阳遁局数（拆补法）
 * 拆补法定三元：根据日干支在六十甲子中的位置，找到所在的符头（甲/己日），
 * 由符头的序号确定上中下元
 * @param {Date} date 日期时间
 * @param {String} method 排盘方法：'时家', '日家', '月家', '年家'
 * @returns {Object} 局数信息
 */
function calculateJuShu(date, method = '时家') {
    const lunar = Lunar.fromDate(date);
    const solar = Solar.fromDate(date);

    // 获取最近的节气
    let jieQiName;
    if (method === '时家' || method === '日家') {
        jieQiName = lunar.getPrevJieQi(true).getName();
    } else if (method === '月家') {
        jieQiName = lunar.getPrevJieQi(true).getName();
    } else if (method === '年家') {
        jieQiName = lunar.getPrevJieQi(true).getName();
    }

    // 拆补法确定上中下元
    // 使用日干支（时家奇门用日干支判断元）
    let dayGanZhi;
    if (method === '时家' || method === '日家') {
        dayGanZhi = lunar.getDayInGanZhi();
    } else if (method === '月家') {
        dayGanZhi = lunar.getMonthInGanZhi();
    } else if (method === '年家') {
        dayGanZhi = lunar.getYearInGanZhi();
    }

    // 拆补法：找到当前日干支的符头（最近的甲/己日）
    // 符头index = ganZhiIndex - (ganZhiIndex % 5)
    // 元 = Math.floor(符头index / 5) % 3
    const idx = ganZhiIndex(dayGanZhi);
    const fuTouIdx = idx - (idx % 5);
    const yuan = Math.floor(fuTouIdx / 5) % 3; // 0=上元, 1=中元, 2=下元

    // 从节气映射表查找局数和阴阳遁
    let juNumber = '1';
    let yinYangType = 'yang';

    for (const item of JIE_QI_JU_SUAN) {
        if (item.jieqi === jieQiName) {
            yinYangType = item.type;
            juNumber = item.numbers.charAt(yuan);
            break;
        }
    }

    return {
        jieQiName,
        type: yinYangType,
        number: juNumber,
        yuan: ['上元', '中元', '下元'][yuan],
        fullName: `${yinYangType === 'yin' ? '阴遁' : '阳遁'}${juNumber}局 (${['上元', '中元', '下元'][yuan]})`,
        formatCode: `${yinYangType}-${juNumber}`
    };
}

/**
 * 计算天盘干分布（转盘排法）
 * 天盘 = 地盘干沿洛书环形转动
 * 转动步数 = 时干落宫index - 值符宫index（沿洛书顺时针方向）
 * 阳遁和阴遁转动方向相同
 * @param {Object} diPan 地盘干分布
 * @param {String} xunShou 旬首对应的六仪
 * @param {String} shiGan 时干
 * @returns {Object} 天盘干分布
 */
function distributeTianPan(diPan, xunShou, shiGan) {
    const result = {};

    // 1. 找旬首六仪在地盘上的位置 = 值符宫
    let zhiFuGong = jiuXingModule.findGanOnDiPan(diPan, xunShou);
    if (!zhiFuGong) zhiFuGong = '2';

    // 2. 找时干在地盘上的位置 = 时干落宫
    let shiGanGong = jiuXingModule.findGanOnDiPan(diPan, shiGan);
    if (!shiGanGong) {
        // 时干为甲，甲隐于旬首六仪之下，落宫就是值符宫
        shiGanGong = zhiFuGong;
    }

    // 3. 计算转动步数（沿洛书顺时针方向，阴阳遁相同）
    const zhiFuIndex = LUO_SHU_ORDER.indexOf(zhiFuGong);
    const shiGanIndex = LUO_SHU_ORDER.indexOf(shiGanGong);
    const steps = (shiGanIndex - zhiFuIndex + 8) % 8;

    // 4. 天盘整体转动（8个外宫沿洛书环形转动）
    for (let i = 0; i < 8; i++) {
        const originalGong = LUO_SHU_ORDER[i];
        const newIndex = (i + steps) % 8;
        const newGong = LUO_SHU_ORDER[newIndex];
        result[newGong] = diPan[originalGong];
    }

    // 中宫天盘干寄坤2宫
    result['5'] = result['2'];

    return result;
}

/**
 * 获取旬首六仪
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {String} 旬首六仪（戊/己/庚/辛/壬/癸）
 */
function getXunShou(lunar, method) {
    let xun = '';
    let ganZhi = '';

    try {
        if (method === '时家') {
            ganZhi = lunar.getTimeInGanZhi();
            xun = lunar.getTimeXun();
        } else if (method === '日家') {
            ganZhi = lunar.getDayInGanZhi();
            xun = lunar.getDayXun();
        } else if (method === '月家') {
            ganZhi = lunar.getMonthInGanZhi();
            xun = lunar.getMonthXun();
        } else if (method === '年家') {
            ganZhi = lunar.getYearInGanZhi();
            xun = lunar.getYearXun();
        }

        const xunToLiuYi = {
            '甲子': '戊', '甲戌': '己', '甲申': '庚',
            '甲午': '辛', '甲辰': '壬', '甲寅': '癸'
        };

        if (xun && xunToLiuYi[xun]) {
            return xunToLiuYi[xun];
        }

        // fallback: 通过干支映射
        const fullMap = {
            '甲子': '戊', '乙丒': '戊', '丙寅': '戊', '丁卯': '戊', '戊辰': '戊', '己巳': '戊', '庚午': '戊', '辛未': '戊', '壬申': '戊', '癸酉': '戊',
            '甲戌': '己', '乙亥': '己', '丙子': '己', '丁丑': '己', '戊寅': '己', '己卯': '己', '庚辰': '己', '辛巳': '己', '壬午': '己', '癸未': '己',
            '甲申': '庚', '乙酉': '庚', '丙戌': '庚', '丁亥': '庚', '戊子': '庚', '己丑': '庚', '庚寅': '庚', '辛卯': '庚', '壬辰': '庚', '癸巳': '庚',
            '甲午': '辛', '乙未': '辛', '丙申': '辛', '丁酉': '辛', '戊戌': '辛', '己亥': '辛', '庚子': '辛', '辛丑': '辛', '壬寅': '辛', '癸卯': '辛',
            '甲辰': '壬', '乙巳': '壬', '丙午': '壬', '丁未': '壬', '戊申': '壬', '己酉': '壬', '庚戌': '壬', '辛亥': '壬', '壬子': '壬', '癸丑': '壬',
            '甲寅': '癸', '乙卯': '癸', '丙辰': '癸', '丁巳': '癸', '戊午': '癸', '己未': '癸', '庚申': '癸', '辛酉': '癸', '壬戌': '癸', '癸亥': '癸'
        };

        return fullMap[ganZhi] || '戊';
    } catch (e) {
        console.error('获取旬首出错:', e);
        return '戊';
    }
}

/**
 * 获取时干（或日干/月干/年干）
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {String} 天干
 */
function getShiGan(lunar, method) {
    try {
        if (method === '时家') {
            return lunar.getTimeInGanZhi().substring(0, 1);
        } else if (method === '日家') {
            return lunar.getDayInGanZhi().substring(0, 1);
        } else if (method === '月家') {
            return lunar.getMonthInGanZhi().substring(0, 1);
        } else if (method === '年家') {
            return lunar.getYearInGanZhi().substring(0, 1);
        }
    } catch (e) {
        console.error('获取时干出错:', e);
    }
    return '甲';
}

/**
 * 计算当前时辰距旬首的步数（用于八门转动）
 * 八门的转动规则：值使门从值符宫出发，按九宫数字顺序走 hourDiff 步
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {Number} 时辰差 (0-9)
 */
function getHourDiff(lunar, method) {
    try {
        let ganZhi, xun;
        if (method === '时家') {
            ganZhi = lunar.getTimeInGanZhi();
            xun = lunar.getTimeXun();
        } else if (method === '日家') {
            ganZhi = lunar.getDayInGanZhi();
            xun = lunar.getDayXun();
        } else if (method === '月家') {
            ganZhi = lunar.getMonthInGanZhi();
            xun = lunar.getMonthXun();
        } else if (method === '年家') {
            ganZhi = lunar.getYearInGanZhi();
            xun = lunar.getYearXun();
        }
        return ganZhiIndex(ganZhi) - ganZhiIndex(xun);
    } catch (e) {
        console.error('计算时辰差出错:', e);
        return 0;
    }
}

/**
 * 获取驿马星位置
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {Object} { zhi, gong }
 */
function getMaStar(lunar, method) {
    let zhi = '';
    if (method === '时家') zhi = lunar.getTimeZhi();
    else if (method === '日家') zhi = lunar.getDayZhi();
    else if (method === '月家') zhi = lunar.getMonthZhi();
    else if (method === '年家') zhi = lunar.getYearZhi();

    let maZhi = '';
    if (['寅', '午', '戌'].includes(zhi)) maZhi = '申';
    else if (['申', '子', '辰'].includes(zhi)) maZhi = '寅';
    else if (['巳', '酉', '丑'].includes(zhi)) maZhi = '亥';
    else if (['亥', '卯', '未'].includes(zhi)) maZhi = '巳';

    const zhiToGong = {
        '子': '1', '丑': '8', '寅': '8', '卯': '3',
        '辰': '4', '巳': '4', '午': '9', '未': '2',
        '申': '2', '酉': '7', '戌': '6', '亥': '6'
    };

    return { zhi: maZhi, gong: zhiToGong[maZhi] || '' };
}

/**
 * 获取空亡地支
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {Array} 空亡地支数组
 */
function getKongWang(lunar, method) {
    try {
        let xun = '';
        if (method === '时家') xun = lunar.getTimeXun();
        else if (method === '日家') xun = lunar.getDayXun();
        else if (method === '月家') xun = lunar.getMonthXun();
        else if (method === '年家') xun = lunar.getYearXun();

        const xunToKongWang = {
            '甲子': ['戌', '亥'],
            '甲戌': ['申', '酉'],
            '甲申': ['午', '未'],
            '甲午': ['辰', '巳'],
            '甲辰': ['寅', '卯'],
            '甲寅': ['子', '丑']
        };

        return xunToKongWang[xun] || [];
    } catch (e) {
        console.error('获取空亡地支出错:', e);
        return [];
    }
}

/**
 * 获取空亡宫位
 * @param {Array} kongWangZhi 空亡地支数组
 * @returns {Array} 空亡宫位数组
 */
function getKongWangGong(kongWangZhi) {
    const zhiToGong = {
        '子': '1', '丑': '8', '寅': '8', '卯': '3',
        '辰': '4', '巳': '4', '午': '9', '未': '2',
        '申': '2', '酉': '7', '戌': '6', '亥': '6'
    };
    return kongWangZhi.map(zhi => zhiToGong[zhi]).filter(gong => gong);
}

/**
 * 计算暗干分布
 * @param {String} type 阴阳遁类型
 * @returns {Object} 暗干分布
 */
function calculateAnGan(type) {
    const SAN_QI_LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
    const anGan = {};
    let currentGong = 8; // 从8宫(生门原位)开始

    for (let i = 0; i < 9; i++) {
        anGan[currentGong.toString()] = SAN_QI_LIU_YI[i];
        if (type === 'yin') {
            currentGong--;
            if (currentGong === 0) currentGong = 9;
        } else {
            currentGong++;
            if (currentGong === 10) currentGong = 1;
        }
    }
    return anGan;
}

/**
 * 分析宫位吉凶
 */
function analyzeGong(gongNumber, jiuXing, baMen, baShen) {
    const gongStr = gongNumber.toString();
    let xing = jiuXing[gongStr] || '';
    const men = baMen[gongStr] || '';
    const shen = baShen[gongStr] || '';

    const gongInfo = JIU_GONG[gongStr] || {};

    // 处理 '天芮(天禽)' 等复合星名
    let xingLookup = xing;
    if (xing.includes('天芮')) xingLookup = '天芮';
    else if (xing.includes('天禽')) xingLookup = '天禽';

    const xingInfo = xingLookup ? JIU_XING[xingLookup] || {} : {};
    const menInfo = men ? BA_MEN[men] || {} : {};
    const shenInfo = shen ? BA_SHEN[shen] || {} : {};

    let jiXiongScore = 0;

    // 根据九星判断
    if (xingInfo.element === 'jin' || xingInfo.element === 'huo') {
        jiXiongScore += 1;
    } else if (xingInfo.element === 'tu') {
        jiXiongScore += 0;
    } else {
        jiXiongScore -= 1;
    }

    // 根据八门判断
    if (men && menInfo.type === 'ji') jiXiongScore += 1;
    else if (men && menInfo.type === 'xiong') jiXiongScore -= 1;

    // 根据八神判断
    if (shen && shenInfo.type === 'ji') jiXiongScore += 1;
    else if (shen && shenInfo.type === 'xiong') jiXiongScore -= 1;

    let jiXiong;
    if (jiXiongScore >= 2) jiXiong = 'da_ji';
    else if (jiXiongScore === 1) jiXiong = 'xiao_ji';
    else if (jiXiongScore === 0) jiXiong = 'ping';
    else if (jiXiongScore === -1) jiXiong = 'xiao_xiong';
    else jiXiong = 'da_xiong';

    return {
        gongNumber: gongStr,
        gongName: gongInfo.name || '',
        direction: gongInfo.direction || '',
        element: gongInfo.element || '',
        xing,
        xingAlias: xingInfo.alias || '',
        xingFeature: xingInfo.feature || '',
        men,
        menFeature: menInfo.feature || '',
        shen,
        shenFeature: shenInfo.feature || '',
        jiXiong,
        jiXiongText: ['大凶', '小凶', '平', '小吉', '大吉'][jiXiongScore + 2],
        explain: generateGongExplanation(gongStr, gongInfo, xing, xingInfo, men, menInfo, shen, shenInfo, jiXiong)
    };
}

/**
 * 生成宫位解释文字
 */
function generateGongExplanation(gongStr, gongInfo, xing, xingInfo, men, menInfo, shen, shenInfo, jiXiong) {
    const gongExplain = {
        '1': '坎宫主水，与事业、财运、流动资金有关。',
        '2': '坤宫主土，与婚姻、母亲、女性长辈有关。',
        '3': '震宫主木，与创业、开始、长子有关。',
        '4': '巽宫主木，与女性、柔和、文书有关。',
        '5': '中宫为核心，统领八方，与自身状态有关。',
        '6': '乾宫主金，与父亲、权威、领导有关。',
        '7': '兑宫主金，与口舌、沟通、少女有关。',
        '8': '艮宫主土，与停止、障碍、少男有关。',
        '9': '离宫主火，与名声、眼睛、光明有关。'
    };

    let explanation = gongExplain[gongStr] || '';

    if (xing) {
        explanation += ` ${xing}${xingInfo.alias ? '(' + xingInfo.alias + ')' : ''}入${gongStr}宫，${xingInfo.feature || ''}`;
    }
    if (men) {
        explanation += ` ${men}入${gongStr}宫，${menInfo.feature || ''}`;
    }
    if (shen) {
        explanation += ` ${shen}入${gongStr}宫，${shenInfo.feature || ''}`;
    }

    switch (jiXiong) {
        case 'da_ji': explanation += ' 此宫大吉，事情进展顺利，可主动出击。'; break;
        case 'xiao_ji': explanation += ' 此宫小吉，事情有贵人相助，稳步推进为宜。'; break;
        case 'ping': explanation += ' 此宫平常，事情进展一般，需谨慎行事。'; break;
        case 'xiao_xiong': explanation += ' 此宫小凶，事情多有阻碍，宜守不宜进。'; break;
        case 'da_xiong': explanation += ' 此宫大凶，事情多有险阻，最好避开此方位活动。'; break;
    }

    return explanation;
}

/**
 * 综合分析奇门盘
 */
function overallAnalysis(jiuGongAnalysis, zhiFuGong, zhiShiGong, purpose) {
    const zhiFuJiXiong = jiuGongAnalysis[zhiFuGong] ? jiuGongAnalysis[zhiFuGong].jiXiong : 'ping';
    const zhiShiJiXiong = jiuGongAnalysis[zhiShiGong] ? jiuGongAnalysis[zhiShiGong].jiXiong : 'ping';

    let overallJiXiong;
    if (zhiFuJiXiong === 'da_ji' && zhiShiJiXiong === 'da_ji') overallJiXiong = 'da_ji';
    else if (zhiFuJiXiong.includes('ji') && zhiShiJiXiong.includes('ji')) overallJiXiong = 'xiao_ji';
    else if (zhiFuJiXiong.includes('xiong') && zhiShiJiXiong.includes('xiong')) overallJiXiong = 'da_xiong';
    else if (zhiFuJiXiong.includes('xiong') || zhiShiJiXiong.includes('xiong')) overallJiXiong = 'xiao_xiong';
    else overallJiXiong = 'ping';

    let bestGong = '';
    let bestScore = -3;

    for (const gong in jiuGongAnalysis) {
        const analysis = jiuGongAnalysis[gong];
        let score = 0;

        switch (analysis.jiXiong) {
            case 'da_ji': score += 2; break;
            case 'xiao_ji': score += 1; break;
            case 'xiao_xiong': score -= 1; break;
            case 'da_xiong': score -= 2; break;
        }

        if (purpose === '事业' && ['1', '6', '9'].includes(gong)) score += 1;
        else if (purpose === '财运' && ['1', '7', '6'].includes(gong)) score += 1;
        else if (purpose === '婚姻' && ['2', '7', '9'].includes(gong)) score += 1;
        else if (purpose === '健康' && ['3', '9', '4'].includes(gong)) score += 1;
        else if (purpose === '学业' && ['4', '9', '3'].includes(gong)) score += 1;

        if (score > bestScore) {
            bestScore = score;
            bestGong = gong;
        }
    }

    let suggestions = [];
    switch (overallJiXiong) {
        case 'da_ji':
            suggestions.push('当前时运极佳，可大胆行事，推进重要计划。');
            suggestions.push('贵人运强，适合社交活动和寻求支持。');
            suggestions.push('财运亨通，可考虑投资或财务规划。');
            break;
        case 'xiao_ji':
            suggestions.push('时运较好，可稳步推进计划，但需谨慎。');
            suggestions.push('有贵人相助，但也需自身努力。');
            suggestions.push('财运平稳，宜守不宜进。');
            break;
        case 'ping':
            suggestions.push('时运平平，宜按部就班行事，不宜冒险。');
            suggestions.push('人际关系一般，需多加维护。');
            suggestions.push('财运一般，宜节制开支。');
            break;
        case 'xiao_xiong':
            suggestions.push('时运不佳，宜守不宜进，避免冒险。');
            suggestions.push('谨防小人，保持低调。');
            suggestions.push('财务宜节约，避免大额支出。');
            break;
        case 'da_xiong':
            suggestions.push('当前时运不佳，宜避开重要活动，保持低调。');
            suggestions.push('谨防小人和突发事件，避免冲突。');
            suggestions.push('财务宜严格控制，避免任何投资和大额支出。');
            break;
    }

    if (bestGong) {
        const bestGongInfo = jiuGongAnalysis[bestGong];
        suggestions.push(`最有利方位在${bestGongInfo.direction}方(${bestGongInfo.gongName}宫)，可多往此方位活动。`);

        if (purpose === '事业') suggestions.push('事业方面，注重稳扎稳打，积累经验和人脉，时机成熟再大展拳脚。');
        else if (purpose === '财运') suggestions.push('财运方面，建议稳健理财，避免投机，重视积累和长期规划。');
        else if (purpose === '婚姻') suggestions.push('婚姻方面，注重沟通和理解，创造和谐的家庭氛围。');
        else if (purpose === '健康') suggestions.push('健康方面，注意作息规律，适当运动，保持心情愉快。');
        else if (purpose === '学业') suggestions.push('学业方面，制定合理计划，坚持不懈，善于利用资源和请教他人。');
    }

    return {
        overallJiXiong,
        overallJiXiongText: {
            'da_ji': '大吉', 'xiao_ji': '小吉', 'ping': '平',
            'xiao_xiong': '小凶', 'da_xiong': '大凶'
        }[overallJiXiong],
        bestGong,
        suggestions
    };
}

/**
 * 计算奇门遁甲盘（时家拆补转盘）
 * @param {Date} date 日期时间
 * @param {Object} options 选项
 * @returns {Object} 排盘结果
 */
function calculate(date, options = {}) {
    const defaultOptions = {
        type: '四柱',
        method: '时家',
        purpose: '综合',
        location: '默认位置'
    };

    const opts = { ...defaultOptions, ...options };

    try {
        const lunar = Lunar.fromDate(date);
        const solar = Solar.fromDate(date);

        // 四柱
        const siZhu = {
            year: lunar.getYearInGanZhi(),
            month: lunar.getMonthInGanZhi(),
            day: lunar.getDayInGanZhi(),
            time: lunar.getTimeInGanZhi()
        };

        // 局数（拆补法）
        const juShu = calculateJuShu(date, opts.method);

        // 旬首六仪
        const xunShou = getXunShou(lunar, opts.method);

        // 日柱旬首六仪（用于标记天盘）
        const dayXunShou = getXunShou(lunar, '日家');

        // 时干
        const shiGan = getShiGan(lunar, opts.method);

        // 空亡
        const kongWangZhi = getKongWang(lunar, opts.method);
        const kongWangGong = getKongWangGong(kongWangZhi);

        // 驿马
        const maStar = getMaStar(lunar, opts.method);

        // 1. 地盘干（转盘排法，按宫数顺序排列）
        const diPan = diPanModule.getDiPan(juShu.type, parseInt(juShu.number));

        // 2. 天盘干（转盘，沿洛书环形转动）
        const tianPan = distributeTianPan(diPan, xunShou, shiGan);

        // 兼容旧代码
        const sanQiLiuYi = tianPan;

        // 3. 九星（转盘，与天盘同步转动）
        const jiuXingResult = jiuXingModule.distributeJiuXing(diPan, xunShou, shiGan);

        // 4. 八门（转盘，值使门按九宫数字顺序走时辰差步数）
        const hourDiff = getHourDiff(lunar, opts.method);
        const baMenResult = baMenModule.distributeBaMen(jiuXingResult.zhiFuGong, hourDiff, juShu.type);

        // 5. 八神（从值符落宫开始，阳遁顺时针，阴遁逆时针）
        const baShen = baShenModule.distributeBaShen(
            jiuXingResult.zhiFuLuoGong || jiuXingResult.zhiFuGong,
            juShu.type
        );

        // 6. 暗干
        const anGan = calculateAnGan(juShu.type);

        // 分析九宫吉凶
        const jiuGongAnalysis = {};
        for (let i = 1; i <= 9; i++) {
            jiuGongAnalysis[i] = analyzeGong(i, jiuXingResult.jiuXing, baMenResult.baMen, baShen);
        }

        // 综合分析
        const analysis = overallAnalysis(
            jiuGongAnalysis,
            jiuXingResult.zhiFuLuoGong || jiuXingResult.zhiFuGong,
            baMenResult.zhiShiGong,
            opts.purpose
        );

        return {
            basicInfo: {
                date: solar.toFullString(),
                lunarDate: lunar.toString(),
                type: opts.type,
                method: opts.method,
                purpose: opts.purpose,
                location: opts.location
            },
            siZhu,
            juShu,
            xunShou,
            dayXunShou,
            luoGongGan: shiGan,
            sanQiLiuYi,       // 天盘干（兼容旧模板）
            tianPan,           // 天盘干
            jiuXing: jiuXingResult.jiuXing,
            baMen: baMenResult.baMen,
            baShen,
            diPan,
            anGan,
            zhiFuGong: jiuXingResult.zhiFuLuoGong || jiuXingResult.zhiFuGong,
            zhiFuYuanGong: jiuXingResult.zhiFuGong,
            zhiFuXing: jiuXingResult.zhiFuXing,
            zhiShiGong: baMenResult.zhiShiGong,
            zhiShiMen: baMenResult.zhiShiMen,
            kongWangZhi,
            kongWangGong,
            maStar,
            jiuGongAnalysis,
            analysis
        };
    } catch (e) {
        console.error('奇门遁甲计算出错:', e);
        return {
            error: true,
            message: e.message,
            basicInfo: {
                date: date.toLocaleString(),
                type: opts.type,
                method: opts.method,
                purpose: opts.purpose,
                location: opts.location
            }
        };
    }
}

module.exports = {
    calculate,
    getKongWang,
    getKongWangGong,
    JIU_GONG,
    JIU_XING,
    BA_MEN,
    BA_SHEN,
    jiuXingModule,
    baMenModule,
    baShenModule,
    diPanModule
};
