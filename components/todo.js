const { BaseComponent } = require("./base");

class TodoItem extends BaseComponent {
  constructor(component) {
    super(component);
    this.$checkbox = component.getByRole("checkbox");
    this.$text = component.getByTestId("todo-title");
    this.$input = component.getByRole("textbox");
    this.$delete = component.getByLabel("Delete");
  }

  async isCompleted() {
    return await this.$checkbox.isChecked();
  }

  async complete() {
    if (!(await this.isCompleted())) {
      await this.$checkbox.check();
    }
  }

  async uncomplete() {
    if (await this.isCompleted()) {
      await this.$checkbox.uncheck();
    }
  }

  async update(newText) {
    await this.$text.dblclick();
    await this.$text.fill(newText);
    await this.$text.press("Enter");
  }

  async remove() {
    await this.$origin.hover();
    await this.$delete.click();
  }

  async read() {
    await this.$origin.hover();
    return {
      completed: await this.isCompleted(),
      text: await this.$text.textContent(),
      canToggle: await this.$checkbox.isVisible(),
      canRemove: await this.$delete.isVisible(),
    };
  }
}

module.exports = {
  TodoItem,
};
