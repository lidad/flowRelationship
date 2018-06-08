const BOX_WIDTH = 168;
const BOX_HEIGHT = 60;
const BOX_INTERVAL = 16;
const BOX_ARROW_INTERVAL = 24;
const ARROW_LENGTH = 168;
const ARROW_HEAD_HEIGHT = 8;

function drawTotalCount(totalCount) {
  const boxStartX = ARROW_LENGTH + BOX_ARROW_INTERVAL;
  const lineHeight = BOX_HEIGHT / 2;

  return `<g>
      <text x="16" y="${lineHeight - 12}" font-size="12" fill="#999999">数据总量：${totalCount}</text>
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
  const convertX = 168 * convertRate;
  const unConvertWidth = BOX_WIDTH - convertX;

  return `<g>
      <rect x="${startX}" y="${startY}" width="${unConvertWidth}" height="60" fill="#f2f2f2"/>
      <rect x="${startX + unConvertWidth}" y="${startY}" width="${convertX}" height="60" fill="#108ee9"/>
    </g>`;
}
/**
 * data:[{
 *  id: number,
 *  name: string,
 *  value: number
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
    const totalCount = data.reduce((count, { value }) => count + value, 0);

    this.data = data.map(item => Object.assign({
      convertRate: Math.ceil((item.value / totalCount) * 100) / 100,
    }, item));
    this.totalCount = totalCount;

    this.canvasSize = {
      height: BOX_HEIGHT + ((BOX_HEIGHT + BOX_INTERVAL) * data.length),
      width: ARROW_LENGTH + BOX_ARROW_INTERVAL + BOX_WIDTH,
    };
  }

  _drawRateBox() {
    const boxBlockHeight = BOX_HEIGHT + BOX_INTERVAL;
    const boxBlockOffset = ARROW_LENGTH + BOX_ARROW_INTERVAL;

    return this.data.map(({ convertRate }, i) => {
      const startPoint = {
        startX: boxBlockOffset,
        startY: boxBlockHeight * (i + 1),
      };


      return drawRateBox(startPoint, convertRate);
    });
  }

  _drawConvertArrow() {
    const arrowHeight = BOX_HEIGHT + BOX_INTERVAL;
    const startHeight = BOX_HEIGHT / 2;

    return this.data.map(({ value, name, convertRate }, i) => {
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
          ${drawTotalCount(this.totalCount)}
          ${this._drawRateBox()}
          ${this._drawConvertArrow()}
        </svg>`;

      this.renderWrap.innerHTML = convertChartStr;
    } else {
      this._resetData();
    }
  }
}
