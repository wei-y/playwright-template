const path = require("path");
const { faker } = require("@faker-js/faker");
const _ = require("lodash");

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

/**
 * Generates a few random paragraphs with random text
 * @param {Object} options
 * @param {String} options.content - content of the paragraph, optional
 * @param {Number} options.amount - number of paragraphs to generate if
 *    `content` is not provided
 * @param {String[]} options.keywords - keywords to be inserted, optional
 * @param {Number} options.kwDistance - distance between keywords, optional
 * @returns {String}
 */
function paragraphs(options = {}) {
  const { amount = 3, keywords, kwDistance } = options;
  let content = options.content ?? faker.lorem.paragraphs(amount);

  if (keywords) {
    // split the content to an array
    const textArray = content.replaceAll("\n", "$NEWLINE$ ").split(/\s+/);

    // inject keywords into random places in the content
    if (kwDistance) {
      const firstIdxMax =
        textArray.length - (keywords.length - 1) * kwDistance - 1;
      let idx = Math.floor(Math.random() * (firstIdxMax + 1));
      for (const kw of keywords) {
        textArray.splice(idx, 0, kw);
        idx += kwDistance;
      }
    } else {
      for (const kw of keywords) {
        const idx = Math.floor(Math.random() * textArray.length);
        textArray.splice(idx, 0, kw);
      }
    }

    content = textArray.join(" ").replaceAll("$NEWLINE$", "\n");
  }
  return content;
}

function sentence(options = {}) {
  const { amount, keywords, kwDistance } = options;
  let content = faker.lorem.sentence(amount);

  if (keywords) {
    // split the content to an array
    const textArray = content.split(/\s+/);

    // inject keywords into random places in the content
    if (kwDistance) {
      const firstIdxMax =
        textArray.length - (keywords.length - 1) * kwDistance - 1;
      let idx = Math.floor(Math.random() * (firstIdxMax + 1));
      for (const kw of keywords) {
        textArray.splice(idx, 0, kw);
        idx += kwDistance;
      }
    } else {
      for (const kw of keywords) {
        const idx = Math.floor(Math.random() * textArray.length);
        textArray.splice(idx, 0, kw);
      }
    }

    content = textArray.join(" ");
  }
  return content;
}

/**
 * Generates a random file name
 * @param {Object} options
 * @param {Number} options.length - word count in the file name
 * @param {String[]} options.keywords - keywords to be insert in the file name
 * @param {Number} options.kwDistance - distance between keywords, optional
 * @returns {String}
 */
function filename(options = {}) {
  const { length = 3, keywords, kwDistance, ext = "txt" } = options;

  // generate a few words as the base name and an ext
  let words = faker.lorem.words(length).split(" ");

  // insert keywords in it
  if (keywords) {
    if (!kwDistance) {
      // if distance between kws are not speicified, concat kws and shuffle
      words = words.concat(keywords);
      words = _.shuffle(words);
    } else {
      // if distance is specified:
      //   1) generate filler words expandding the length fullfilling the
      //      distance
      const filler = faker.lorem
        .words((keywords.length - 1) * kwDistance)
        .split(" ");
      words = words.concat(filler);
      //   2) insert the keywords with the specified distances
      for (let i = 0; i < keywords.length; i += 1) {
        words.splice(i * kwDistance, 0, keywords[i]);
      }
    }
  }

  // connect all words together with '-' and add ext
  return words.join("-") + "." + ext;
}

/**
 * Generates a random string connecting a sequence of words
 * @param {String} sep - String used to connect words generated randomly
 *    Defaults to ''
 * @param {Number} count - Number of words, defaults to 3
 * @returns {String}
 */
function word(options = {}) {
  const { count = 3, sep = "" } = options;
  return faker.lorem.words(count).replaceAll(" ", sep);
}

/**
 * Generates a random file path using random lorem slugs
 * @param {Object} options
 * @param {Number} options.maxDepth - max depth of the path
 * @param {Boolean} options.posix - use posix path sep or system
 * @returns {String}
 */
function dirPath(options = {}) {
  const { minDepth = 0, maxDepth = 5, posix = true } = options;
  const depth = faker.number.int({ min: minDepth, max: maxDepth });

  // generate some slugs, each contains 3 words so that it's not too short
  const words = Array.from({ length: depth }, () => faker.lorem.slug(3));

  // join the words together to create a path
  if (posix) {
    return path.posix.join.apply(null, words);
  }
  return path.join.apply(null, words);
}

/**
 * Generate a date within or out of the given days
 *
 * @param {Number} days - number of days the generated date should be within
 * @param {Object} options
 * @param {Boolean} options.reverse - generate a date out of the range if true
 * @param {Boolean} options.epoch - return epoch seconds if true, otherwise
 *    return Date object
 * @returns {Date|Number} - the date generated
 */
function dateWithin(days, options = {}) {
  const { reverse, epoch = true } = options;
  const ref = dayjs().subtract(days + 1, "day");
  const result = reverse
    ? faker.date.past({ years: 1, refDate: ref })
    : faker.date.recent({ days });
  return epoch ? Math.floor(result.getTime() / 1000) : result;
}

/**
 * Generate a date within or out of the given date range
 *
 * @param {String} startDate - start date of the range in DD/MM/YYYY format
 * @param {String} endDate - end date of the range in DD/MM/YYYY format
 * @param {Object} options
 * @param {Boolean} options.reverse - generate a date out of the range if true
 * @param {Boolean} options.epoch - return epoch seconds if true, otherwise
 *    return Date object
 * @returns {Date|Number} - the date generated
 */
function dateBetween(startDate, endDate, options = {}) {
  const { reverse, epoch = true } = options;
  const start = dayjs(startDate, "DD/MM/YYYY");
  const end = dayjs(endDate, "DD/MM/YYYY").subtract(1, "day");
  let result;
  if (reverse) {
    const beforeStart = faker.date.past({ years: 1, refDate: start });
    const afterEnd = faker.date.future({ years: 1, refDate: end });
    result = Math.random() < 0.5 ? beforeStart : afterEnd;
  } else {
    result = faker.date.between({ from: start, to: end });
  }
  return epoch ? Math.floor(result.getTime() / 1000) : result;
}

module.exports = {
  paragraphs,
  sentence,
  filename,
  word,
  dirPath,
  dateWithin,
  dateBetween,
};
