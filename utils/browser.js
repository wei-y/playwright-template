/**
 * Intercept a HTTP response with JSON, and update the JSON object with a
 * function provided.
 *
 * @param {Object} page - the page to intercept the response
 * @param {String} url - URL to intercept
 * @param {Function} modifier - the function that updates the json object in the
 *     response. (object) => object
 */
async function interceptJSON(page, url, modifier) {
  await page.route(url, async (route) => {
    try {
      // intercept the response
      const response = await page.request.fetch(route.request());
      const content = await response.json();
      // call the modifier to modify the content
      const updated = modifier(content);
      // replace the body with the updated json
      const body = JSON.stringify(updated);
      route.fulfill({ response, body });
      console.log(`JSON of ${url} is updated to ${body}`);
    } catch (e) {
      // silent all exceptions since most likely it is broken because of racing
      // with tear down and lost of context.
      console.log(`Cannot intercept ${url}: ${e}`);
    }
  });
}

/**
 * Stop intercepting JSON response
 *
 * This should be called in the tear down to silent the exception raised on
 * unfufilled promise if `interceptJSON()` has been called
 * @param {Object} page - the page to untrap the notifications
 * @param {String} url - URL to untrap
 */
async function stopInterceptingJSON(page, url) {
  try {
    await page.unroute(url);
  } catch (e) {
    console.log(`Cannot unroute ${url}: ${e}`);
  }
}

/**
 * Listen to console log and when error is logged, append them to test report
 *
 * @param {Object} page - the page to listen to console log
 */
async function listenToConsoleLog(page) {
  page.on("console", async (msg) => {
    if (msg.type() === "error") {
      console.log(`[BROWSER CONSOLE ERROR]: ${msg.text()}`);
    }
  });
}

module.exports = {
  interceptJSON,
  stopInterceptingJSON,
  listenToConsoleLog,
};
