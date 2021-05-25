// 이부분은 html eventhandler를 다루는 파일입니다.
// 이동경로 관련 정보를 함수는 lib.js로 이동해주세요.
/* lib.js에 존재하는 makeSynchronousRequest_FindPerson(confired_number) function을 이용하면
 * 다음과 같은 정보를 얻어낼 수 있습니다.
 * var person = {
 *    confirmed_Num: 0, // 확진번호
 *    url: "", // 확진자의 동선이 담긴 url
 *    totalNum_In_OnePage: 0, // 한 페이지에 적힌 총 확진자 수
 *    Num_In_Page: 0, // 한 페이지에 적힌 확진자 중 #번째
 *    campus: "", // 소속 캠퍼스
 *    datas: [], // 확진자의 주요 정보가 담긴 전체 paragraph
 *    splitedData: "", // 위 datas에서 #번만 추출한 data
 *    path: [], // splitedData에서 장소만을 순서대로 추출한 data
 * };
 */
// version 1.*.*기준 CORS문제로 사용되지 않습니다.
const lib = require("./lib.js");

async function main() {
    var person = await lib.makeSynchronousRequest_FindPerson(66);
    person.path.forEach((element) => {
        console.log(element);
    });
}
