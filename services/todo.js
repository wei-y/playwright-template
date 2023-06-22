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
    const { target, name } = options;
    const todoPage = new $pages.TodoPage(page);
    if (target === "page") {
      return await todoPage.read();
    } else if (target === "item") {
      const item = todoPage.item(name);
      return await item.read();
    }
  },

  async update(page, options) {
    const { name, newText } = options;
    const todoPage = new $pages.TodoPage(page);
    const item = todoPage.item(name);
    await item.update(newText);
  },

  async complete(page, options) {
    const { name } = options;
    const todoPage = new $pages.TodoPage(page);
    const item = todoPage.item(name);
    await item.complete();
  },

  async uncomplete(page) {
    const { name } = options;
    const todoPage = new $pages.TodoPage(page);
    const item = todoPage.item(name);
    await item.uncomplete();
  },

  async toggleAll(page) {
    const todoPage = new $pages.TodoPage(page);
    await todoPage.toggleAll();
  },

  async isExisting(page, options) {
    const { name } = options;
    const todoPage = new $pages.TodoPage(this.page);
    const item = todoPage.item(name);
    return await item.isExisting();
  },
};
