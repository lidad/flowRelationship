const BOX_WIDTH = 168;
const BOX_HEIGHT = 60;
const BOX_INTERVAL = 16;
const BOX_ARROW_INTERVAL = 24;
const ARROW_LENGTH = 168;
const ARROW_HEAD_HEIGHT = 8;
const EXTENSION_WIDTH = 108;
const BOX_EXTENSION_INTERVAL = 4;

function drawTotalCount(totalCount, name, value) {
  const boxStartX = ARROW_LENGTH + BOX_ARROW_INTERVAL;
  const lineHeight = BOX_HEIGHT / 2;

  return `<g>
      ${name
    ? `<text x="16" y="${lineHeight - 12}" font-size="12" fill="#999999">${name}：${value}</text>`
    : ''}
      <line x1="0" y1="${lineHeight}" x2="${ARROW_LENGTH}" y2="${lineHeight}" fill="none" stroke="#e5e5e5" stroke-width="2"/>
      <rect x="${boxStartX}" y="0" width="${BOX_WIDTH}" height="60" fill="#108ee9"/>
    </g>`;
}

function drawLine({ startX, startY }, text) {
  const endX = startX + ARROW_LENGTH;
  const endY = startY + BOX_HEIGHT + BOX_INTERVAL;
  const turnPoint = `${startX},${endY}`;
  const endPoint = `${endX},${endY}`;
  const arrowStartX = endX - ARROW_HEAD_HEIGHT;
  const arrowHalfHeight = ARROW_HEAD_HEIGHT / 2;

  return `<g>
      <text x="${startX + 16}" y="${endY - 12}" font-size="12" fill="#999999">${text}</text>
      <polyline points="${startX},${startY} ${turnPoint} ${endPoint}" fill="none" stroke="#e5e5e5" stroke-width="2"/>
      <polyline points="${arrowStartX},${endY - arrowHalfHeight} ${arrowStartX},${endY + arrowHalfHeight} ${endX},${endY}" fill="#e5e5e5"/>
    </g>`;
}

function drawRateBox({ startX, startY }, convertRate) {
  const convertX = BOX_WIDTH * convertRate;
  const unConvertWidth = BOX_WIDTH - convertX;

  return `<g>
      <rect x="${startX}" y="${startY}" width="${unConvertWidth}" height="60" fill="#f2f2f2"/>
      <rect x="${startX + unConvertWidth}" y="${startY}" width="${convertX}" height="60" fill="#108ee9"/>
    </g>`;
}

function drawExtensionInfo({ startX, startY }, from, extensionInfo) {
  const fromX = startX + BOX_WIDTH + BOX_EXTENSION_INTERVAL;
  const extensionInfoStr = extensionInfo.map(({ name, value }, i) => {
    const extensionStartX = fromX + (EXTENSION_WIDTH * (i + 1)) + 24;

    return `<text x="${extensionStartX}" y="${startY + 26}" font-size="12" font-weight="200" fill="#999999">${name}</text>
    <text x="${extensionStartX}" y="${startY + 44}" font-size="12" font-weight="700" fill="#333333">${value}</text>`;
  });

  return `<g>
      <rect x="${fromX}" y="${startY}" width="${EXTENSION_WIDTH * (extensionInfo.length + 1)}" height="60" fill="#e9f2fe"/>
      <text x="${fromX + 24}" y="${startY + 35}" font-size="14" font-weight="200" fill="#1E1E1E">${from}</text>
      ${extensionInfoStr}
    </g>`;
}
/**
 * data:[{
 *  id: number,
 *  name: string,
 *  value: number,
 *  from: string
 * }]
 */
export default class {
  constructor({ wrapElement, data }) {
    this.renderWrap = wrapElement;

    this.drawConvertChart(data);
  }

  _resetData() {
    this.data = [];
    this.totalCount = 0;
    this.canvasSize = { height: 0, width: 0 };
    this.renderWrap.innerHTML = '';
  }

  _parseData(data) {
    const { totalCount, maxExtension } = data.reduce((resObj, { value, extensionInfo }) => ({
      totalCount: resObj.totalCount + (value || 0),
      maxExtension: Math.max(resObj.maxExtension, extensionInfo ? extensionInfo.length : 0),
    }), { totalCount: 0, maxExtension: 0 });

    this.data = data.map(item => Object.assign({
      convertRate: Math.ceil((item.value / totalCount) * 100) / 100,
    }, item));
    this.totalCount = totalCount;

    this.canvasSize = {
      height: (BOX_HEIGHT + BOX_INTERVAL) * data.length,
      width: ARROW_LENGTH + BOX_ARROW_INTERVAL + BOX_WIDTH
        + BOX_EXTENSION_INTERVAL + (EXTENSION_WIDTH * (maxExtension + 1)),
    };
  }

  _drawRateBox() {
    const boxBlockHeight = BOX_HEIGHT + BOX_INTERVAL;
    const boxBlockOffset = ARROW_LENGTH + BOX_ARROW_INTERVAL;

    return this.data.map(({ convertRate, from, extensionInfo = [] }, i) => {
      if (i) {
        const startPoint = {
          startX: boxBlockOffset,
          startY: boxBlockHeight * i,
        };


        return `${drawRateBox(startPoint, convertRate)}${drawExtensionInfo(startPoint, from, extensionInfo)}`;
      }

      return `${drawTotalCount(this.totalCount)}${drawExtensionInfo({ startX: boxBlockOffset, startY: 0 }, from, extensionInfo)}`;
    });
  }

  _drawConvertArrow() {
    const arrowHeight = BOX_HEIGHT + BOX_INTERVAL;
    const startHeight = BOX_HEIGHT / 2;

    return this.data.slice(1, this.data.length).map(({ value, name, convertRate }, i) => {
      const startPoint = {
        startX: 0,
        startY: startHeight + (arrowHeight * i),
      };
      const text = `${name} ${value}(${convertRate * 100}%)`;

      return drawLine(startPoint, text);
    });
  }

  drawConvertChart(data = []) {
    if (data.length) {
      this._parseData(data);

      const { height, width } = this.canvasSize;
      const convertChartStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" version="1.1">
          ${this._drawRateBox()}
          ${this._drawConvertArrow()}
        </svg>`;

      this.renderWrap.innerHTML = convertChartStr;
    } else {
      this._resetData();
    }
  }
}
