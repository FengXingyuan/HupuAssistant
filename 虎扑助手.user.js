// ==UserScript==
// @name         虎扑助手
// @namespace    http://tampermonkey.net/
// @version      0.3.1
// @description  在浏览虎扑时可一键查看所有图片和视频
// @author       landswimmer
// @match        https://bbs.hupu.com/*.html
// @connect      hupu.com
// @grant        GM_xmlhttpRequest
// @license      GPLv3
// ==/UserScript==

(function () {
    'use strict';
    //第一部分，布局相关
        let picModeBtn = document.createElement("div");
        picModeBtn.innerHTML = "看图";
        picModeBtn.style.display = "flex";
        picModeBtn.style.justifyContent = "center";
        picModeBtn.style.alignItems = "center";
        picModeBtn.style.position = "fixed";
        picModeBtn.style.right = "2%";
        picModeBtn.style.bottom = "50px";
        picModeBtn.style.width = "48px";
        picModeBtn.style.height = "48px";
        picModeBtn.style.border = "1px solid #999999";
        picModeBtn.style.borderRadius = "3px";
        picModeBtn.style.cursor = "pointer";

        let picModeDiv = document.createElement("div");
        picModeDiv.style.position = "fixed";
        picModeDiv.style.display = "flex";
        picModeDiv.style.justifyContent = "center";
        picModeDiv.style.alignItems = "center";
        picModeDiv.style.top = "0"
        picModeDiv.style.zIndex = "999"
        picModeDiv.style.visibility = "hidden";
        picModeDiv.style.width = "100vw";
        picModeDiv.style.height = "100vh";
        picModeDiv.style.backgroundColor = "#222222";

        let placeHolder = document.createElement("div");
        placeHolder.innerHTML = "本帖没有图片哦";
        placeHolder.style.display = "none";
        placeHolder.style.color = "white";

        let pic = document.createElement("img");
        pic.style.display = "none";
        pic.style.maxWidth = "80vw";
        pic.style.maxHeight = "90vh";
        pic.style.cursor = "zoom-in";

        let mp4 = document.createElement("video");
        mp4.controls = "true";
        mp4.style.display = "none";
        mp4.style.maxHeight = "90vh";
        mp4.style.maxWidth = "80vw";  

    //第二部分，逻辑相关
    let imgList = [];
    let i = 0;
    let pageIndex = 1;
    let re = /src='.*?'/g;
    let baseUrl = 'https://m.hupu.com/api/v1/bbs-thread-frontend/' + window.location.href.substr(21, window.location.href.length - 26) + '?page=';
    //提取帖子id

    function dataHandler(eachReply) {
        let reResult = eachReply.content.match(re);
        //console.log(reResult);
        if (reResult) {
            reResult.forEach(rawSrc => {
                if(rawSrc.match(/\.mp4/)){
                    imgList.push(rawSrc.substr(5, rawSrc.length - 6).replace(/\\/g, ""));
                }else{
                    imgList.push(rawSrc.match(/src='.*?\?/g)[0].substr(5, rawSrc.length - 6).replace(/\\/g, ""));
                }
            });
        }
    }

    let details = {
        method: "GET",
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
        },
        onload: (e) => {
            let responseData = JSON.parse(e.response).data;
            if (pageIndex === 1) {
                dataHandler(responseData.t_detail);
                responseData.lr_list.forEach(dataHandler);
            }
            responseData.r_list.forEach(dataHandler);
            if (++pageIndex <= responseData.r_total_page) {
                sendRequest();
            }
        }
    }
    function sendRequest() {
        details.url = baseUrl + pageIndex;
        GM_xmlhttpRequest(details);
    }
    sendRequest();

    //请求第一页数据
    //处理第一页数据
    //读取所有的content,并用正则表达式匹配当中的图片链接
    //去除链接当中的反斜杠
    //将链接放入数组当中
    //读取总页数
    //如果有多页，循环请求处理剩余页面

    function keyDownHandler(e) {
        if (picModeDiv.style.visibility === "visible") {
            if (e.keyCode === 39) {
                if (i < imgList.length - 1) {
                    i++;
                    if(imgList[i].match(/\.mp4/)){
                        mp4.src = imgList[i];
                        pic.style.display = "none";
                        mp4.style.display = "initial";                      
                    }else{
                        pic.src = imgList[i];
                        mp4.style.display = "none";
                        pic.style.display = "initial";                       
                    }
                }
            }
            if (e.keyCode === 37) {
                if (i > 0) {
                    i--;
                    if(imgList[i].match(/\.mp4/)){
                        mp4.src = imgList[i];
                        mp4.style.display = "initial";
                        pic.style.display = "none";
                    }else{
                        pic.src = imgList[i];
                        pic.style.display = "initial";
                        mp4.style.display = "none";
                    }
                }
            }
            if (e.keyCode === 27) {
                if (imgList.length) {
                    i = 0;
                    pic.src = imgList[i];
                }
                picModeDiv.style.visibility = "hidden";
            }
        }
    }

    document.onkeydown = keyDownHandler;

    picModeBtn.onclick = function () {
        imgList = [...new Set(imgList)];//抄袭代码
        if (imgList.length) {
            if(imgList[i].match(/\.mp4/)){
                mp4.src = imgList[i];
                mp4.style.display = "initial";
            }else{
                pic.src = imgList[i];
                pic.style.display = "initial";
            }           
        } else {
            placeHolder.style.display = "initial";
        }
        picModeDiv.style.visibility = "visible";
    }

    let bodyNode = document.body;
    let fragment = document.createDocumentFragment();
    picModeDiv.appendChild(pic);
    picModeDiv.appendChild(placeHolder);
    picModeDiv.appendChild(mp4);
    fragment.appendChild(picModeBtn);
    fragment.appendChild(picModeDiv);
    bodyNode.appendChild(fragment);
})();