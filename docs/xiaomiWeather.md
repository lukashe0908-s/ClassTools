### 全量天气 返回结构

#### 顶层字段

- `typhoon`：台风信息（可选）
- `current`：当前天气实况
- `forecastDaily`：逐日预报（15 天）
- `forecastHourly`：逐小时预报（24 小时）
- `indices`：生活指数
- `alerts`：气象预警
- `yesterday`：昨日天气
- `preHour`：上一小时实况
- `aqi`：当前空气质量详情
- `brandInfo`：数据来源品牌信息
- `sourceMaps`：字段级数据来源映射
- `url`：第三方来源链接（占位）
- `updateTime`：数据更新时间（毫秒时间戳）

---

#### `typhoon`：台风信息

> 数组，可能为空

- `centWindSpeed`：中心附近最大风速（m/s）
- `lat`：纬度
- `lon`：经度
- `typhoonCname`：中文名
- `typhoonEname`：英文名
- `typhoonCode`：台风编号
- `typhoonType`：台风等级（如 `TS`）

---

#### `current`：当前天气状况

- `temperature`
  - `value`：当前气温
  - `unit`：单位（℃）

- `feelsLike`
  - `value`：体感温度
  - `unit`：单位

- `humidity`
  - `value`：相对湿度
  - `unit`：%

- `pressure`
  - `value`：气压
  - `unit`：hPa

- `visibility`
  - `value`：能见度（可能为空）
  - `unit`：km

- `weather`：天气现象代码（字符串）
- `wind`
  - `direction`
    - `value`：风向角度
    - `unit`：°

  - `speed`
    - `value`：风速
    - `unit`：km/h

- `uvIndex`：紫外线指数（字符串数值）
- `pubTime`：实况发布时间（ISO8601）

---

#### `forecastDaily`：逐日预报（15 天）

- `status`：状态码
- `pubTime`：发布时间

##### `forecastDaily.aqi`：每日空气质量

- `pubTime`
- `value`：AQI 数组（今日起 15 天）
- `brandInfo`：数据来源

##### `forecastDaily.precipitationProbability`：降水概率

- `value`：降水概率数组（字符串，百分比）

##### `forecastDaily.sunRiseSet`：日出日落

- `value`：数组
  - `from`：日出时间
  - `to`：日落时间

##### `forecastDaily.temperature`：每日气温

- `unit`：℃
- `value`：
  - `from`：最高气温
  - `to`：最低气温

##### `forecastDaily.weather`：每日天气现象

- `value`：
  - `from`：白天天气代码
  - `to`：夜间天气代码

##### `forecastDaily.wind`：每日风力

- `direction`
  - `unit`：°
  - `value`
    - `from`：白天风向
    - `to`：夜间风向

- `speed`
  - `unit`：km/h
  - `value`
    - `from`：白天风速
    - `to`：夜间风速

---

#### `forecastHourly`：逐小时预报（24 小时）

- `status`
- `desc`：描述文本

##### `forecastHourly.temperature`

- `unit`：℃
- `value`：24 小时温度数组

##### `forecastHourly.weather`

- `value`：24 小时天气代码数组

##### `forecastHourly.aqi`

- `value`：24 小时 AQI 数组
- `brandInfo`
- `pubTime`

##### `forecastHourly.wind`

- `value`：
  - `datetime`：时间
  - `direction`：风向角度
  - `speed`：风速（km/h）

---

#### `indices`：生活指数

- `indices`：
  - `type`：指数类型
    - `uvIndex`：紫外线
    - `humidity`：湿度
    - `feelsLike`：体感温度
    - `pressure`：气压
    - `carWash`：洗车指数
    - `sports`：运动指数

  - `value`：指数值

- `pubTime`
- `status`

---

#### `alerts`：气象预警

> 数组，可能为空

- `alertId`：预警唯一 ID
- `locationKey`：地区编码
- `title`：预警标题
- `type`：预警类型（如大雾）
- `level`：等级（蓝 / 黄 / 橙 / 红）
- `pubTime`：发布时间
- `detail`：详细描述
- `images`
  - `icon`：图标
  - `notice`：公告图片

- `defense`：防御建议
  - `defenseIcon`
  - `defenseText`

---

#### `aqi`：当前空气质量（详细）

- `aqi`：空气质量指数
- `pm25` / `pm10` / `no2` / `so2` / `co` / `o3`
- `primary`：首要污染物
- `suggest`：健康建议
- `src`：来源
- `brandInfo`
- `pubTime`
- `status`
- `*Desc`：各污染物说明文本

---

#### `yesterday`：昨日天气

- `date`：日期
- `aqi`
- `sunRise`
- `sunSet`
- `tempMax`
- `tempMin`
- `weatherStart`
- `weatherEnd`
- `windDircStart`
- `windDircEnd`
- `windSpeedStart`
- `windSpeedEnd`
- `status`

---

#### `preHour`：上一小时实况

> 数组，通常只有一条

- `temperature`
- `feelsLike`
- `humidity`
- `pressure`
- `visibility`
- `weather`
- `wind`
- `uvIndex`
- `aqi`（含完整污染物结构）
- `pubTime`
