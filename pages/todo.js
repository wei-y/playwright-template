const { BasePage } = require("./base");

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

  async toggleAll() {
    await this.$toggleAll.check();
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

    return {
      inputText: await this.$input.inputValue(),
      count: await this.$count.textContent(),
      currentFilter: await this.$currentFilter.textContent(),
      canClearCompleted: await this.$clearCompleted.isVisible(),
      items,
    };
  }
}

module.exports = { TodoPage };
