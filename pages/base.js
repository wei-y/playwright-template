class BasePage {
  constructor(page) {
    this.$origin = page;

    // Add any other common elements here
  }

  locator(selector, options) {
    return this.$origin.locator(selector, options);
  }
}

module.exports = { BasePage };
