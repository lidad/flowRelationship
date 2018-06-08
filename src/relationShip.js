function drawLine({ startX, startY }, { endX, endY }, rate = 0.1) {
  const cx1 = startX + 50;
  const cy1 = startY;
  const cx2 = endX - 50;
  const cy2 = endY - (20 * ((endY / startY) - 1));

  const startPoint = `${startX} ${startY}`;
  const endPoint = `${endX + (rate * 1)} ${endY}`;
  const cLine = `${cx1} ${cy1}, ${cx2} ${cy2}`;

  return `<path d="M${startPoint} C ${cLine}, ${endPoint}" stroke="#5682ff" fill="transparent" stroke-width="${rate * 10}" stroke-opacity="0.5"/>`;
}

function drawInfo({ startX, startY }, id, title, value, selected) {
  const titleX = (startX - 0) + 10;
  const titleY = (startY - 0) + 25;
  const valueX = (startX - 0) + 100;
  const valueY = titleY;
  const backgroundColor = selected ? '#5682ff' : '#e4e4e4';
  const textColor = selected ? '#ffffff' : '#333333';

  return `<g>
    <rect class="infoBlock" id="${id}" x="${startX}" y="${startY}"  rx="4" ry="4" width="200" height="40"  fill="${backgroundColor}" />
    <text x="${titleX}" y="${titleY}" font-family="Verdana" font-size="12" font-weight="300" fill="${textColor}">${title}</text>
    <text x="${valueX}" y="${valueY}" font-family="Verdana" font-size="12" font-weight="700" fill="${textColor}">${value}</text>
    </g>`;
}

/**
 * @export
 * data: [{
 *   id: number/string,
 *   name: string,
 *   value: number,
 *   from: number(from which point and it's id),
 */
export default class {
  constructor({ data = [], wrapElement, clickInfoBlock }) {
    this.renderWrap = wrapElement;
    this.clickInfoBlockCB = clickInfoBlock;
    this._resetData();

    if (data.length) {
      this.drawRelationship(data);
    }
  }

  _resetData() {
    this.CoordinateData = [];
    this.canvasSize = { height: 0, width: 0 };
    this.renderWrap.innerHTML = '';
  }

  _parseDataToGroup(data = []) {
    if (data.length === 0) {
      this._resetData();
      return;
    }

    const firstGroup = [];
    const groupData = [];

    while (data.length) {
      const group = [];
      const currentItem = data[0];
      data.splice(0, 1);

      for (let i = 0; i <= data.length - 1;) {
        if (!data[i].from) {
          data[i].from = NaN;
        }
        if (currentItem.from === data[i].from) {
          group.push(data[i]);
          data.splice(i, 1);
        } else {
          i += 1;
        }
      }
      if (group.length > 0) {
        groupData.push([currentItem, ...group]);
      } else {
        firstGroup.push(currentItem);
      }
    }

    groupData.unshift(firstGroup);
    this.groupData = groupData;
  }

  _addCoordinateToData() {
    this.CoordinateData = this.groupData.reduce((tempData, group, groupIndex) =>
      tempData.concat(group.map((item, itemIndex) => ({
        ...item,
        startX: groupIndex * 350,
        startY: itemIndex * 48,
      }))),
    []);

    const maxGroupLength = this.groupData.reduce((maxLength, { length }) => Math.max(length, maxLength), 0);

    this.canvasSize = {
      height: maxGroupLength * 48,
      width: (this.groupData.length) * 350,
    };
  }

  _drawInfoBlock() {
    const infoHtmlStr = this.CoordinateData.map(
      ({ startX, startY, name, value, id, from }, i, dataArr) => {
        const fromNode = dataArr.find(item => item.id === from);
        const hasChild = !!dataArr.find(item => item.from === id);
        const valueText = fromNode
          ? `${value}（${Math.ceil((value / fromNode.value) * 100)}%）`
          : value;

        return drawInfo({ startX, startY }, id, name, valueText, hasChild);
      }).join('');

    return infoHtmlStr;
  }

  _drawLines() {
    const infoHtmlStr = this.CoordinateData.reduce(
      (str, { startX, startY, value, from }, i, dataArr) => {
        const fromNode = dataArr.find(item => item.id === from);

        if (fromNode) {
          const startPoint = { startX: fromNode.startX + 200, startY: fromNode.startY + 20 };
          const endPoint = { endX: startX, endY: startY + 20 };
          const rate = value / fromNode.value;

          return str + drawLine(startPoint, endPoint, rate);
        }

        return str;
      }, '');

    return infoHtmlStr;
  }

  _bindEvent() {
    if (this.clickInfoBlockCB) {
      const infoBlocks = this.renderWrap.querySelectorAll('.infoBlock');

      Array.prototype.forEach.call(infoBlocks, (infoBlock) => {
        infoBlock.addEventListener('click', ({ target }) => {
          this.clickInfoBlockCB(target.id);
        });
      });
    }
  }

  drawRelationship(data) {
    this._parseDataToGroup(data.concat());
    this._addCoordinateToData();

    const { height, width } = this.canvasSize;
    const relationShipHtmlStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" version="1.1">
        ${this._drawInfoBlock()}
        ${this._drawLines()}
      </svg>`;

    this.renderWrap.innerHTML = relationShipHtmlStr;
    this._bindEvent();
  }
}
