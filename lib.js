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
                var targetSequence = {
                    totalNum_In_OnePage: 0,
                    Num_In_Page: 0,
                };
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
                                targetSequence.Num_In_Page = 1;
                                targetSequence.totalNum_In_OnePage = 1;
                                resolve(targetSequence);
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
                                    targetSequence.totalNum_In_OnePage =
                                        num2 - num1 + 1;
                                    targetSequence.Num_In_Page = num - num1 + 1;
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
        var person = {
            url: "",
            confirmed_Num: 0,
            totalNum_In_OnePage: 0,
            Num_In_Page: 0,
            campus: "",
            datas: [],
            path: [],
        };
        person.confirmed_Num = num;
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
            person.url = targeturl;
            person.datas = path;
            let targetSequence =
                await makeSynchronousRequest_FindTargetSequence(curUrl, num);
            //console.log(targetSequence);
            person.Num_In_Page = targetSequence.Num_In_Page;
            person.totalNum_In_OnePage = targetSequence.totalNum_In_OnePage;
            // console.log(path);
            var tmp = personInfo(
                person.confirmed_Num,
                person.totalNum_In_OnePage,
                person.Num_In_Page,
                person.datas
            );
            person.campus = tmp.campus;
            person.path = tmp.path;
            resolve(person);
        }

        while (curUrl !== last_url) {
            i += 10;
            curUrl = basicUrl + "=" + i;
            targeturl = await makeSynchronousRequest_FindPersonUrl(curUrl, num);
            if (targeturl !== -1) {
                let path = await makeSynchronousRequest_FindPath(targeturl);
                person.url = targeturl;
                person.datas = path;
                let targetSequence =
                    await makeSynchronousRequest_FindTargetSequence(
                        curUrl,
                        num
                    );
                //console.log(targetSequence);
                person.Num_In_Page = targetSequence.Num_In_Page;
                person.totalNum_In_OnePage = targetSequence.totalNum_In_OnePage;
                //console.log(path);
                var tmp = personInfo(
                    person.confirmed_Num,
                    person.totalNum_In_OnePage,
                    person.Num_In_Page,
                    person.datas
                );
                person.campus = tmp.campus;
                person.path = tmp.path;

                resolve(person);
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

// main function for debugging
async function main() {
    let txt = [];
    for (let i = 52; i <= 76; i++) {
        txt.push(await makeSynchronousRequest_FindPerson(i));
        //console.log(await makeSynchronousRequest_FindPerson(i));
    }
    console.log(txt);
    //await makeSynchronousRequest_FindPerson(52);
}

main();
module.exports = { makeSynchronousRequest_FindPerson };

function personInfo(num, total, order, crudeInfo) {
    // struct로 바꿔도 됨
    // 0-확진자 번호, 1-인사0/자과1, 2-날짜, 3-동선, 4-다녀간 장소 배열
    var person = {
        campus: "",
        path: [],
    };
    let info = [num, 0, 0, 0, []];
    let n = crudeInfo.length;

    for (let i = 0; i < n; i++) {
        if (crudeInfo[i].indexOf("인사캠") !== -1) {
            info[1] = "인사캠";
            break;
        } else if (crudeInfo[i].indexOf("자과캠") !== -1) {
            info[1] = "자과캠";
            break;
        }

        // 혼합인 경우
    }

    info[2] = crudeInfo[0].substring(0, 6); // 게시물마다 양식이 다름... .match로 고쳐보기

    // 동선 없는 경우
    for (let i = 0; i < n; i++) {
        if (crudeInfo[i].indexOf("교내 동선은 없습니다.") !== -1) {
            info[3] = "교내 동선은 없습니다.";
            //console.log(info);
            person.campus = info[1];
            person.path = info[4];
            return person;
        }
    }

    // 동선 있는 경우
    if (total === 1) {
        let data = "";
        for (let i = 0; i < n; i++) {
            if (crudeInfo[i].indexOf("확진학생의 적극적인 협조로") !== -1) {
                i++;
                while (crudeInfo[i].indexOf("※") === -1) {
                    data += crudeInfo[i];
                    i++;
                }
                break;
            }
        }
        info[3] = data;
        info[4] = getPlaces(data);
    } else {
        let order_alphabet = ["A", "B", "C", "D"];
        let alphabet = order_alphabet[order - 1];
        let i;

        for (i = 0; i < n; i++) {
            if (crudeInfo[i].indexOf(alphabet) !== -1) {
                break;
            }
        }
        let data = "";
        i++;
        for (i; i < n; i++) {
            if (
                crudeInfo[i].indexOf("※") !== -1 ||
                crudeInfo[i].indexOf(order_alphabet[order]) !== -1
            )
                break;
            data += crudeInfo[i];
        }

        info[3] = data;
        info[4] = getPlaces(data);
    }
    //console.log(info);
    person.campus = info[1];
    person.path = info[4];
    return person;
}

let placeNames = [
    [
        "600주년기념관",
        "법학관",
        "교수회관",
        "호암관",
        "중앙학술정보관",
        "학생회관",
        "국제관",
        "양현관",
        "퇴계인문관",
        "다산경제관",
        "경영관",
        "수선관",
        "수선관(별관)",
        "킹고(K)하우스",
        "인터네셔널(I)하우스",
        "금잔디광장",
        "대운동장",
    ],
    [
        "학생회관",
        "복지회관",
        "수성관",
        "유틸리티센터",
        "환경플랜트",
        "건축관리실",
        "공학실습동A",
        "제1공학관21동",
        "제1공학관22동",
        "제1공학관23동",
        "공학실습동B(24)",
        "제2공학관25동",
        "제2공학관26동",
        "제2공학관27동",
        "공학실습동C(28)",
        "건축환경실험실",
        "제1과학관31동",
        "제2과학관32동",
        "화학관",
        "반도체관",
        "삼성학술정보관",
        "운용재",
        "기초학문관51동",
        "약학관",
        "생명공학관61동",
        "생명공학관62동",
        "생명공학실습동",
        "대강당",
        "의학관",
        "체육관",
        "제1종합연구동",
        "제2종합연구동",
        "제약기술관",
        "산학협력센터",
        "N센터",
        "학군단",
        "기숙사인관",
        "기숙사의관",
        "기숙사예관",
        "기숙사지관",
        "게스트하우스",
        "기숙사신관",
    ],
];

function getPlaces(dataString) {
    let visited = [];
    let n = placeNames[0].length;
    let m = placeNames[1].length;
    for (let i = 0; i < n; i++) {
        if (
            dataString.indexOf(placeNames[0][i]) !== -1 &&
            !visited.includes(placeNames[0][i])
        ) {
            visited.push(placeNames[0][i]);
        }
    }
    for (let i = 0; i < m; i++) {
        if (
            dataString.indexOf(placeNames[1][i]) !== -1 &&
            !visited.includes(placeNames[1][i])
        ) {
            visited.push(placeNames[1][i]);
        }
    }
    return visited;
}
