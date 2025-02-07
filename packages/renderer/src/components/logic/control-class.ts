import { view } from "#preload";
import { customAlphabet } from "nanoid";
import type { Lecture } from "@/lib/store";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 10);

export const parseLectures = (channel: string) => {
  const vars = {
    progress: nanoid(),
    rows: nanoid(),
    lectures: nanoid(),
  };
  view.injectJS(
    channel,
    `
    const ${vars.progress} = document.querySelectorAll(".mc_dft_tbl2.class_con_tbl2 tbody tr")[1].querySelector('.ingdonut').querySelector('span .text_bold').innerText;
    const ${vars.rows} = document.querySelectorAll(".mc_dft_tbl tbody tr:not(.test_tr)");

    const ${vars.lectures} = Array.from(${vars.rows}).map(row => {
        const cells = row.querySelectorAll("td");

        const idx = parseInt(cells[0].innerText.trim(), 10);
        const title = cells[1].innerText.trim();
        const progressText = cells[2].innerText.trim();
        const progress = parseInt(progressText.slice(0, -1), 10);
        const learningTime = cells[3].innerText;
        const recent = cells[4].innerText.trim() || "없음";
        const link = cells[5].querySelector("a").onclick.toString().match(/preview3\\([^)]+\\)/)[0];
        const [learnedMinutes, totalMinutes] = learningTime.split('/').map(time => parseInt(time.trim()));

        let status;
        if (progress === 0) {
          status = "pending";
        } else if (progress === 100) {
            if(learnedMinutes >= totalMinutes) status = "done";
            else status = "processing";
        } else {
          status = "processing";
        }

        return {
          idx,
          title,
          progress,
          learningTime,
          recent,
          status,
          link,
        };
      });

      ${vars.lectures}
        `,
  );
};

export const getPriorityIndex = (lectures: Lecture[]): number => {
  console.log("🚀 ~ file: control-class.ts:59 ~ getPriorityIndex ~ lectures:", lectures);
  // 모든 강의의 수강이 완료된 경우 확인
  const allCompleted =
    lectures.every(lecture => lecture.progress === 100) &&
    lectures.every(lecture => lecture.status === "done");
  if (allCompleted) {
    return -1; // 모든 강의가 완료된 상태를 나타내는 특별한 값
  }

  return lectures
    .map((lecture, index) => ({ ...lecture, index })) // 배열의 인덱스도 함께 저장
    .sort((a, b) => {
      // status 기준 정렬 ( processing > pending > done)
      if (a.status === "processing" && b.status !== "processing") return -1;
      if (a.status !== "processing" && b.status === "processing") return 1;
      if (a.status === "pending" && b.status === "done") return -1;
      if (a.status === "done" && b.status === "pending") return 1;

      // progress 기준 정렬
      if (a.progress < b.progress) return -1;
      if (a.progress > b.progress) return 1;

      // idx 기준 정렬
      if (a.idx < b.idx) return -1;
      if (a.idx > b.idx) return 1;

      // recent 기준 정렬 (날짜가 "없음"이면 가장 오래된 것으로 간주)
      const dateA = a.recent !== "없음" ? new Date(a.recent) : new Date(0);
      const dateB = b.recent !== "없음" ? new Date(b.recent) : new Date(0);
      return dateB.valueOf() - dateA.valueOf(); // 최신 날짜 우선 정렬
    })[0].index; // 가장 우선순위가 높은 강의의 원래 배열 인덱스 반환
};

export const playTargetLecture = (channel: string, lectures: Lecture[], index: number) => {
  console.log(channel, `${lectures[index].link}; console.log("Start playback");`);
  view.injectJS(channel, `${lectures[index].link}; console.log("Start playback");`);
};

export function getRemainingLearningTime(learningTime: string): number {
  const [learnedMinutes, totalMinutes] = learningTime.split("/").map(time => parseInt(time.trim()));

  return totalMinutes - learnedMinutes + 5;
}

export function timeChecker(durationInMinutes: number) {
  let remainingSeconds = durationInMinutes * 60; // 분을 초로 변환

  const interval = setInterval(() => {
    if (remainingSeconds <= 0) {
      console.log("The given time has been reached!");
      clearInterval(interval); // 주어진 시간에 도달했으면 타이머를 멈춤
    } else {
      console.log(
        `Remaining time: ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`,
      );
      remainingSeconds--;
    }
  }, 1000); // 1초에 한번씩 체크
}

export const moveLikeHuman = (channel: string) => {
  const randomXY = customAlphabet("1234567890", 3);
  view.injectJS(
    channel,
    `
      event = new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': ${randomXY()},  // X 좌표
        'clientY': ${randomXY()}   // Y 좌표
      });
      document.dispatchEvent(event);
    `,
  );
};

/** Player에 주입될 코드 */
export const parsePageInfo = (channel: string) => {
  const vars = {
    pageObserver: nanoid(),
    targetElement: "document.querySelector('.page-btn-sec')",
  };
  view.injectToPlayer(
    channel,
    vars.pageObserver,
    `
    console.log("MutationObserver: Observer created");
    const ${vars.pageObserver} = new MutationObserver(
      function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'characterData') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
                ${vars.targetElement}.textContent.split('/').map(i => parseInt(i.trim(), 10))
            }
        }
      };
    );
    console.log("MutationObserver: Start observing");
    ${vars.pageObserver}.observe(
      ${vars.targetElement},
      {
        characterData: true,
        subtree: true
      }
    );

    // 필요한 경우 다음 코드를 사용하여 감지 중지:
    // ${vars.pageObserver}.disconnect();
    `,
  );
};

export const checkAndClickNext = (channel: string, durationInMinutes: number) => {
  const randomXY = customAlphabet("1234567890", 3);
  const vars = {
    pauseFlag: nanoid(),
    checkAndClickNextFunc: nanoid(),
  };
  view.injectToPlayer(
    channel,
    vars.checkAndClickNextFunc,
    `
    let ${vars.pauseFlag} = false;
    console.log("checkAndClickNext injected");

    async function ${vars.checkAndClickNextFunc}() {
        let remainingSeconds = ${durationInMinutes} * 60; // 분을 초로 변환

        while (true) {
            if (${vars.pauseFlag}) {
              console.log("[while] Pause");
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }

            if (typeof gotoNextPage === 'function') {
              // 신강의
              if (gotoNextPage && nowPageNum !== totalPages) {
                let video = document.querySelector("video");
                let questChocie = document.querySelector(".quest.choice");
                let finalQuestions = document.querySelectorAll("div.scroll dl");
                video && video.addEventListener("ended", ()=>setTimeout(gotoNextPage, 1500));
                questChocie && setTimeout(gotoNextPage, 1500);

                if (video && video.paused) video.play();
                if (finalQuestions.length > 0) {
                  function selectRandomOptions() {
                    // 모든 질문을 가져옵니다 (dl 태그)
                    var questions = document.querySelectorAll("div.scroll dl");
                    var submit = document.querySelector(".btn_wrap").querySelector("input");

                    // 각 질문에 대해 루프를 실행합니다
                    questions.forEach(function (question) {
                      // 질문에 속한 선택지들을 가져옵니다 ('style="display: none;"'가 아닌 dd 태그)
                      var options = question.querySelectorAll('dd:not([style*="display: none"])');

                      // 랜덤으로 선택지를 선택합니다
                      var randomOption = options[Math.floor(Math.random() * options.length)];

                      randomOption.click();
                    });
                    submit.click();
                    setTimeout(gotoNextPage, 3000);
                  }
                  // 함수를 호출하여 랜덤으로 선택지를 선택합니다
                  selectRandomOptions();
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
              } else if (nowPageNum === totalPages) {
                console.log("End of lesson");
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } else {
              // 구강의
              const [current, last] = document.querySelector('.footer-sec .page-btn-sec strong').textContent.split('/').map(i => parseInt(i.trim(), 10));

              console.log("[while] Current Page/All Pages: "+current+"/"+last);

              if(document.querySelector('.confirm-popup')){
                document.querySelector('.btn-group') && document.querySelector('.btn-group').querySelector('.btn.vjs-control.btn-submit').click();
              }

              if (current === last) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
              }

              if (window.getComputedStyle(document.querySelector('.page-btn-sec .next')).display !== 'none' && current !== last) {
                console.log("[while] Click the Next button");
                document.querySelector('.page-btn-sec .next').click();
              }
              document.dispatchEvent(new MouseEvent('mousemove', {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'clientX': ${randomXY()},  // X 좌표
                'clientY': ${randomXY()}   // Y 좌표
              }));

              console.log("[while] Wait 10 seconds");
              await new Promise(resolve => setTimeout(resolve, 10000));  // 10초 대기
            }

        }
    }

    ${vars.checkAndClickNextFunc}()
`,
  );
  return vars.pauseFlag;
};

export const justOnce = (channel: string) => {
  const vars = {
    pauseFlag: nanoid(),
    checkAndClickNextFunc: nanoid(),
  };
  view.injectToPlayer(
    channel,
    vars.checkAndClickNextFunc,
    `
    let ${vars.pauseFlag} = false;
    console.log("checkAndClickNext injected");

    async function ${vars.checkAndClickNextFunc}() {
        while (true) {
            if (${vars.pauseFlag}) {
              console.log("[while] Pause");
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }

            if (gotoNextPage) {
              // 신강의
              if (gotoNextPage && nowPageNum !== totalPages) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                gotoNextPage();
              } else if (nowPageNum === totalPages) {
                console.log("End of lesson");
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.close();
              }
            } else {
              // 구강의
              const [current, last] = document.querySelector('.footer-sec .page-btn-sec strong').textContent.split('/').map(i => parseInt(i.trim(), 10));

              console.log("[while] Current Page/All Pages: "+current+"/"+last);

              if(document.querySelector('.confirm-popup')){
                document.querySelector('.btn-group') && document.querySelector('.btn-group').querySelector('.btn.vjs-control.btn-submit').click();
              }

              if (current === last) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                window.close();
              }

              if (window.getComputedStyle(document.querySelector('.page-btn-sec .next')).display !== 'none' && current !== last) {
                console.log("[while] Click the Next button");
                document.querySelector('.page-btn-sec .next').click();
              }

              console.log("[while] Wait 2 seconds");
              await new Promise(resolve => setTimeout(resolve, 2000));  // 10초 대기
            }

        }
    }

    ${vars.checkAndClickNextFunc}()
`,
  );
  return vars.pauseFlag;
};
