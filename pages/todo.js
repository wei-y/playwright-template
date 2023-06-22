const { BasePage } = require("./base");
const $components = require("../components");

class TodoPage extends BasePage {
  constructor(page) {
    super(page);
    this.$input = page.getByPlaceholder("What needs to be done?");
    this.$toggleAll = page.getByLabel("Mark all as complete");
    this.$$items = page.getByTestId("todo-item");
    this.$count = page.getByTestId("todo-count");
    this.$filter = (name) => page.getByRole("link", { name });
    this.$currentFilter = page.locator(".filters a.selected");
    this.$clearCompleted = page.getByRole("button", {
      name: "Clear completed",
    });
  }

  async items() {
    const result = [];
    for (const item of await this.$$items.all()) {
      result.push(new $components.TodoItem(item));
    }
    return result;
  }

  item(name) {
    const item = this.$$items.filter({ hasText: name });
    return new $components.TodoItem(item);
  }

  async readCount() {
    if (await this.$count.isVisible()) {
      return await this.$count.textContent();
    }
  }

  async completeAll() {
    await this.$toggleAll.check();
  }

  async uncompleteAll() {
    await this.$toggleAll.uncheck();
  }

  async filterBy(name) {
    await this.$filter(name).click();
  }

  async clearCompleted() {
    await this.$clearCompleted.click();
  }

  async read() {
    const items = [];
    for (const item of await this.items()) {
      items.push(await item.read());
    }

    const inputText = (await this.$input.isVisible())
      ? await this.$input.inputValue()
      : null;

    const count = (await this.$count.isVisible())
      ? await this.$count.textContent()
      : null;

    const currentFilter = (await this.$currentFilter.isVisible())
      ? await this.$currentFilter.textContent()
      : null;

    const allCompleted = (await this.$toggleAll.isVisible())
      ? await this.$toggleAll.isChecked()
      : null;

    return {
      items,
      inputText,
      count,
      currentFilter,
      allCompleted,
      canClearCompleted: await this.$clearCompleted.isVisible(),
    };
  }
}

module.exports = { TodoPage };
