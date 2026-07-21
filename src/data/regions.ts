// 中国行政区划数据（省级+主要城市）
// 数据来源：民政部行政区划，仅收录地级市及以上

interface Region {
  value: string;
  label: string;
  children?: Region[];
}

const regions: Region[] = [
  { value: '110000', label: '北京市', children: [
    { value: '110100', label: '北京市', children: [
      { value: '110101', label: '东城区' }, { value: '110102', label: '西城区' },
      { value: '110105', label: '朝阳区' }, { value: '110106', label: '丰台区' },
      { value: '110107', label: '石景山区' }, { value: '110108', label: '海淀区' },
      { value: '110109', label: '门头沟区' }, { value: '110111', label: '房山区' },
      { value: '110112', label: '通州区' }, { value: '110113', label: '顺义区' },
      { value: '110114', label: '昌平区' }, { value: '110115', label: '大兴区' },
      { value: '110116', label: '怀柔区' }, { value: '110117', label: '平谷区' },
      { value: '110118', label: '密云区' }, { value: '110119', label: '延庆区' },
    ]},
  ]},
  { value: '120000', label: '天津市', children: [
    { value: '120100', label: '天津市', children: [
      { value: '120101', label: '和平区' }, { value: '120102', label: '河东区' },
      { value: '120103', label: '河西区' }, { value: '120104', label: '南开区' },
      { value: '120105', label: '河北区' }, { value: '120106', label: '红桥区' },
      { value: '120110', label: '东丽区' }, { value: '120111', label: '西青区' },
      { value: '120112', label: '津南区' }, { value: '120113', label: '北辰区' },
      { value: '120114', label: '武清区' }, { value: '120115', label: '宝坻区' },
      { value: '120116', label: '滨海新区' },
    ]},
  ]},
  { value: '310000', label: '上海市', children: [
    { value: '310100', label: '上海市', children: [
      { value: '310101', label: '黄浦区' }, { value: '310104', label: '徐汇区' },
      { value: '310105', label: '长宁区' }, { value: '310106', label: '静安区' },
      { value: '310107', label: '普陀区' }, { value: '310109', label: '虹口区' },
      { value: '310110', label: '杨浦区' }, { value: '310112', label: '闵行区' },
      { value: '310113', label: '宝山区' }, { value: '310114', label: '嘉定区' },
      { value: '310115', label: '浦东新区' }, { value: '310116', label: '金山区' },
      { value: '310117', label: '松江区' }, { value: '310118', label: '青浦区' },
      { value: '310120', label: '奉贤区' }, { value: '310151', label: '崇明区' },
    ]},
  ]},
  { value: '500000', label: '重庆市', children: [
    { value: '500100', label: '重庆市', children: [
      { value: '500101', label: '万州区' }, { value: '500102', label: '涪陵区' },
      { value: '500103', label: '渝中区' }, { value: '500104', label: '大渡口区' },
      { value: '500105', label: '江北区' }, { value: '500106', label: '沙坪坝区' },
      { value: '500107', label: '九龙坡区' }, { value: '500108', label: '南岸区' },
      { value: '500109', label: '北碚区' }, { value: '500112', label: '渝北区' },
      { value: '500113', label: '巴南区' },
    ]},
  ]},
  { value: '530000', label: '云南省', children: [
    { value: '530100', label: '昆明市', children: [
      { value: '530102', label: '五华区' }, { value: '530103', label: '盘龙区' },
      { value: '530111', label: '官渡区' }, { value: '530112', label: '西山区' },
      { value: '530113', label: '东川区' }, { value: '530114', label: '呈贡区' },
      { value: '530124', label: '富民县' }, { value: '530126', label: '石林彝族自治县' },
      { value: '530181', label: '安宁市' },
    ]},
    { value: '530300', label: '曲靖市' },
    { value: '530400', label: '玉溪市' },
    { value: '530500', label: '保山市' },
    { value: '530600', label: '昭通市' },
    { value: '530700', label: '丽江市' },
    { value: '530800', label: '普洱市' },
    { value: '532300', label: '楚雄彝族自治州' },
    { value: '532500', label: '红河哈尼族彝族自治州' },
    { value: '532600', label: '文山壮族苗族自治州' },
    { value: '532800', label: '西双版纳傣族自治州' },
    { value: '532900', label: '大理白族自治州' },
    { value: '533100', label: '德宏傣族景颇族自治州' },
  ]},
  { value: '130000', label: '河北省', children: [
    { value: '130100', label: '石家庄市' }, { value: '130200', label: '唐山市' },
    { value: '130300', label: '秦皇岛市' }, { value: '130400', label: '邯郸市' },
    { value: '130500', label: '邢台市' }, { value: '130600', label: '保定市' },
  ]},
  { value: '140000', label: '山西省', children: [
    { value: '140100', label: '太原市' }, { value: '140200', label: '大同市' },
  ]},
  { value: '210000', label: '辽宁省', children: [
    { value: '210100', label: '沈阳市' }, { value: '210200', label: '大连市' },
  ]},
  { value: '220000', label: '吉林省', children: [
    { value: '220100', label: '长春市' }, { value: '220200', label: '吉林市' },
  ]},
  { value: '230000', label: '黑龙江省', children: [
    { value: '230100', label: '哈尔滨市' }, { value: '230200', label: '齐齐哈尔市' },
  ]},
  { value: '320000', label: '江苏省', children: [
    { value: '320100', label: '南京市' }, { value: '320200', label: '无锡市' },
    { value: '320300', label: '徐州市' }, { value: '320400', label: '常州市' },
    { value: '320500', label: '苏州市' }, { value: '320600', label: '南通市' },
  ]},
  { value: '330000', label: '浙江省', children: [
    { value: '330100', label: '杭州市', children: [
      { value: '330102', label: '上城区' }, { value: '330105', label: '拱墅区' },
      { value: '330106', label: '西湖区' }, { value: '330108', label: '滨江区' },
      { value: '330109', label: '萧山区' }, { value: '330110', label: '余杭区' },
    ]},
    { value: '330200', label: '宁波市' }, { value: '330300', label: '温州市' },
  ]},
  { value: '340000', label: '安徽省', children: [
    { value: '340100', label: '合肥市' },
  ]},
  { value: '350000', label: '福建省', children: [
    { value: '350100', label: '福州市' }, { value: '350200', label: '厦门市' },
  ]},
  { value: '360000', label: '江西省', children: [
    { value: '360100', label: '南昌市' },
  ]},
  { value: '370000', label: '山东省', children: [
    { value: '370100', label: '济南市' }, { value: '370200', label: '青岛市' },
  ]},
  { value: '410000', label: '河南省', children: [
    { value: '410100', label: '郑州市' }, { value: '410300', label: '洛阳市' },
  ]},
  { value: '420000', label: '湖北省', children: [
    { value: '420100', label: '武汉市' },
  ]},
  { value: '430000', label: '湖南省', children: [
    { value: '430100', label: '长沙市' },
  ]},
  { value: '440000', label: '广东省', children: [
    { value: '440100', label: '广州市', children: [
      { value: '440103', label: '荔湾区' }, { value: '440104', label: '越秀区' },
      { value: '440105', label: '海珠区' }, { value: '440106', label: '天河区' },
      { value: '440111', label: '白云区' }, { value: '440112', label: '黄埔区' },
      { value: '440113', label: '番禺区' },
    ]},
    { value: '440300', label: '深圳市', children: [
      { value: '440303', label: '罗湖区' }, { value: '440304', label: '福田区' },
      { value: '440305', label: '南山区' }, { value: '440306', label: '宝安区' },
      { value: '440307', label: '龙岗区' }, { value: '440308', label: '盐田区' },
    ]},
    { value: '440400', label: '珠海市' }, { value: '440600', label: '佛山市' },
    { value: '441900', label: '东莞市' },
  ]},
  { value: '450000', label: '广西壮族自治区', children: [
    { value: '450100', label: '南宁市' }, { value: '450300', label: '桂林市' },
  ]},
  { value: '460000', label: '海南省', children: [
    { value: '460100', label: '海口市' }, { value: '460200', label: '三亚市' },
  ]},
  { value: '510000', label: '四川省', children: [
    { value: '510100', label: '成都市', children: [
      { value: '510104', label: '锦江区' }, { value: '510105', label: '青羊区' },
      { value: '510106', label: '金牛区' }, { value: '510107', label: '武侯区' },
      { value: '510108', label: '成华区' }, { value: '510112', label: '龙泉驿区' },
    ]},
    { value: '510300', label: '自贡市' },
  ]},
  { value: '520000', label: '贵州省', children: [
    { value: '520100', label: '贵阳市' },
  ]},
  { value: '540000', label: '西藏自治区', children: [
    { value: '540100', label: '拉萨市' },
  ]},
  { value: '610000', label: '陕西省', children: [
    { value: '610100', label: '西安市' },
  ]},
  { value: '620000', label: '甘肃省', children: [
    { value: '620100', label: '兰州市' },
  ]},
  { value: '630000', label: '青海省', children: [
    { value: '630100', label: '西宁市' },
  ]},
  { value: '640000', label: '宁夏回族自治区', children: [
    { value: '640100', label: '银川市' },
  ]},
  { value: '650000', label: '新疆维吾尔自治区', children: [
    { value: '650100', label: '乌鲁木齐市' },
  ]},
  { value: '710000', label: '台湾省' },
  { value: '810000', label: '香港特别行政区' },
  { value: '820000', label: '澳门特别行政区' },
];

export type { Region };
export default regions;
