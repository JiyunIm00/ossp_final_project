// 이부분은 html eventhandler를 다루는 파일입니다.
// 이동경로 관련 정보를 함수는 lib.js로 이동해주세요.
const lib = require("./lib.js");

async function main(){
    var person = await lib.makeSynchronousRequest_FindPerson(66);
    console.log(person.path);
}

