const https = require("https");
const parser = require("node-html-parser");
const navigator = require("navigator");
const userAgent = navigator.userAgent;

/*
구현해야 하는 것.
1. #번째 사람을 찾기.
 - 해당 사람의 동선이 기록된 링크를 찾기
 - 
2. 해당 사람의 동선 파악.
3. 해당 동선에 따라 지도에 선 긋기.
*/

function getLastUrl(url) {
    https.get(
        url,
        {
            headers: {
                "User-Agent": userAgent,
            },
        },
        (res) => {
            let data = "";

            res.on("data", (d) => {
                data += d;
            });
            res.on("end", () => {
                let root = parser.parse(data);
                let lastHtml = root.querySelectorAll(".page-last");
                console.log(lastHtml);
                //console.log(data);
                // 여기서 href를 return 할 예정.
            });
        }
    );
}

/* 웹페이지를 들어가보면 1번page에 75~60번 확진자, 2번page에 59~45번 확진자 이런식으로 정보가 들어있다. 여기서 target
 * 을 정해서 찾으면 그 동선을 return하는 함수이다.
 */
function findPerson(num) {
    let basicUrl =
        "https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset";
    let i = 0;
    let curUrl = basicUrl + "=" + i;
    let lastUrl = getLastUrl(curUrl); // Prediction: https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset=50
    // 각 웹페이지마다 title에서 number를 확인해서 있으면 해당 href를 반환한다.
    // 없으면 -1을 반환한다.
    do {
        i += 10;
        /*
         * if(title에 num이 있으면) {
         *  return getPath(해당 href, num);
         * }
         */
        curUrl = basicUrl + "=" + i;
    } while (curUrl !== lastUrl);
}

// #번 확진자의 대한 정보가 담긴 url으로부터 동선정보를 return하는 함수.
function getPath(url, num) {
    https.get(
        url,
        {
            headers: {
                "User-Agent": userAgent,
            },
        },
        (res) => {
            let data = "";

            res.on("data", (d) => {
                data += d;
            });
            res.on("end", () => {
                let root = parser.parse(data);
                root.querySelectorAll(".fr-view").forEach((d) => {
                    console.log(d.innerText.trim());
                });
                // 이후 이부분을 return으로 바꾸고 이를 html에 추가하는 형식이 필요.
                //console.log(data);
            });
        }
    );
}

// main.js에서 작동시킬 functions를 export하기.

//getLastUrl("https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset=0");

module.exports = {};
