/**
 * Loads the object defined in the relevant fixture file as test fixture.
 *
 * The fixture file has the same name as the test suite, replacing `.spec` with
 * `.fixture`. It exports an object with test titles as keys and fixutres for
 * each tests as values
 * @param {Object} testInfo - the testInfo object passed in to tests
 * @returns {Object} - the fixture defined for the test case
 */
function loadFixture(testInfo) {
  const parts = testInfo.file
    .replace(process.cwd(), "") // remove the workspace folder
    .replace(".spec.", ".fixture.") // replace file name
    .split(path.sep); // split path using OS sep
  parts[0] = "..";
  const fixturePath = parts.join(path.posix.sep); // join with posix sep

  const fixture = require(fixturePath)[testInfo.title];
  console.log(`Fixture loaded:\n${JSON.stringify(fixture, null, 2)}`);
  return fixture;
}

module.exports = {
  loadFixture,
};
