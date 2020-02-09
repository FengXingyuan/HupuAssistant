
//第一部分，网络请求，异步处理先进行以改善性能表现
let imgList = [];
let imgBuffer = [];
let pageIndex = 1;
let baseUrl = 'https://m.hupu.com/api/v1/bbs-thread-frontend/' + window.location.href.match(/http.*html/g)[0].substr(23, window.location.href.match(/http.*html/g)[0].length - 28) + '?page=';//提取帖子id

function dataHandler(eachReply) {
    let reResult = eachReply.content.match(/src='.*?'/g);
    if (reResult) {
        reResult.forEach(rawSrc => {
            if (rawSrc.match(/\.mp4/g)) {
                imgList.push(rawSrc.substr(5, rawSrc.length - 6).replace(/\\/g, ""));
            } else if (rawSrc.match(/\?/g)) {
                imgList.push(rawSrc.match(/src=.*?\?/g)[0].replace(/\\/g, "").substr(5, rawSrc.length - 7));
                let bufferNode = new Image();
                bufferNode.src = rawSrc.match(/src=.*?\?/g)[0].replace(/\\/g, "").substr(5, rawSrc.length - 7);
                imgBuffer.push(bufferNode);
            }
        });
    }
}

let xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let responseData = JSON.parse(xhr.response).data;
        if (pageIndex === 1) {
            dataHandler(responseData.t_detail);
        }
        responseData.r_list.forEach(dataHandler);
        if (++pageIndex <= responseData.r_total_page) {
            sendRequest();
        }
    }
}
function sendRequest() {
    let url = baseUrl + pageIndex;
    xhr.open("GET", url);
    xhr.send();
}
sendRequest();

//第二部分，布局相关
let picModeDiv = document.createElement("div");
picModeDiv.id = "insertDiv";
picModeDiv.style.position = "fixed";
picModeDiv.style.display = "flex";
picModeDiv.style.justifyContent = "center";
picModeDiv.style.alignItems = "center";
picModeDiv.style.top = "0"
picModeDiv.style.zIndex = "1000"
picModeDiv.style.width = "100vw";
picModeDiv.style.height = window.innerHeight + "px";
picModeDiv.style.backgroundColor = "#222222";

let placeHolder = document.createElement("div");
placeHolder.innerHTML = "本帖没有图片哦";
placeHolder.style.display = "none";
placeHolder.style.color = "white";

let pic = document.createElement("img");
pic.style.display = "none";
pic.style.maxWidth = "100%";
pic.style.maxHeight = "100%";

let mp4 = document.createElement("video");
mp4.controls = "true";
mp4.style.display = "none";
mp4.style.maxHeight = "100%";
mp4.style.maxWidth = "100%";

let touchPadLeft = document.createElement("div");
touchPadLeft.style.position = "fixed";
touchPadLeft.style.visibility = "hidden";
touchPadLeft.style.top = window.innerHeight / 2 - 25 + "px";
touchPadLeft.style.left = "20px";
touchPadLeft.style.height = "50px";
touchPadLeft.style.width = "50px";
touchPadLeft.style.borderWidth = "25px";
touchPadLeft.style.borderStyle = "solid";
touchPadLeft.style.borderTopColor = "transparent";
touchPadLeft.style.borderRightColor = "rgba(128,128,128,0.8)";
touchPadLeft.style.borderBottomColor = "transparent";
touchPadLeft.style.borderLeftColor = "transparent";
touchPadLeft.style.mixBlendMode = "difference";

let touchPadRight = document.createElement("div");
touchPadRight.style.position = "fixed";
touchPadRight.style.visibility = "hidden";
touchPadRight.style.top = window.innerHeight / 2 - 25 + "px";
touchPadRight.style.right = "20px";
touchPadRight.style.height = "50px";
touchPadRight.style.width = "50px";
touchPadRight.style.borderWidth = "25px";
touchPadRight.style.borderStyle = "solid";
touchPadRight.style.borderTopColor = "transparent";
touchPadRight.style.borderRightColor = "transparent";
touchPadRight.style.borderBottomColor = "transparent";
touchPadRight.style.borderLeftColor = "rgba(128,128,128,0.8)";
touchPadRight.style.mixBlendMode = "difference";

let closeBtn = document.createElement("div");
closeBtn.innerHTML = "X";
closeBtn.style.position = "fixed";
closeBtn.style.right = "30px";
closeBtn.style.top = "20px";
closeBtn.style.color = "rgba(128,128,128,0.8)";
closeBtn.style.mixBlendMode = "difference";
closeBtn.style.fontSize = "30px";

let fragment = document.createDocumentFragment();
let rawFragment = document.createDocumentFragment();
rawFragment.appendChild(document.getElementById("__next"));
picModeDiv.appendChild(pic);
picModeDiv.appendChild(placeHolder);
picModeDiv.appendChild(mp4);
picModeDiv.appendChild(touchPadLeft);
picModeDiv.appendChild(touchPadRight);
picModeDiv.appendChild(closeBtn);
fragment.appendChild(picModeDiv);

//第三部分，交互控制相关
let i = 0;
function imgSwitch() {
    if (imgList[i].match(/\.mp4/)) {
        mp4.src = imgList[i];
        mp4.style.display = "initial";
        pic.style.display = "none";
    } else {
        pic.src = imgList[i];
        pic.style.display = "initial";
        mp4.style.display = "none";
    }
    if (i == 0) {
        touchPadLeft.style.visibility = "hidden";
    } else {
        touchPadLeft.style.visibility = "visible";
    }
    if (i == imgList.length - 1) {
        touchPadRight.style.visibility = "hidden";
    } else {
        touchPadRight.style.visibility = "visible";
    }
}
touchPadLeft.onclick = () => {
    if (i > 0) {
        i--;
        imgSwitch();
    }
}
touchPadRight.onclick = () => {
    if (i < imgList.length - 1) {
        i++;
        imgSwitch();
    }
}
closeBtn.onclick = () => {
    imgBuffer = null;
    document.body.removeChild(document.getElementById("insertDiv"));
    document.body.appendChild(rawFragment);
}

//第四部分，载入
setTimeout(() => {
    if (imgList.length) {
        imgSwitch();
    } else {
        placeHolder.style.display = "initial";
    }
    document.body.appendChild(fragment);
}, 2000);

completion();