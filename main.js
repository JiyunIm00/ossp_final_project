// 이부분은 html eventhandler를 다루는 파일입니다.
// 이동경로 관련 정보를 함수는 lib.js로 이동해주세요.
import lib from "lib.js";

function showSplitedData(splitedData) {
    let paragraph = doucument.createElement("p");
    paragraph.text = splitedData;
    document.body.append(paragaph);
}

function searchEventHandler() {
    // 입력창 관련
    let searchButton = document.querySelector("#add");
    let number;
    searchButton.addEventListener("click", async (event) => {
        // Read the text in #number-input.
        let input = document.querySelector("#number-input");
        let number = input.value;
        if (!number.length) return;
        else if (isNaN(number))
            window.alert("잘못된 형식의 입력입니다. 숫자를 입력하세요.");
        else if (number <= 51)
            window.alert(
                "개인정보보호를 위하여 교내 동선 비공개 처리되었습니다."
            );
        // Bring info and make a container to display
        else {
            if (number == 53) {
            } else if (number == 55) {
            } else {
                let findPerson = await lib.makeSynchronousRequest_FindPerson(
                    number
                );
                let splitedData = findPerson.splitedData;
                showSplitedData(splitedData);
            }
        }

        // Clear #number-input.
        input.value = "";
    });
}
