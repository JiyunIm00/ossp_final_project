const http = require("http");
const https = require("https");
const parser = require("node-html-parser");
const navigator = require("navigator");
const userAgent = navigator.userAgent;
const defaulturl = "https://skb.skku.edu/haksaeng/status.do";

// async 구현은 <https://usefulangle.com/post/170/nodejs-synchronous-http-request>를 참고 하였습니다.

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
                    let lastHtml = parser
                        .parse(data)
                        .querySelectorAll(".page-last");

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

// 마지막 페이지의 url을 반환하는 async 함수.
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

// target person의 url을 반환하는 함수
function getPromise_FindPersonUrl(url, targetNum) {
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
                        let splitedStr = d.innerText
                            .trim()
                            .replace(/(\r\n\t|\n|\r\t)/gm, "")
                            .split("~");
                        // 한 페이지에 1명의 정보만 담긴 케이스
                        if (splitedStr.length == 1) {
                            if (d.innerText.indexOf(String(targetNum)) != -1) {
                                let splitedUrl = d.childNodes[1].rawAttrs
                                    .split('"')[1]
                                    .replace(/amp/g, "article")
                                    .replace(/;article/g, "");
                                resolve(defaulturl + splitedUrl);
                            }
                        } else {
                            // 한 페이지에 2명 이상의 정보가 담긴 케이스
                            let num1 = parseInt(
                                splitedStr[0].substring(
                                    splitedStr[0].indexOf(" ") + 1,
                                    splitedStr[0].length
                                )
                            );
                            let num2 = parseInt(
                                splitedStr[1].substring(
                                    0,
                                    splitedStr[1].indexOf("번")
                                )
                            );
                            //console.log(num1 + " " + num2);
                            for (let num = num1; num <= num2; num++) {
                                if (num == targetNum) {
                                    let splitedUrl = d.childNodes[1].rawAttrs
                                        .split('"')[1]
                                        .replace(/amp/g, "article")
                                        .replace(/;article/g, "");
                                    resolve(defaulturl + splitedUrl);
                                }
                            }
                        }
                    });
                    // 만약 없을 경우.
                    resolve(-1);
                });
                res.on("error", (error) => {
                    reject(error);
                });
            }
        );
    });
}

// target person의 url을 반환하는 async 함수
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
function getPromise_FindPath(url) {
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
                    let ret = [];
                    let innerHtml = parser
                        .parse(data)
                        .querySelector(".fr-view");
                    parser
                        .parse(innerHtml)
                        .querySelectorAll("p")
                        .forEach((d) => {
                            //console.log(d.innerText);
                            if (d.innerText !== "") ret.push(d.innerText);
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

// 특정사람의 path를 반환하는 async 함수
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

// 위에 작성된 함수들을 통합적으로 사용해 사람의 path를 구하는 함수
async function getPromise_FindPerson(num) {
    return new Promise(async (resolve, reject) => {
        // wait to http request to finish
        const basicUrl =
            "https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset";
        let i = 0;
        let curUrl = basicUrl + "=" + i;
        let last_url = await makeSynchronousRequest_LastUrl();
        // console.log(curUrl);
        let targeturl = await makeSynchronousRequest_FindPersonUrl(curUrl, num);
        if (targeturl !== -1) {
            let path = await makeSynchronousRequest_FindPath(targeturl);
            // console.log(path);
            resolve(path);
        }

        while (curUrl !== last_url) {
            i += 10;
            curUrl = basicUrl + "=" + i;
            targeturl = await makeSynchronousRequest_FindPersonUrl(curUrl, num);
            if (targeturl !== -1) {
                let path = await makeSynchronousRequest_FindPath(targeturl);
                //console.log(path);
                resolve(path);
            }
        }

        // 만약 target person이 없을 경우.
        //
        if (targeturl === -1) reject();
    });
}
async function makeSynchronousRequest_FindPerson(num, request) {
    try {
        let http_promise = getPromise_FindPerson(num);
        let path = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return path;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}


// target 사람이 포함된 포스트 내에 게시된 총 확진자의 수*/를 반환하는 함수
function getPromise_FindTotalNumInPost(url, targetNum) {
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
                        let splitedStr = d.innerText
                            .trim()
                            .replace(/(\r\n\t|\n|\r\t)/gm, "")
                            .split("~");

                        if (splitedStr.length === 1) {
                            if (d.innerText.indexOf(String(targetNum)) !== -1) {
                                resolve(1);
                            }
                        } else {
                            let num1 = parseInt(
                                splitedStr[0].substring(
                                    splitedStr[0].indexOf(" ") + 1,
                                    splitedStr[0].length
                                )
                            );
                            let num2 = parseInt(
                                splitedStr[1].substring(
                                    0,
                                    splitedStr[1].indexOf("번")
                                )
                            );
                            //console.log(num1 + " " + num2);
                            for (let num = num1; num <= num2; num++) {
                                if (num === targetNum) {
                                    /* target 사람이 포함된 포스트 내에 게시된 총 확진자의 수*/
                                    let totalNumInPost = (num2 - num1) + 1;
                                    //console.log(totalNumInPost) 
                                    resolve(totalNumInPost);
                                }
                            }
                        }
                    });
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
async function makeSynchronousRequest_FindTotalNumInPost(url, num) {
    try {
        let http_promise = getPromise_FindTotalNumInPost(url, num);
        let totalNumInPost = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return totalNumInPost;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}

// async function to make http request
const findTotalNumInPost = async function(num) {
    const basicUrl =
        "https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset";
    let i = 0;
    let curUrl = basicUrl + "=" + i;
    let last_url = await makeSynchronousRequest_LastUrl();

    let totalNumInPost = await makeSynchronousRequest_FindTotalNumInPost(curUrl, num);
    if(totalNumInPost !== -1) {
        //이 부분을 return으로 대체
        console.log(totalNumInPost);
    }

    while(curUrl !== last_url) {
        i += 10;
        curUrl = basicUrl + "=" + i;
        totalNumInPost = await makeSynchronousRequest_FindTotalNumInPost(curUrl, num);
        if(totalNumInPost !== -1) {
            //이 부분을 return으로 대체
            console.log(totalNumInPost);
        }
    }
}

// 포스트 내 target 사람의 순서
function getPromise_FindTargetSequence(url, targetNum) {
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
                        let splitedStr = d.innerText
                            .trim()
                            .replace(/(\r\n\t|\n|\r\t)/gm, "")
                            .split("~");

                        if (splitedStr.length === 1) {
                            if (d.innerText.indexOf(String(targetNum)) !== -1) {
                                resolve(1);
                            }
                        } else {
                            let num1 = parseInt(
                                splitedStr[0].substring(
                                    splitedStr[0].indexOf(" ") + 1,
                                    splitedStr[0].length
                                )
                            );
                            let num2 = parseInt(
                                splitedStr[1].substring(
                                    0,
                                    splitedStr[1].indexOf("번")
                                )
                            );
                            //console.log(num1 + " " + num2);
                            for (let num = num1; num <= num2; num++) {
                                if (num === targetNum) {
                                    /* target 사람이 포함된 Post에 게시된 총 확진자의 수 */
                                    let targetSequence = (num - num1) + 1;
                                    //console.log(targetSequence) 
                                    resolve(targetSequence);
                                }
                            }
                        }
                    });
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
async function makeSynchronousRequest_FindTargetSequence(url, num) {
    try {
        let http_promise = getPromise_FindTargetSequence(url, num);
        let targetSequence = await http_promise;

        // holds response from server that is passed when Promise is resolved
        return targetSequence;
    } catch (error) {
        // Promise rejected
        console.log(error);
    }
}

// async function to make http request
const findTargetSequence = async function(num) {
    const basicUrl =
        "https://skb.skku.edu/haksaeng/status.do?mode=list&&articleLimit=10&article.offset";
    let i = 0;
    let curUrl = basicUrl + "=" + i;
    let last_url = await makeSynchronousRequest_LastUrl();

    let targetSequence = await makeSynchronousRequest_FindTargetSequence(curUrl, num);
    if(targetSequence !== -1) {
        //이 부분을 return으로 대체
        //return targetSequence;
        console.log(targetSequence);
    }

    while(curUrl !== last_url) {
        i += 10;
        curUrl = basicUrl + "=" + i;
        targetSequence = await makeSynchronousRequest_FindTargetSequence(curUrl, num);
        if(targetSequence !== -1) {
            //이 부분을 return으로 대체
            // return targetSequence;
            console.log(targetSequence);
        }
    }
}


findPersonv(69);
findTotalNumInPost(69);
findTargetSequence(69);
module.exports = { findPersonv , findTotalNumInPost, findTargetSequence};

// main function for debugging
async function main() {
    /*
    let txt = [];
    for (let i = 53; i <= 75; i++) {
        txt.push(await makeSynchronousRequest_FindPerson(i));
        //console.log(await makeSynchronousRequest_FindPerson(i));
    }*/
    console.log(await makeSynchronousRequest_FindPerson(75));
}

main();
module.exports = { makeSynchronousRequest_FindPerson };

