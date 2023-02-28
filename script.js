function verifyAndExtractDMXPacket(packet) {
  if (packet.length < 5) {
    console.error('Pacote DMX inválido: tamanho mínimo não atingido.');
    return null;
  }

  if (parseInt(packet[0], 2) !== 0x00) {
    console.error('Pacote DMX inválido: start code incorreto.');
    return null;
  }
  if (parseInt(packet[1], 2) !== 0xff) {
    console.error('Pacote DMX inválido: tipo de pacote DMX incorreto.');
    return null;
  }

  let numChannels = parseInt(packet[2], 2);
  if (numChannels < 0x01 || numChannels > 0xff) {
    console.error('Pacote DMX inválido: número de canais DMX incorreto.');
    return null;
  }

  if (packet.length !== 3 + numChannels + 1) {
    console.error('Pacote DMX inválido: tamanho do pacote incorreto.');
    return null;
  }

  let deviceAddress = packet[3]; // Endereço do aparelho DMX
  let channelData = []; // Array com os valores dos canais DMX

  for (let i = 0; i < numChannels; i++) {
    let channelValue = packet[i + 4]; // Valor do canal DMX
    channelData.push(channelValue);
  }

  let stopByte = packet[packet.length - 1]; // Byte de parada

  return {
    deviceAddress: deviceAddress,
    channelData: channelData,
    stopByte: stopByte,
  };
}

function stringToByteArray(str) {
  let byteArray = [];
  for (let i = 0; i < str.length; i += 8) {
    let byteStr = str.substr(i, 8);
    byteArray.push(byteStr);
  }
  return byteArray;
}

function toBinary8Bits(num) {
  let binary = num.toString(2);
  while (binary.length < 8) {
    binary = '0' + binary;
  }
  return binary;
}

const DMX = (i, l) => {
  const dmx = {
    id: i,
    el: l,
    event: null,
  };
  const verify = (cmd) => {
    if (cmd.deviceAddress.toString() === dmx.id.toString()) {
      const R = parseInt(cmd.channelData[1], 2);
      const G = parseInt(cmd.channelData[2], 2);
      const B = parseInt(cmd.channelData[3], 2);
      const T = parseInt(cmd.channelData[4], 2);
      dmx.el.style.backgroundColor = `rgb(${R}, ${G}, ${B})`;
      if (dmx.event === null) {
        dmx.event = setTimeout(() => {
          dmx.el.style.backgroundColor = ``;
          clearTimeout(dmx.event);
          dmx.event = null;
        }, T * 10);
      } else {
        clearTimeout(dmx.event);
        dmx.event = setTimeout(() => {
          dmx.el.style.backgroundColor = ``;
          clearTimeout(dmx.event);
          dmx.event = null;
        }, T * 10);
      }
    }
  };
  Object.defineProperty(dmx, 'verify', {
    enumerable: true,
    configurable: false,
    writable: false,
    value: verify,
  });
  return dmx;
};

const OBSERVER = [];

let count = 0;
let row = 0;

let currentRow = null;

const appDiv = document.getElementById('app');

const STYLE = {
  color: 'black',
  width: '100%',
  display: 'block',
};

Object.assign(appDiv.style, STYLE);

const H1 = document.createElement('h1');
H1.innerHTML = 'COMANDO: ';
appDiv.appendChild(H1);

function createRow() {
  const DIV = document.createElement('div');
  DIV.setAttribute('row', row);
  const S = {
    color: 'black',
    border: '1px solid black',
    height: '30px',
    width: '100%',
    height: 'content',
    display: 'flex',
    marginBotom: '3px',
  };
  Object.assign(DIV.style, S);
  row++;
  currentRow = DIV;
  appDiv.appendChild(DIV);
}

function addElement() {
  if (currentRow === null) {
    createRow();
  }
  const DIV = document.createElement('div');
  DIV.setAttribute('item', currentRow.getAttribute('row'));
  DIV.setAttribute('row', row);
  const S = {
    color: 'black',
    border: '1px solid black',
    height: '100px',
    width: '12.5%',
    display: 'block',
    margin: '2px 0',
  };
  Object.assign(DIV.style, S);

  const DISPLAY = document.createElement('div');
  const S_2 = {
    height: '80%',
    width: '100%',
    borderBottom: '1px solid black',
  };
  Object.assign(DISPLAY.style, S_2);
  DIV.appendChild(DISPLAY);

  const INPUT = document.createElement('input');
  INPUT.type = 'number';
  INPUT.max = 255;
  INPUT.min = 0;
  INPUT.value = count;
  const S_3 = {
    height: '18%',
    width: '100%',
    border: 'none',
    padding: '0',
    margin: '0',
    borderRadius: '0',
    outline: 'none',
  };
  Object.assign(INPUT.style, S_3);
  DIV.appendChild(INPUT);

  const dmx = DMX(toBinary8Bits(count.toString(2)), DISPLAY);
  OBSERVER.push(dmx);

  INPUT.addEventListener(
    'change',
    (e) => {
      let v = parseInt(e.target.value, 10);
      if (v > -1 && v < 256) {
        dmx.id = toBinary8Bits(v);
        e.target.value = v;
      } else {
        e.target.value = '0';
        dmx.id = toBinary8Bits('0');
      }
    },
    false
  );
  currentRow.appendChild(DIV);
  count++;
  if (currentRow.children.length === 8) {
    createRow();
  }
}

function commander(command) {
  const ARRAY = stringToByteArray(command);
  const CMD = verifyAndExtractDMXPacket(ARRAY);
  const R = parseInt(CMD.channelData[1], 2);
  const G = parseInt(CMD.channelData[2], 2);
  const B = parseInt(CMD.channelData[3], 2);
  const T = parseInt(CMD.channelData[4], 2);
  console.log(
    'ADDRES: ',
    CMD.deviceAddress,
    ' RED: ',
    R,
    ' GREEN: ',
    G,
    ' BLUE: ',
    B,
    ' TIME: ',
    T
  );
  for (const n of OBSERVER) {
    n.verify(CMD);
  }
}

const COMMAND = {
  r: '00000000',
  g: '00000000',
  b: '00000000',
  t: '11111111',
};

const DIV_CONTAINER = document.createElement('div');
DIV_CONTAINER.style.width = '100%;'
DIV_CONTAINER.style.display = 'flex';

const DIV_R = document.createElement('div');
const DIV_R_LABEL = document.createElement('div');
DIV_R_LABEL.innerHTML = `RED: ${0}`;
DIV_R_LABEL.style.width = '100%';
const INPUT_R = document.createElement('input');
INPUT_R.type = 'range';
INPUT_R.style.width = '100%;';
INPUT_R.min = '0';
INPUT_R.max = '255';
INPUT_R.value = '0';
INPUT_R.addEventListener(
  'change',
  (e) => {
    DIV_R_LABEL.innerHTML = `RED: ${e.target.value}`;
    let v = parseInt(e.target.value);
    COMMAND.r = toBinary8Bits(v);
    INPUT_R.blur();
  },
  false
);
DIV_R.appendChild(DIV_R_LABEL);
DIV_R.appendChild(INPUT_R);
DIV_CONTAINER.appendChild(DIV_R);

const DIV_G = document.createElement('div');
const DIV_G_LABEL = document.createElement('div');
DIV_G_LABEL.innerHTML = `GREEN: ${0}`;
DIV_G_LABEL.style.width = '100%';
const INPUT_G = document.createElement('input');
INPUT_G.type = 'range';
INPUT_G.style.width = '100%;';
INPUT_G.min = '0';
INPUT_G.max = '255';
INPUT_G.value = '0';
INPUT_G.addEventListener(
  'change',
  (e) => {
    DIV_G_LABEL.innerHTML = `GREEN: ${e.target.value}`;
    let v = parseInt(e.target.value);
    COMMAND.g = toBinary8Bits(v);
    INPUT_G.blur();
  },
  false
);
DIV_G.appendChild(DIV_G_LABEL);
DIV_G.appendChild(INPUT_G);
DIV_CONTAINER.appendChild(DIV_G);

const DIV_B = document.createElement('div');
const DIV_B_LABEL = document.createElement('div');
DIV_B_LABEL.innerHTML = `BLUE: ${0}`;
DIV_B_LABEL.style.width = '100%';
const INPUT_B = document.createElement('input');
INPUT_B.type = 'range';
INPUT_B.style.width = '100%;';
INPUT_B.min = '0';
INPUT_B.max = '255';
INPUT_B.value = '0';
INPUT_B.addEventListener(
  'change',
  (e) => {
    DIV_B_LABEL.innerHTML = `BLUE: ${e.target.value}`;
    let v = parseInt(e.target.value);
    COMMAND.b = toBinary8Bits(v);
    INPUT_B.blur();
  },
  false
);
DIV_B.appendChild(DIV_B_LABEL);
DIV_B.appendChild(INPUT_B);
DIV_CONTAINER.appendChild(DIV_B);

const DIV_T = document.createElement('div');
const DIV_T_LABEL = document.createElement('div');
DIV_T_LABEL.style.width = '100%';
const INPUT_T = document.createElement('input');
INPUT_T.type = 'range';
INPUT_T.style.width = '100%;';
INPUT_T.min = '0';
INPUT_T.max = '255';
INPUT_T.value = '255';
DIV_T_LABEL.innerHTML = `TIME: ${INPUT_T.value}`;
INPUT_T.addEventListener(
  'change',
  (e) => {
    DIV_T_LABEL.innerHTML = `TIME: ${e.target.value}`;
    let v = parseInt(e.target.value);
    COMMAND.t = toBinary8Bits(v);
    INPUT_T.blur();
  },
  false
);
DIV_T.appendChild(DIV_T_LABEL);
DIV_T.appendChild(INPUT_T);
DIV_CONTAINER.appendChild(DIV_T);

const BTN_ADD_MACHINE = document.createElement('button');
BTN_ADD_MACHINE.innerHTML = 'ADD - MACHINE';
BTN_ADD_MACHINE.addEventListener(
  'click',
  () => {
    if (count < 256) {
      addElement();
    }
    BTN_ADD_MACHINE.blur();
  },
  false
);

appDiv.appendChild(DIV_CONTAINER);
appDiv.appendChild(BTN_ADD_MACHINE);

let c = '';
let eventTimeOut = null;

const callback = () => {
  if (eventTimeOut === null) {
    eventTimeOut = setTimeout(() => {
      let v = parseInt(c);
      if (v < 256) {
        commander(
          `000000001111111100000110${toBinary8Bits(v)}00000000${COMMAND.r}${
            COMMAND.g
          }${COMMAND.b}${COMMAND.t}00000000`
        );
      }
      c = '';
      clearTimeout(eventTimeOut);
      eventTimeOut = null;
    }, 250);
  } else {
    clearTimeout(eventTimeOut);
    eventTimeOut = setTimeout(() => {
      let v = parseInt(c);
      if (v < 256) {
        commander(
          `000000001111111100000110${toBinary8Bits(v)}00000000${COMMAND.r}${
            COMMAND.g
          }${COMMAND.b}${COMMAND.t}00000000`
        );
      }
      c = '';
      clearTimeout(eventTimeOut);
      eventTimeOut = null;
    }, 250);
  }
};

document.addEventListener(
  'keydown',
  (e) => {
    if (
      e.target.tagName === 'BODY' &&
      parseInt(e.key, 10) > -1 &&
      parseInt(e.key, 10) < 11
    ) {
      c += e.key;
      H1.innerHTML = `COMANDO: ${c}`;
      callback();
    }
  },
  false
);
