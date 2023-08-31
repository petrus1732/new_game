const mid = 360
const numLines = 30;
const numCircles = 13;
const bigCircleSize = 3;
let bigCircleId = 0;
const R = 350
const rUnit = R/numCircles;
const dUnit = Math.PI/numLines*2;
const bgColor = 'rgb(10,10,10)';
let filledColor = null;
let hoverColor = null;
const blockRGBA = [0, 255, 255, 0.2];
const fill = Array.from({length: numLines}, () => Array(numCircles).fill(0));
const filledList = []
let hoverPos = {d: numCircles, r: numCircles};
//canvas settings
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 2
ctx.strokeStyle = "rgb(255, 255, 255)";
// group settings
const groupNum = 10;
const rankHeight = 50;
const groupList = [];
let currentGroup = 1;
let groupsSet = false;

const groupColor = [
  {r:255,g:0,b:0},
  {r:0,g:255,b:0},
  {r:128,g:128,b:0},
  {r:255,g:255,b:0},
  {r:0,g:255,b:255},
  {r:255,g:0,b:255},
  {r:255,g:165,b:0},
  {r:128,g:0,b:128},
  {r:0,g:128,b:128},
  {r:255,g:192,b:203},
]

const clear = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const showPos = (e) => {
  rightDiv = document.getElementById('right');
  rightDiv.innerText = `x:${e.offsetX}, y:${e.offsetY}`;
}

const getGroupId = (num) => {
  // console.log(num, groupList, groupList.findIndex(group => group.number === num));
  return groupList.findIndex(group => group.number === num);
}

const fillBlock = (d, r, color) => {
  //console.log(d, r)
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(mid + r*rUnit*Math.cos((d+1)*dUnit), mid + r*rUnit*Math.sin((d+1)*dUnit));
  ctx.lineTo(mid + (r+1)*rUnit*Math.cos((d+1)*dUnit), mid + (r+1)*rUnit*Math.sin((d+1)*dUnit));
  ctx.arc(mid, mid, (r+1)*rUnit, (d+1)*dUnit, d*dUnit, true);
  ctx.lineTo(mid + r*rUnit*Math.cos(d*dUnit), mid + r*rUnit*Math.sin(d*dUnit));
  ctx.arc(mid, mid, r*rUnit, d*dUnit, (d+1)*dUnit);
  ctx.fill(); 
}

const fillBigCircle = (color) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(mid + rUnit*bigCircleSize, mid);
  ctx.arc(mid, mid, rUnit*bigCircleSize, 0, 2*Math.PI);
  ctx.fill(); 
}

const markInitBlock = (group) => {
  const d = (group.number-1)*3
  const r = numCircles-1;
  fillBlock(d, r, group.color);
  fillBlock(d, r-1, group.color);
  console.log(d, r);
  fill[d][r] = group.number;
  fill[d][r-1] = group.number;
}

const init = () => {  
  clear()
  ctx.beginPath(); 
  ctx.fillStyle = bgColor;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(255,255,255)';
  for (let i = 0; i < numLines; i++) {
    ctx.moveTo(mid + bigCircleSize*rUnit*Math.cos(Math.PI/numLines*2*i), mid + bigCircleSize*rUnit*Math.sin(dUnit*i));
    ctx.lineTo(mid + R*Math.cos(Math.PI/numLines*2*i), mid + R*Math.sin(dUnit*i));
  }
  for (let i = bigCircleSize; i <= numCircles; i++) {
    ctx.moveTo(mid + rUnit*i, mid);
    ctx.arc(mid, mid, rUnit*i, 0, 2*Math.PI);
  }

  ctx.stroke();
  groupList.forEach(group => {
    markInitBlock(group);
  });

  fill.forEach((_, d) => _.forEach((x, r) => {
    if (x !== 0) {
      fillBlock(d, r, groupList[getGroupId(fill[d][r])].color);
    }
  }))
  bigCircleId = localStorage.getItem('bigCircleId');
  if (bigCircleId && bigCircleId !== '0'){
    bigCircleId = Number(bigCircleId);
    console.log(bigCircleId);
    fillBigCircle(groupList[getGroupId(bigCircleId)].color);
  } else {
    localStorage.setItem('bigCircleId', 0);
    bigCircleId = 0;
  }
}

const getPos = (e) => {
  const x = e.offsetX - mid;
  const y = e.offsetY - mid;
  const d = (Math.floor(Math.atan(y/x)/dUnit) + (x<0? numLines/2 : y>0?  0: numLines)) % numLines;
  const r = Math.floor(Math.sqrt(x*x + y*y)/rUnit);
  return [d, r];
}

const onClick = (e) => {
  if (!filledColor) return;
  let [d, r] = getPos(e);
  if (d % 3 === 0 && (r === numCircles - 1 ||  r === numCircles - 2)) return;
  if (r < numCircles) {
    if (r < bigCircleSize) {
      if (bigCircleId === 0) {
        const idx = getGroupId(currentGroup);
        fillBigCircle(filledColor);
        groupList[idx].score += 2;
        bigCircleId = groupList[idx].number;
        localStorage.setItem(`bigCircleId`, groupList[idx].number);
        changeRank();
      } else {
        groupList[getGroupId(bigCircleId)].score -= 2
        localStorage.removeItem(`bigCircleId`);
        bigCircleId = 0;
        init();
        changeRank()
      }
    } else if (fill[d][r] === 0) {
      const idx = getGroupId(currentGroup);
      fill[d][r] = currentGroup;
      fillBlock(d, r, filledColor);
      groupList[idx].score += 1
      localStorage.setItem(`${d}_${r}`, groupList[idx].number);
      //console.log(`store:${groupList[idx].number}`);
      changeRank();
    }
    else {
      groupList[getGroupId(fill[d][r])].score -= 1
      localStorage.removeItem(`${d}_${r}`);
      fill[d][r] = 0;
      init();
      changeRank()
    }
  }
}

const onMouseMove = (e) => {
  if (!filledColor) return;
  let [d, r] = getPos(e);
  if (r >= numCircles) r = numCircles + 1
  //console.log(hoverPos.r, bigCircleSize)
  //console.log(d, r)
  if (r < bigCircleSize) {
    if (hoverPos.r >= bigCircleSize) {
      init();
      fillBigCircle(hoverColor);
    }
    hoverPos = {d:0, r:bigCircleSize-1};
  }else if (d !== hoverPos.d || r!== hoverPos.r) {
    if (hoverPos.r < numCircles && fill[hoverPos.d][hoverPos.r] === 0) init();
    hoverPos = {d, r};
    if (hoverPos.r < numCircles && fill[d][r] === 0 && (d % 3 !== 0 || r === numCircles - 1 &&  r === numCircles - 2)) fillBlock(d, r, hoverColor);
  }
}

const changeRank = () => {
  groupList.sort((a,b) => b.score - a.score);
  for (let i = 0; i < groupList.length; i++) {
      document.getElementById("group" + groupList[i].number).style.top = i*rankHeight + 'px';
      document.querySelector(`#group${groupList[i].number} .score`).innerText = groupList[i].score;
      localStorage.setItem("score" + groupList[i].number, groupList[i].score);
  }
}

const changeCurrentGroup = (n) => {
  idx = getGroupId(n);
  currentGroup = n;
  filledColor = groupList[idx].color;
  hoverColor = groupList[idx].hoverColor;
}

const generateGroups = () => {

  for (let i = 1; i <= groupNum; i++) {
      let group, r, g, b;
      if (localStorage.getItem("groupSet") === "true"){
          group = {
              number: i,
              color: localStorage.getItem("color"+i),
              darkenColor: localStorage.getItem("darkenColor"+i),
              hoverColor: localStorage.getItem("hoverColor"+i),
              score: Number(localStorage.getItem("score"+i)) 
          }
      }
      else{
          r = groupColor[i-1].r
          g = groupColor[i-1].g
          b = groupColor[i-1].b
         
          group = {
              number: i,
              color: `rgb(${r},${g},${b})`,
              darkenColor: `rgb(${r*0.9},${g*0.9},${b*0.9})`,
              hoverColor: `rgba(${r},${g},${b},0.2)`,
              score: 2
          };
          localStorage.setItem("color"+i, group.color);
          localStorage.setItem("darkenColor"+i, group.darkenColor);
          localStorage.setItem("hoverColor"+i, group.hoverColor);
          localStorage.setItem("score"+i, group.score);
      }
      groupList.push(group);
      //generate rank board
      let groupRank = document.createElement("div");
      groupRank.className = "group-rank";
      groupRank.id = "group" + i;
      groupRank.style.top = rankHeight*(i-1) + "px";
      let numIcon = document.createElement("div");
      numIcon.className = "num";
      numIcon.style.backgroundColor = group.color;
      numIcon.innerText = i;
      numIcon.addEventListener('click', () => changeCurrentGroup(i));
      let score = document.createElement("div");
      score.className = "score";
      score.style.backgroundColor = group.darkenColor;
      score.innerText = group.score;
      groupRank.append(numIcon, score);
      document.getElementById("group-rank-container").append(groupRank);
  }
  if (localStorage.getItem("groupSet") === "true"){
    changeRank();
    fill.forEach((_, d) => _.forEach((x, r) => {
      if (localStorage.getItem(`${d}_${r}`)) {
        fill[d][r] = Number(localStorage.getItem(`${d}_${r}`));
      }
    }))
  }
  else{
    localStorage.setItem("groupSet", "true");
  }
}

generateGroups();
init();