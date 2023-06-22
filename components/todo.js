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
    if (await this.$checkbox.isVisible()) {
      return await this.$checkbox.isChecked();
    }
    return null;
  }

  async complete() {
    if ((await this.isCompleted()) === false) {
      await this.$checkbox.check();
    }
  }

  async uncomplete() {
    if ((await this.isCompleted()) === true) {
      await this.$checkbox.uncheck();
    }
  }

  async update(newText, options) {
    const { confirm = "enter" } = options;
    await this.$text.dblclick();
    await this.$input.fill(newText);
    if (confirm === "enter") {
      await this.$input.press("Enter");
    } else if (confirm === "blur") {
      await this.$input.blur();
    } else if (confirm === "escape") {
      await this.$input.press("Escape");
    }
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
