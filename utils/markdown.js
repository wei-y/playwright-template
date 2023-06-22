const fsPromise = require("fs/promises");
const path = require("path");
const child_process = require("child_process");
const { chromium } = require("@playwright/test");
const nodemailer = require("nodemailer");
const escape = require("markdown-escape");
const random = require("./random");
const { faker } = require("@faker-js/faker");
const _ = require("lodash");

// Playwright Logo
const defaultImage =
  "data:image/png;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMzYuNDQ0IDIyMS41NTZDMTIzLjU1OCAyMjUuMjEzIDExNS4xMDQgMjMxLjYyNSAxMDkuNTM1IDIzOC4wMzJDMTE0Ljg2OSAyMzMuMzY0IDEyMi4wMTQgMjI5LjA4IDEzMS42NTIgMjI2LjM0OEMxNDEuNTEgMjIzLjU1NCAxNDkuOTIgMjIzLjU3NCAxNTYuODY5IDIyNC45MTVWMjE5LjQ4MUMxNTAuOTQxIDIxOC45MzkgMTQ0LjE0NSAyMTkuMzcxIDEzNi40NDQgMjIxLjU1NlpNMTA4Ljk0NiAxNzUuODc2TDYxLjA4OTUgMTg4LjQ4NEM2MS4wODk1IDE4OC40ODQgNjEuOTYxNyAxODkuNzE2IDYzLjU3NjcgMTkxLjM2TDEwNC4xNTMgMTgwLjY2OEMxMDQuMTUzIDE4MC42NjggMTAzLjU3OCAxODguMDc3IDk4LjU4NDcgMTk0LjcwNUMxMDguMDMgMTg3LjU1OSAxMDguOTQ2IDE3NS44NzYgMTA4Ljk0NiAxNzUuODc2Wk0xNDkuMDA1IDI4OC4zNDdDODEuNjU4MiAzMDYuNDg2IDQ2LjAyNzIgMjI4LjQzOCAzNS4yMzk2IDE4Ny45MjhDMzAuMjU1NiAxNjkuMjI5IDI4LjA3OTkgMTU1LjA2NyAyNy41IDE0NS45MjhDMjcuNDM3NyAxNDQuOTc5IDI3LjQ2NjUgMTQ0LjE3OSAyNy41MzM2IDE0My40NDZDMjQuMDQgMTQzLjY1NyAyMi4zNjc0IDE0NS40NzMgMjIuNzA3NyAxNTAuNzIxQzIzLjI4NzYgMTU5Ljg1NSAyNS40NjMzIDE3NC4wMTYgMzAuNDQ3MyAxOTIuNzIxQzQxLjIzMDEgMjMzLjIyNSA3Ni44NjU5IDMxMS4yNzMgMTQ0LjIxMyAyOTMuMTM0QzE1OC44NzIgMjg5LjE4NSAxNjkuODg1IDI4MS45OTIgMTc4LjE1MiAyNzIuODFDMTcwLjUzMiAyNzkuNjkyIDE2MC45OTUgMjg1LjExMiAxNDkuMDA1IDI4OC4zNDdaTTE2MS42NjEgMTI4LjExVjEzMi45MDNIMTg4LjA3N0MxODcuNTM1IDEzMS4yMDYgMTg2Ljk4OSAxMjkuNjc3IDE4Ni40NDcgMTI4LjExSDE2MS42NjFaIiBmaWxsPSIjMkQ0NTUyIi8+CjxwYXRoIGQ9Ik0xOTMuOTgxIDE2Ny41ODRDMjA1Ljg2MSAxNzAuOTU4IDIxMi4xNDQgMTc5LjI4NyAyMTUuNDY1IDE4Ni42NThMMjI4LjcxMSAxOTAuNDJDMjI4LjcxMSAxOTAuNDIgMjI2LjkwNCAxNjQuNjIzIDIwMy41NyAxNTcuOTk1QzE4MS43NDEgMTUxLjc5MyAxNjguMzA4IDE3MC4xMjQgMTY2LjY3NCAxNzIuNDk2QzE3My4wMjQgMTY3Ljk3MiAxODIuMjk3IDE2NC4yNjggMTkzLjk4MSAxNjcuNTg0Wk0yOTkuNDIyIDE4Ni43NzdDMjc3LjU3MyAxODAuNTQ3IDI2NC4xNDUgMTk4LjkxNiAyNjIuNTM1IDIwMS4yNTVDMjY4Ljg5IDE5Ni43MzYgMjc4LjE1OCAxOTMuMDMxIDI4OS44MzcgMTk2LjM2MkMzMDEuNjk4IDE5OS43NDEgMzA3Ljk3NiAyMDguMDYgMzExLjMwNyAyMTUuNDM2TDMyNC41NzIgMjE5LjIxMkMzMjQuNTcyIDIxOS4yMTIgMzIyLjczNiAxOTMuNDEgMjk5LjQyMiAxODYuNzc3Wk0yODYuMjYyIDI1NC43OTVMMTc2LjA3MiAyMjMuOTlDMTc2LjA3MiAyMjMuOTkgMTc3LjI2NSAyMzAuMDM4IDE4MS44NDIgMjM3Ljg2OUwyNzQuNjE3IDI2My44MDVDMjgyLjI1NSAyNTkuMzg2IDI4Ni4yNjIgMjU0Ljc5NSAyODYuMjYyIDI1NC43OTVaTTIwOS44NjcgMzIxLjEwMkMxMjIuNjE4IDI5Ny43MSAxMzMuMTY2IDE4Ni41NDMgMTQ3LjI4NCAxMzMuODY1QzE1My4wOTcgMTEyLjE1NiAxNTkuMDczIDk2LjAyMDMgMTY0LjAyOSA4NS4yMDRDMTYxLjA3MiA4NC41OTUzIDE1OC42MjMgODYuMTUyOSAxNTYuMjAzIDkxLjA3NDZDMTUwLjk0MSAxMDEuNzQ3IDE0NC4yMTIgMTE5LjEyNCAxMzcuNyAxNDMuNDVDMTIzLjU4NiAxOTYuMTI3IDExMy4wMzggMzA3LjI5IDIwMC4yODMgMzMwLjY4MkMyNDEuNDA2IDM0MS42OTkgMjczLjQ0MiAzMjQuOTU1IDI5Ny4zMjMgMjk4LjY1OUMyNzQuNjU1IDMxOS4xOSAyNDUuNzE0IDMzMC43MDEgMjA5Ljg2NyAzMjEuMTAyWiIgZmlsbD0iIzJENDU1MiIvPgo8cGF0aCBkPSJNMTYxLjY2MSAyNjIuMjk2VjIzOS44NjNMOTkuMzMyNCAyNTcuNTM3Qzk5LjMzMjQgMjU3LjUzNyAxMDMuOTM4IDIzMC43NzcgMTM2LjQ0NCAyMjEuNTU2QzE0Ni4zMDIgMjE4Ljc2MiAxNTQuNzEzIDIxOC43ODEgMTYxLjY2MSAyMjAuMTIzVjEyOC4xMUgxOTIuODY5QzE4OS40NzEgMTE3LjYxIDE4Ni4xODQgMTA5LjUyNiAxODMuNDIzIDEwMy45MDlDMTc4Ljg1NiA5NC42MTIgMTc0LjE3NCAxMDAuNzc1IDE2My41NDUgMTA5LjY2NUMxNTYuMDU5IDExNS45MTkgMTM3LjEzOSAxMjkuMjYxIDEwOC42NjggMTM2LjkzM0M4MC4xOTY2IDE0NC42MSA1Ny4xNzkgMTQyLjU3NCA0Ny41NzUyIDE0MC45MTFDMzMuOTYwMSAxMzguNTYyIDI2LjgzODcgMTM1LjU3MiAyNy41MDQ5IDE0NS45MjhDMjguMDg0NyAxNTUuMDYyIDMwLjI2MDUgMTY5LjIyNCAzNS4yNDQ1IDE4Ny45MjhDNDYuMDI3MiAyMjguNDMzIDgxLjY2MyAzMDYuNDgxIDE0OS4wMSAyODguMzQyQzE2Ni42MDIgMjgzLjYwMiAxNzkuMDE5IDI3NC4yMzMgMTg3LjYyNiAyNjIuMjkxSDE2MS42NjFWMjYyLjI5NlpNNjEuMDg0OCAxODguNDg0TDEwOC45NDYgMTc1Ljg3NkMxMDguOTQ2IDE3NS44NzYgMTA3LjU1MSAxOTQuMjg4IDg5LjYwODcgMTk5LjAxOEM3MS42NjE0IDIwMy43NDMgNjEuMDg0OCAxODguNDg0IDYxLjA4NDggMTg4LjQ4NFoiIGZpbGw9IiNFMjU3NEMiLz4KPHBhdGggZD0iTTM0MS43ODYgMTI5LjE3NEMzMjkuMzQ1IDEzMS4zNTUgMjk5LjQ5OCAxMzQuMDcyIDI2Mi42MTIgMTI0LjE4NUMyMjUuNzE2IDExNC4zMDQgMjAxLjIzNiA5Ny4wMjI0IDE5MS41MzcgODguODk5NEMxNzcuNzg4IDc3LjM4MzQgMTcxLjc0IDY5LjM4MDIgMTY1Ljc4OCA4MS40ODU3QzE2MC41MjYgOTIuMTYzIDE1My43OTcgMTA5LjU0IDE0Ny4yODQgMTMzLjg2NkMxMzMuMTcxIDE4Ni41NDMgMTIyLjYyMyAyOTcuNzA2IDIwOS44NjcgMzIxLjA5OEMyOTcuMDkzIDM0NC40NyAzNDMuNTMgMjQyLjkyIDM1Ny42NDQgMTkwLjIzOEMzNjQuMTU3IDE2NS45MTcgMzY3LjAxMyAxNDcuNSAzNjcuNzk5IDEzNS42MjVDMzY4LjY5NSAxMjIuMTczIDM1OS40NTUgMTI2LjA3OCAzNDEuNzg2IDEyOS4xNzRaTTE2Ni40OTcgMTcyLjc1NkMxNjYuNDk3IDE3Mi43NTYgMTgwLjI0NiAxNTEuMzcyIDIwMy41NjUgMTU4QzIyNi44OTkgMTY0LjYyOCAyMjguNzA2IDE5MC40MjUgMjI4LjcwNiAxOTAuNDI1TDE2Ni40OTcgMTcyLjc1NlpNMjIzLjQyIDI2OC43MTNDMTgyLjQwMyAyNTYuNjk4IDE3Ni4wNzcgMjIzLjk5IDE3Ni4wNzcgMjIzLjk5TDI4Ni4yNjIgMjU0Ljc5NkMyODYuMjYyIDI1NC43OTEgMjY0LjAyMSAyODAuNTc4IDIyMy40MiAyNjguNzEzWk0yNjIuMzc3IDIwMS40OTVDMjYyLjM3NyAyMDEuNDk1IDI3Ni4xMDcgMTgwLjEyNiAyOTkuNDIyIDE4Ni43NzNDMzIyLjczNiAxOTMuNDExIDMyNC41NzIgMjE5LjIwOCAzMjQuNTcyIDIxOS4yMDhMMjYyLjM3NyAyMDEuNDk1WiIgZmlsbD0iIzJFQUQzMyIvPgo8cGF0aCBkPSJNMTM5Ljg4IDI0Ni4wNEw5OS4zMzI0IDI1Ny41MzJDOTkuMzMyNCAyNTcuNTMyIDEwMy43MzcgMjMyLjQ0IDEzMy42MDcgMjIyLjQ5NkwxMTAuNjQ3IDEzNi4zM0wxMDguNjYzIDEzNi45MzNDODAuMTkxOCAxNDQuNjExIDU3LjE3NDIgMTQyLjU3NCA0Ny41NzA0IDE0MC45MTFDMzMuOTU1NCAxMzguNTYzIDI2LjgzNCAxMzUuNTcyIDI3LjUwMDEgMTQ1LjkyOUMyOC4wOCAxNTUuMDYzIDMwLjI1NTcgMTY5LjIyNCAzNS4yMzk3IDE4Ny45MjlDNDYuMDIyNSAyMjguNDMzIDgxLjY1ODMgMzA2LjQ4MSAxNDkuMDA1IDI4OC4zNDJMMTUwLjk4OSAyODcuNzE5TDEzOS44OCAyNDYuMDRaTTYxLjA4NDggMTg4LjQ4NUwxMDguOTQ2IDE3NS44NzZDMTA4Ljk0NiAxNzUuODc2IDEwNy41NTEgMTk0LjI4OCA4OS42MDg3IDE5OS4wMThDNzEuNjYxNSAyMDMuNzQzIDYxLjA4NDggMTg4LjQ4NSA2MS4wODQ4IDE4OC40ODVaIiBmaWxsPSIjRDY1MzQ4Ii8+CjxwYXRoIGQ9Ik0yMjUuMjcgMjY5LjE2M0wyMjMuNDE1IDI2OC43MTJDMTgyLjM5OCAyNTYuNjk4IDE3Ni4wNzIgMjIzLjk5IDE3Ni4wNzIgMjIzLjk5TDIzMi44OSAyMzkuODcyTDI2Mi45NzEgMTI0LjI4MUwyNjIuNjA3IDEyNC4xODVDMjI1LjcxMSAxMTQuMzA0IDIwMS4yMzIgOTcuMDIyNCAxOTEuNTMyIDg4Ljg5OTRDMTc3Ljc4MyA3Ny4zODM0IDE3MS43MzUgNjkuMzgwMiAxNjUuNzgzIDgxLjQ4NTdDMTYwLjUyNiA5Mi4xNjMgMTUzLjc5NyAxMDkuNTQgMTQ3LjI4NCAxMzMuODY2QzEzMy4xNzEgMTg2LjU0MyAxMjIuNjIzIDI5Ny43MDYgMjA5Ljg2NyAzMjEuMDk3TDIxMS42NTUgMzIxLjVMMjI1LjI3IDI2OS4xNjNaTTE2Ni40OTcgMTcyLjc1NkMxNjYuNDk3IDE3Mi43NTYgMTgwLjI0NiAxNTEuMzcyIDIwMy41NjUgMTU4QzIyNi44OTkgMTY0LjYyOCAyMjguNzA2IDE5MC40MjUgMjI4LjcwNiAxOTAuNDI1TDE2Ni40OTcgMTcyLjc1NloiIGZpbGw9IiMxRDhEMjIiLz4KPHBhdGggZD0iTTE0MS45NDYgMjQ1LjQ1MUwxMzEuMDcyIDI0OC41MzdDMTMzLjY0MSAyNjMuMDE5IDEzOC4xNjkgMjc2LjkxNyAxNDUuMjc2IDI4OS4xOTVDMTQ2LjUxMyAyODguOTIyIDE0Ny43NCAyODguNjg3IDE0OSAyODguMzQyQzE1Mi4zMDIgMjg3LjQ1MSAxNTUuMzY0IDI4Ni4zNDggMTU4LjMxMiAyODUuMTQ1QzE1MC4zNzEgMjczLjM2MSAxNDUuMTE4IDI1OS43ODkgMTQxLjk0NiAyNDUuNDUxWk0xMzcuNyAxNDMuNDUxQzEzMi4xMTIgMTY0LjMwNyAxMjcuMTEzIDE5NC4zMjYgMTI4LjQ4OSAyMjQuNDM2QzEzMC45NTIgMjIzLjM2NyAxMzMuNTU0IDIyMi4zNzEgMTM2LjQ0NCAyMjEuNTUxTDEzOC40NTcgMjIxLjEwMUMxMzYuMDAzIDE4OC45MzkgMTQxLjMwOCAxNTYuMTY1IDE0Ny4yODQgMTMzLjg2NkMxNDguNzk5IDEyOC4yMjUgMTUwLjMxOCAxMjIuOTc4IDE1MS44MzIgMTE4LjA4NUMxNDkuMzkzIDExOS42MzcgMTQ2Ljc2NyAxMjEuMjI4IDE0My43NzYgMTIyLjg2N0MxNDEuNzU5IDEyOS4wOTMgMTM5LjcyMiAxMzUuODk4IDEzNy43IDE0My40NTFaIiBmaWxsPSIjQzA0QjQxIi8+Cjwvc3ZnPgo=";

module.exports = {
  /**
   * Generate markdown header
   *
   * @param {Object} options
   * @param {Number} options.level - header level, default to 1
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} header generated
   */
  _randomHeader(options) {
    const { level = 1, ...opt } = options;
    const hash = "#".repeat(level);
    const content = escape(random.sentence(opt));
    return `${hash} ${content}\n`;
  },

  /**
   * Generate random paragraphs
   *
   * @param {Object} options
   * @param {Number} options.amount - amount of paragraphs, default to 3
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} paragraphs generated, separated by `\n`
   */
  _randomParagraph(options) {
    const para = escape(random.paragraphs(options));
    return `${para}\n`;
  },

  /**
   * Generate random list
   *
   * @param {Object} options
   * @param {Boolean} options.ordered - ordered list or unordered, default to
   *     false
   * @param {Number} options.amount - amount of items, default to 3
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} list generated
   */
  _randomList(options) {
    const { ordered = false, ...rndOpt } = options;
    const paragraphs = escape(random.paragraphs(rndOpt));

    const items = paragraphs.split("\n").map((line, idx) => {
      const mark = ordered ? `${idx + 1}.` : "-";
      return `${mark} ${line.trim()}`;
    });
    return `${items.join("\n")}\n`;
  },

  /**
   * Generate random code block (text)
   *
   * @param {Object} options
   * @param {Number} options.amount - amount of paragraphs, default to 3
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} code block generated
   */
  _randomCodeBlock(options) {
    const paragraph = escape(random.paragraphs(options));
    const quote = "```";
    return `${quote}text\n${paragraph}\n${quote}\n`;
  },

  /**
   * Generate random quote block
   *
   * @param {Object} options
   * @param {Number} options.amount - amount of paragraphs, default to 3
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} quote block generated
   */
  _randomQuote(options) {
    const paragraphs = escape(random.paragraphs(options));
    const items = paragraphs.split("\n").map((line) => `> ${line.trim()}`);
    return `${items.join("\n")}\n`;
  },

  /**
   * Generate random link
   *
   * @param {Object} options
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} link generated
   */
  _randomLink(options) {
    const text = escape(random.sentence(options));
    const link = faker.internet.url();
    return `[${text}](${link})\n`;
  },

  /**
   * Generate random image link
   *
   * @param {Object} options
   * @param {String} options.src - source path of the image, default to
   *     'non-existing'
   * @param {String[]} options.keywords - optional, keywords to be included in
   *     image description ([alt])
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} image link generated
   */
  _randomImage(options) {
    const { src = defaultImage, ...textOpt } = options;
    const text = escape(random.sentence(textOpt));
    return `![${text}](${src})\n`;
  },

  /**
   * Generate random table
   *
   * @param {Object} options
   * @param {Number} options.rows - rows of the table, default to 2
   * @param {Number} options.cols - columns of the table, default to 3
   * @param {String[]} options.keywords - optional, keywords to be included
   * @param {Nubmer} options.kwDistance - optional, distance between keywords.
   *     Random if no specified
   * @returns {String} link generated
   */
  _randomTable(options) {
    const { rows = 2, cols = 3, ...textOpt } = options;

    // generate (R + 1) * C paragraphs, each will be text of a cell (include
    // headers). One of the paragraph will contain the keyword.
    // the keyword
    const amount = (rows + 1) * cols;
    const cellTexts = escape(random.paragraphs({ ...textOpt, amount })).split(
      "\n"
    );

    // get the first `col` paragraphs as headers
    const headers = cellTexts.slice(0, cols);
    // create split line
    const split = _.times(cols, () => "-----");
    // spread remaining to eaach rows, it should start from the 2nd group
    // because that the 1st has been used as header
    const body = _.range(rows).map((idx) =>
      cellTexts.slice((idx + 1) * cols, (idx + 2) * cols)
    );
    // create text by concatenating cells by '|'
    const headerText = `| ${headers.join(" | ")} |`;
    const splitText = `| ${split.join(" | ")} |`;
    const bodyText = body.map((row) => `| ${row.join(" | ")} |`).join("\n");

    // combine everything together
    return `${headerText}\n${splitText}\n${bodyText}\n`;
  },

  /**
   * Generate markdown text
   *
   * @param {Object[]} options - each element is an option to the specified
   *   block. The structure is the same as options above, with an extra
   *   `options.block`
   * @param {
   *   "header"|
   *   "paragraph"|
   *   "list"|
   *   "codeblock"|
   *   "quote"|
   *   "link"|
   *   "image"|
   *   "table"} options.block - optional, keywords to be included
   * @returns {String} markdown text generated
   */
  generate(options) {
    const blocks = [];
    for (const option of options) {
      const { block, ...blkOpt } = option;
      switch (block.toLowerCase()) {
        case "header":
          blocks.push(this._randomHeader(blkOpt));
          break;
        case "paragraphs":
          blocks.push(this._randomParagraph(blkOpt));
          break;
        case "list":
          blocks.push(this._randomList(blkOpt));
          break;
        case "codeblock":
          blocks.push(this._randomCodeBlock(blkOpt));
          break;
        case "quote":
          blocks.push(this._randomQuote(blkOpt));
          break;
        case "link":
          blocks.push(this._randomLink(blkOpt));
          break;
        case "image":
          blocks.push(this._randomImage(blkOpt));
          break;
        case "table":
          blocks.push(this._randomTable(blkOpt));
          break;
      }
    }
    return blocks.join("\n") + "\n";
  },

  /**
   * Write markdown content to file, and optionaly convert it to other formats
   *
   * @param {String} destName - full file name to write to
   * @param {String} content - markdown file content
   * @param {String} pandocArgs - extra options to pass to `pandoc
   */
  async saveFile(destName, content, pandocArgs = "") {
    const { dir, name, ext } = path.parse(destName);
    let result;

    // generate markdown
    const mdName = ext === ".md" ? name : faker.lorem.slug();
    const mdDest = path.join(dir, `${mdName}.md`);
    await fsPromise.mkdir(dir, { recursive: true });
    await fsPromise.writeFile(mdDest, content);

    if (ext !== ".md") {
      // create nohypenation control for pdf
      // eslint-disable-next-line max-len
      // ref: http://www.matthewstrawbridge.com/content/2014/creating-pdfs-justified-text-no-hyphens-pandoc/
      const nohypephCtrl = "/tmp/nohyphenation";
      const nohypenation = "\\exhyphenpenalty=10000 \\hyphenpenalty=10000";
      await fsPromise.writeFile(nohypephCtrl, nohypenation);

      // convert to specified format when it is not markdown
      const from = `${mdDest} -f markdown`;
      const to = `-o ${destName}`;
      const noMargin =
        "-V margin-left=10pt " +
        "-V margin-right=10pt " +
        "-V margin-top=10pt " +
        "-V margin-bottom=10pt";
      const noHyphOpt = `--include-in-header=${nohypephCtrl}`;
      let cmd = `pandoc ${from} ${to} ${pandocArgs} ${noMargin}`;
      console.log(`Converting markdown:\n ${cmd}`);
      if (ext === ".pdf") {
        cmd = `${cmd} ${noHyphOpt}`;
      }
      child_process.execSync(cmd);

      // remove the markdown, only keep the converted
      await fsPromise.rm(mdDest);
      result = { path: destName, buffer: await fsPromise.readFile(destName) };
    } else {
      result = { path: mdDest, buffer: await fsPromise.readFile(mdDest) };
    }

    return result;
  },

  async saveImage(destName, content) {
    const { dir } = path.parse(destName);

    // generate html with monospace font (easier for OCR)
    const cssName = faker.lorem.slug();
    const cssDest = path.join(dir, `${cssName}.css`);
    const cssContent = `
    html {
      font-family: Arial, sans-serif;
    }
    `;
    await fsPromise.writeFile(cssDest, cssContent);
    const htmlName = faker.lorem.slug();
    const htmlDest = path.join(dir, `${htmlName}.html`);
    await this.saveFile(
      htmlDest,
      content,
      `-s --css ${cssDest} --metadata pagetitle=${htmlName}`
    );

    // open the html by PW
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${htmlDest}`);

    // capture whole page screenshot and save
    await page.screenshot({ fullPage: true, path: destName });
    await browser.close();

    // remove HTML
    await fsPromise.rm(htmlDest);
    await fsPromise.rm(cssDest);

    // return file path and buffer
    return {
      path: destName,
      buffer: await fsPromise.readFile(destName),
    };
  },

  /**
   * Generate *.eml file from markdown
   *
   * @param {String} destName - full path name of the email file
   * @param {String} body - email content, will be used as `body` and `html`
   * @param {String[]} attachments - array of file paths to be attached
   * @returns {Object} Save file path and content buffer
   */
  async saveEmail(destName, body, fields = {}) {
    const { from, to, cc, bcc, subject, attachments } = fields;

    // generate html file
    const { dir } = path.parse(destName);
    const htmlName = faker.lorem.slug();
    const htmlDest = path.join(dir, `${htmlName}.html`);
    const html = await this.saveFile(htmlDest, body);

    // normalize attachments
    const mailAttachments = attachments.map((a) => {
      const { base } = path.parse(a);
      return { filename: base, path: a };
    });

    // create mailer using stream transport so that it can save the content to
    // file instead of sending it
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });

    // compose message with random data
    const msg = {
      from: from ?? faker.internet.email(),
      to: to ?? faker.internet.email(),
      cc,
      bcc,
      subject: subject ?? faker.lorem.sentence(),
      text: body,
      html,
      attachments: mailAttachments,
    };
    const email = await transporter.sendMail(msg);
    await fsPromise.writeFile(destName, email.message);
    await fsPromise.rm(htmlDest);

    return {
      path: destName,
      buffer: email.message,
    };
  },
};
