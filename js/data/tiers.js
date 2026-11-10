/* 层级定义：颜色、深度、语气 —— 越深越冷、越诡异 */
window.TIERS = [
  {
    n: 1, id: "tier-1", name: "浅滩", en: "The Surface",
    color: "#8fe3c0", depth: 0,
    tagline: "人人都听过的道教",
    desc: "课本与庙会里的道教：三清、太极、八仙、黄历。你以为自己已经了解这一层——它只是冰山的尖。"
  },
  {
    n: 2, id: "tier-2", name: "潮下", en: "Just Below",
    color: "#7fd6ff", depth: 30,
    tagline: "进过庙、抽过签就会遇到",
    desc: "符、签、斋醮、城隍与灶神。日常用得上，但已经需要一点门内知识才能说清。"
  },
  {
    n: 3, id: "tier-3", name: "冷水层", en: "Cold Current",
    color: "#9db8ff", depth: 120,
    tagline: "开始出现身体与鬼",
    desc: "内丹、存思、养鬼、走阴。道教开始处理「身体里住着什么」以及「死人往哪里去」这两件事。"
  },
  {
    n: 4, id: "tier-4", name: "幽暗带", en: "Twilight Zone",
    color: "#b39bff", depth: 400,
    tagline: "冥界的官僚制",
    desc: "酆都、罗酆六天、泰山府君、地下主者。阴间不是混沌，而是一套有编制、有文书、有考课的衙门。"
  },
  {
    n: 5, id: "tier-5", name: "尸解层", en: "The Corpse Layer",
    color: "#d68fff", depth: 1000,
    tagline: "成仙要留下什么",
    desc: "人会死，但仙人不。尸解、太阴炼形、剑解兵解——留下来的是竹杖、是剑、是一具空衣。"
  },
  {
    n: 6, id: "tier-6", name: "鬼律层", en: "The Ghost Code",
    color: "#ff8fb8", depth: 2500,
    tagline: "写给鬼的法律",
    desc: "《女青鬼律》给鬼定罪、给鬼判刑；道士按条文召劾。冥府不是神话，是一部可以引用的法典。"
  },
  {
    n: 7, id: "tier-7", name: "劫运层", en: "Kalpa Layer",
    color: "#ffa07f", depth: 5000,
    tagline: "时间本身会坏掉",
    desc: "龙汉、赤明、开皇、延康——宇宙按劫循环，末劫将至，只有「种民」能留下来。"
  },
  {
    n: 8, id: "tier-8", name: "无底渊", en: "The Abyss",
    color: "#c9d4e6", depth: 11000,
    tagline: "连道教自己也不愿多谈的角落",
    desc: "废经、伪经、被禁的仪式、失传的目录、只在批注里出现过一次的名词。最冷的一层没有故事，只有断简。"
  }
];

window.CATEGORIES = [
  { id: "classic", name: "经典" },
  { id: "deity", name: "神祇" },
  { id: "immortal", name: "仙道" },
  { id: "ritual", name: "科仪" },
  { id: "underworld", name: "冥界" },
  { id: "ghost", name: "鬼律" },
  { id: "body", name: "身体" },
  { id: "folk", name: "民俗" },
  { id: "text", name: "文献" },
  { id: "person", name: "人物" },
  { id: "cosmology", name: "宇宙论" },
  { id: "taboo", name: "禁忌" }
];
