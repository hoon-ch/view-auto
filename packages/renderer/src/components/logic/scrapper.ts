/* eslint-disable no-useless-escape */
`// 강좌 정보를 저장할 배열
let courses = [];

// 모든 강좌 정보가 저장된 행을 선택
let rows = document.querySelectorAll('.l_ing_tbl tr:not(:first-child)');

rows.forEach(row => {
    let courseInfo = {};

    // 강좌 제목 추출
    let titleAnchor = row.querySelector('.subj_mid.text_bold a');
    courseInfo.title = titleAnchor ? titleAnchor.innerText : 'N/A';

    // 전체 학습일, 최근 학습일 및 종료일 추출
    let subjBtm = row.querySelector('.subj_btm');
    if (subjBtm) {
        let text = subjBtm.innerText;
        let overallDateMatch = text.match(/전체학습일 : (\d+\.\d+\.\d+ ~ \d+\.\d+\.\d+)/);
        let recentDateMatch = text.match(/최근학습일 : (.*?)\(/);
        courseInfo.overallDate = overallDateMatch ? overallDateMatch[1] : 'N/A';
        courseInfo.recentDate = recentDateMatch ? recentDateMatch[1] : 'N/A';
    }

    // 평가 정보 추출
    let evaluationMatch = row.innerText.match(/평가 : 총 (\d+)개 \((\d+)개 응시\)/);
    if (evaluationMatch) {
        courseInfo.totalEvaluations = evaluationMatch[1];
        courseInfo.takenEvaluations = evaluationMatch[2];
    }

    courses.push(courseInfo);
});

// 결과 반환
return courses;`;
