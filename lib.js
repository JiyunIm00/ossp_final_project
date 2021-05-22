const http = require("http");
const https = require("https");
const parser = require("node-html-parser");
const navigator = require("navigator");
const userAgent = navigator.userAgent;
const defaulturl = "https://skb.skku.edu/haksaeng/status.do";

// from https://usefulangle.com/post/170/nodejs-synchronous-http-request

// 마지막 페이지의 url을 반환하는 함수.
function getPromise_LastUrl() {
    return new Promise((resolve, reject) => {
        https.get(
            "https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offse",
            {
                headers: {
                    "User-Agent": userAgent,
                },
            },
            (res) => {
                let data = [];

                res.on("data", (fragments) => {
                    data.push(fragments);
                });

                res.on("end", () => {
                    let root = parser.parse(data);
                    let lastHtml = root.querySelectorAll(".page-last");

                    ret = defaulturl + lastHtml[0]._attrs.href;
                    //console.log(ret);
                    resolve(ret);
                });

                res.on("error", (error) => {
                    reject(error);
                });
            }
        );
    });
}

// async function to make http request
async function makeSynchronousRequest_LastUrl(request) {
    try {
        let http_promise = getPromise_LastUrl();
        let last_url = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return last_url;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}

// target 사람의 url을 반환하는 함수
function getPromise_FindPersonUrl(url, num) {
    return new Promise((resolve, reject) => {
        https.get(
            url,
            {
                headers: {
                    "User-Agent": userAgent,
                },
            },
            (res) => {
                let data = [];

                res.on("data", (fragments) => {
                    data.push(fragments);
                });

                res.on("end", () => {
                    let root = parser.parse(data);
                    let ret = "";
                    root.querySelectorAll(
                        "dt.board-list-content-title"
                    ).forEach((d) => {
                        if (d.innerText.indexOf(String(num)) != -1) {
                            let splitedUrl = d.childNodes[1].rawAttrs
                                .split('"')[1]
                                .replace(/amp/g, "article")
                                .replace(/;article/g, "");
                            resolve(defaulturl + splitedUrl);
                        }
                        //?mode=view&amp;articleNo=115397&amp;article.offset=0&amp;articleLimit=10"
                        //?mode=view&articleNo=115397&article.offset=0&articleLimit=10
                        //?mode=view&articleNo=115397&article.offset=0&articleLimit=10
                        ret += d.innerText.trim() + "\n";
                    });
                    //console.log(ret);
                    resolve(-1);
                });
                res.on("error", (error) => {
                    reject(error);
                });
            }
        );
    });
}

// async function to make http request
async function makeSynchronousRequest_FindPersonUrl(url, num, request) {
    try {
        let http_promise = getPromise_FindPersonUrl(url, num);
        let personUrl = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return personUrl;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}

// 특정사람의 path를 반환하는 함수
function getPromise_FindPath(url, num) {
    return new Promise((resolve, reject) => {
        https.get(
            url,
            {
                headers: {
                    "User-Agent": userAgent,
                },
            },
            (res) => {
                let data = [];

                res.on("data", (fragments) => {
                    data.push(fragments);
                });

                res.on("end", () => {
                    let root = parser.parse(data);
                    let ret = "";
                    root.querySelectorAll(".fr-view").forEach((d) => {
                        ret += d;
                    });
                    resolve(ret);
                });

                res.on("error", (error) => {
                    reject(error);
                });
            }
        );
    });
}

// async function to make http request
async function makeSynchronousRequest_FindPath(url, request) {
    try {
        let http_promise = getPromise_FindPath(url);
        let path = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return path;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}

// anonymous async function to execute some code synchronously after http request
const findPersonv = async function (num) {
    // wait to http request to finish
    const basicUrl =
        "https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset";
    let i = 0;
    let curUrl = basicUrl + "=" + i;
    let last_url = await makeSynchronousRequest_LastUrl();
    console.log(curUrl);
    let targeturl = await makeSynchronousRequest_FindPersonUrl(curUrl, num);
    if (targeturl != -1) {
        let path = await makeSynchronousRequest_FindPath(targeturl);
        // 이부분을 return으로 교체
        console.log(path);
    }

    while (curUrl !== last_url) {
        i += 10;
        curUrl = basicUrl + "=" + i;
        targeturl = await makeSynchronousRequest_FindPersonUrl(curUrl, num);
        if (targeturl != -1) {
            let path = await makeSynchronousRequest_FindPath(targeturl);
            // 이부분을 return으로 교체
            console.log(path);
        }
    }
};
findPersonv(57);

module.exports = { findPersonv };
