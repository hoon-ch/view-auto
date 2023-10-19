import { view } from "#preload";
import { customAlphabet } from "nanoid";

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
        const link = cells[5].querySelector("a").onclick.toString();
        let status;
        if (progress === 0) {
          status = "pending";
        } else if (progress === 100) {
          status = "done";
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
