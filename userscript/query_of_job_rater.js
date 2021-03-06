// ==UserScript==
// @name         优学院作业评分人查询
// @namespace    https://greasyfork.org/en/scripts/443611
// @version      0.22
// @description  谁给我的作业打了一百分？岂有此理，必须要将其揪出来！(进入到指定作业页面，将自动显示评分人的名字)
// @author       Wanten
// @copyright    2022 Wanten
// @supportURL   https://github.com/WantenMN/ulearning/issues
// @license      GNU General Public License v3.0
// @match        *://*homework.ulearning.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    const waitFor = (...selectors) => new Promise(resolve => {
        const delay = 500
        const f = () => {
            const elements = selectors.map(selector => document.querySelector(selector))
            if (elements.every(element => element != null)) {
                resolve(elements)
            } else {
                setTimeout(f, delay)
            }
        }
        f()
    })
    // scripts don't manipulate nodes
    waitFor('div.peer_host').then(()=>{
        // scripts may manipulate these nodes
        let url, marker = [], position, str, str1 = "", studentId, homeworkId, ocId, allCookies, AUTHORIZATION, homeworkDatil, user;
        marker[0] = "stuDetail/";

        //get url
        url = document.URL;
        console.log("url: " + url);

        //get studentId
        position = url.indexOf(marker[0]);
        str = url.slice(position+marker[0].length)
        console.log("str: " + str);
        position = str.indexOf("/");
        studentId = str.slice(0, position);
        console.log("studentId: " + studentId);

        //get homeworkId
        str = str.slice(position+1);
        position = str.indexOf("?VNK");
        homeworkId = str.slice(0, position);
        console.log("homeworkId: " + homeworkId);

        //get ocId
        position = url.indexOf("ocId=");
        ocId = url.slice(position + "ocId=".length);
        console.log("ocId: " + ocId);
        
        //get AUTHORIZATION
        AUTHORIZATION = "";
        allCookies = document.cookie.split(";");
        let coLength = allCookies.length;
        for(let i = 0; i < coLength; i++){
            let co = allCookies[i];
            if(co.indexOf("AUTHORIZATION") != -1){
                AUTHORIZATION = co.slice("AUTHORIZATION=".length + 1);
            }
        }
        console.log("AUTHORIZATION: " + AUTHORIZATION);

        //get peerReviewHomeworkDatil
        url = " https://homeworkapi.ulearning.cn/stuHomework/peerReviewHomeworkDatil/" + homeworkId + "/" + studentId;
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', url, true)
        xhttp.setRequestHeader("AUTHORIZATION", AUTHORIZATION);
        xhttp.onreadystatechange = function() {
            if(xhttp.readyState == 4 && xhttp.status == 200){
                homeworkDatil = xhttp.response;
                console.log(homeworkDatil)
                homeworkDatil = JSON.parse(homeworkDatil);

                let userLength = homeworkDatil.result.length;
                let peerList = document.querySelectorAll(".peer_host");
                console.log("peerList.length: " + peerList.length)
                for(let i = 0; i < userLength; i++){
                    user = homeworkDatil.result[i];
                    str = '<div style="color:black;padding-bottom:5px;font:1.4em bold;">'+user.name+'</div>';
                    peerList[i].innerHTML = str + peerList[i].innerHTML;
                    str1 += i + 1 + ": <br>"
                    for(const key in user){
                        str1 += `${key}: ${user[key]}<br>`
                    }
                    str1 += "<br><br>"
                }
                let footer = document.querySelectorAll(".peertask_other");
                footer[0].innerHTML = footer[0].innerHTML + str1;

                //get HomeworkDatil
                str1 = "";
                url = " https://homeworkapi.ulearning.cn/stuHomework/homeworkDetail/" + homeworkId + "/" + studentId + "/" + ocId;
                let xhttp1 = new XMLHttpRequest();
                xhttp1.open('GET', url, true)
                xhttp1.setRequestHeader("AUTHORIZATION", AUTHORIZATION);
                xhttp1.onreadystatechange = function() {
                    if(xhttp1.readyState == 4 && xhttp1.status == 200){
                        homeworkDatil = xhttp1.response;
                        console.log(homeworkDatil)
                        homeworkDatil = JSON.parse(homeworkDatil);

                        let userLength = homeworkDatil.result.peerReviewHomeworkList.length;
                        peerList = document.querySelectorAll(".each-peeritem");
                        console.log("peerList.length: " + peerList.length)
                        for(let i = 0; i < userLength; i++){
                            user = homeworkDatil.result.peerReviewHomeworkList[i];
                            str = '<div style="color:black;padding-bottom:5px;font:1.4em bold;">'+user.name+'</div>';
                            peerList[i].innerHTML = str + peerList[i].innerHTML;
                            str1 += i + 1 + ": <br>"
                            for(const key in user){
                                str1 += `${key}: ${user[key]}<br>`
                            }
                            str1 += "<br><br>"
                        }
                        footer = document.querySelectorAll("#pane-first");
                        footer[0].innerHTML = footer[0].innerHTML + str1;
                    }
                }
                xhttp1.send();
            }
        }
        xhttp.send();

        
    })
})();