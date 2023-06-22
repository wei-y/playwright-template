const $pages = require("../pages");

module.exports = {
  async newItem(page, options) {
    const { text } = options;
    const todoPage = new $pages.TodoPage(page);
    await todoPage.$input.fill(text);
    await todoPage.$input.press("Enter");
  },

  async remove(page, options) {
    const { name } = options;
    const todoPage = new $pages.TodoPage(page);
    const item = todoPage.item(name);
    await await item.remove();
  },

  async read(page, options) {
    const { target = "item", name } = options;
    const todoPage = new $pages.TodoPage(page);
    if (target === "page") {
      return await todoPage.read();
    } else if (target === "item") {
      const item = todoPage.item(name);
      return await item.read();
    }
  },

  async update(page, options) {
    const { name, newText, confirm = "enter" } = options;
    const todoPage = new $pages.TodoPage(page);
    const item = todoPage.item(name);
    await item.update(newText, { confirm });
  },

  async complete(page, options) {
    const { target = "item", name } = options;
    const todoPage = new $pages.TodoPage(page);
    if (target === "item") {
      const item = todoPage.item(name);
      await item.complete();
    } else if (target === "all") {
      await todoPage.completeAll();
    }
  },

  async uncomplete(page, options) {
    const { target = "item", name } = options;
    const todoPage = new $pages.TodoPage(page);
    if (target === "item") {
      const item = todoPage.item(name);
      await item.uncomplete();
    } else if (target === "all") {
      await todoPage.uncompleteAll();
    }
  },

  async clearCompleted(page) {
    const todoPage = new $pages.TodoPage(page);
    await todoPage.clearCompleted();
  },

  async filterBy(page, options) {
    const { filter } = options;
    const todoPage = new $pages.TodoPage(page);
    await todoPage.filterBy(filter);
  },

  async isExisting(page, options) {
    const { name } = options;
    const todoPage = new $pages.TodoPage(this.page);
    const item = todoPage.item(name);
    return await item.isExisting();
  },
};
