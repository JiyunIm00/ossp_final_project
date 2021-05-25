# Project - SKKU Corona Map

## A Brief Overview

-   SKKU에서는 코로나19 확진자가 발생하면 학생들에게 메세지를 발송하고 '[코로나-19 종합안내 홈페이지](https://skb.skku.edu/haksaeng/index.do)'에 관련 정보를 업데이트 한다. 하지만 텍스트로만 공지되는 특성상 교내 확진자 동선을 단번에 파악하기 어렵다. 따라서 이를 **시각적으로 표현**하려 한다.

## Example

<img width="1049" alt="2021-05-25" src="https://user-images.githubusercontent.com/80454079/119442329-976ed580-bd62-11eb-8547-8ad804998e85.png">
![Final_Project](https://user-images.githubusercontent.com/80454079/119444378-19acc900-bd66-11eb-8b32-75a294048f46.gif)

## Installation

-   [GitHub Repo](https://github.com/JiyunIm00/ossp_final_project)(**Just click!**)
-   npm install navigator
-   npm install node-html-parser

## How to use

-   하단의 **textfield에 번호를 입력**하고 **Search button을 클릭**하면 지도에 동선이 표시된다.

## 1. API reference

-

## 2. Releases

-

## 3. Code of Conduct

-   main branch는 가능하면 건들지 않는다.
-   미완성 기능의 경우 새로운 branch를 만들고 작업한다.
-   작업이 완료되면 Merge한다.

## 4. History

1. HTML 문서 상에 지도와 텍스트창을 만든다.(구현완료)

2. main.js와 lib.js에 자동으로 crawling해서 다음과 같은 정보를 얻는다.(구현완료)

```js
var person = {
    confirmed_Num: 0, // 확진번호
    url: "", // 확진자의 동선이 담긴 url
    totalNum_In_OnePage: 0, // 한 페이지에 적힌 총 확진자 수
    Num_In_Page: 0, // 한 페이지에 적힌 확진자 중 #번째
    campus: "", // 소속 캠퍼스
    datas: [], // 확진자의 주요 정보가 담긴 전체 paragraph
    splitedData: "", // 위 datas에서 #번만 추출한 data
    path: [], // splitedData에서 장소만을 순서대로 추출한 data
};
```

3. Event handler를 통해 2에서 추출한 정보로 지도상에 방문장소를 순서대로 잇는다.(부분 구현)

-   html에서 require함수를 사용할 수 없음. import로 바꾸더라도 CORS ERROR가 발생함.(해결 X)

#### Cur: 2에서 추출된 data를 수작업으로 local상에 array로 만들어서 구현했다.

## 5. Work

-   신영환:
1. 성균관대 확진자 사이트 크롤링
2. 자료 정리와 가공

-   오민재:
1. 사이트 html 디자인 밎 아웃라인 작성
2. 크롤링 데이터 처리(사람 묶음 수, 묶음 내 순서)
3. 입력창 event handler (동선 글 표시)

-   임지윤:
1. 네이버 지도 api 확진자 경로 표시(event handler)
2. 크롤링된 데이터 가공(다녀간 장소 정리)

## 6. Future

-
