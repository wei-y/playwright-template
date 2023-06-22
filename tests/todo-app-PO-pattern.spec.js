// @ts-check
const { test, expect } = require("@playwright/test");
const $app = require("../services");
const $pages = require("../pages");

test.beforeEach(async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
});

const TODO_ITEMS = [
  "buy some cheese",
  "feed the cat",
  "book a doctors appointment",
];

test.describe("New Todo", () => {
  test("should allow me to add todo items", async ({ page }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
      const details = await $app.read(page, { name: item });
      expect(details).toEqual({
        completed: false,
        text: item,
        canToggle: true,
        canRemove: true,
      });
    }
  });

  test("should clear text input field when an item is added", async ({
    page,
  }) => {
    await $app.newItem(page, { text: TODO_ITEMS[0] });
    const details = await $app.read(page, { target: "page" });
    expect(details?.inputText).toEqual("");
  });

  test("should append new items to the bottom of the list", async ({
    page,
  }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
    }
    const details = await $app.read(page, { target: "page" });
    expect(details?.count).toEqual("3 items left");
  });
});

test.describe("Mark all as completed", () => {
  test.beforeEach(async ({ page }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
    }
  });

  test("should allow me to mark all items as completed", async ({ page }) => {
    await $app.complete(page, { target: "all" });
    for (const item of TODO_ITEMS) {
      const details = await $app.read(page, { name: item });
      expect(details).toEqual({
        completed: true,
        text: item,
        canToggle: true,
        canRemove: true,
      });
    }
  });

  test("should allow me to clear the complete state of all items", async ({
    page,
  }) => {
    await $app.complete(page, { target: "all" });
    await $app.uncomplete(page, { target: "all" });
    for (const item of TODO_ITEMS) {
      const details = await $app.read(page, { name: item });
      expect(details).toEqual({
        completed: false,
        text: item,
        canToggle: true,
        canRemove: true,
      });
    }
  });

  test("complete all checkbox should update state when items are completed / cleared", async ({
    page,
  }) => {
    await $app.complete(page, { target: "all" });
    let details = await $app.read(page, { target: "page" });
    expect(details?.allCompleted).toBeTruthy();

    await $app.uncomplete(page, { name: TODO_ITEMS[0] });
    details = await $app.read(page, { target: "page" });
    expect(details?.allCompleted).toBeFalsy();

    await $app.complete(page, { name: TODO_ITEMS[0] });
    details = await $app.read(page, { target: "page" });
    expect(details?.allCompleted).toBeTruthy();
  });
});

test.describe("Item", () => {
  test("should allow me to mark items as complete", async ({ page }) => {
    await $app.newItem(page, { text: TODO_ITEMS[0] });
    await $app.newItem(page, { text: TODO_ITEMS[1] });

    // Check first item.
    await $app.complete(page, { name: TODO_ITEMS[0] });
    let details = await $app.read(page, { target: "page" });
    expect(details?.items[0].completed).toBeTruthy();
    expect(details?.items[1].completed).toBeFalsy();

    // Check second item.
    await $app.complete(page, { name: TODO_ITEMS[1] });
    details = await $app.read(page, { target: "page" });
    expect(details?.items[0].completed).toBeTruthy();
    expect(details?.items[1].completed).toBeTruthy();
  });

  test("should allow me to un-mark items as complete", async ({ page }) => {
    await $app.newItem(page, { text: TODO_ITEMS[0] });
    await $app.newItem(page, { text: TODO_ITEMS[1] });

    await $app.complete(page, { name: TODO_ITEMS[0] });
    let details = await $app.read(page, { target: "page" });
    expect(details?.items[0].completed).toBeTruthy();
    expect(details?.items[1].completed).toBeFalsy();

    await $app.uncomplete(page, { name: TODO_ITEMS[0] });
    details = await $app.read(page, { target: "page" });
    expect(details?.items[0].completed).toBeFalsy();
    expect(details?.items[1].completed).toBeFalsy();
  });

  test("should allow me to edit an item", async ({ page }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
    }

    const newText = "buy some sausages";
    await $app.update(page, { name: TODO_ITEMS[1], newText });
    const details = await $app.read(page, { name: newText });
    expect(details?.text).toEqual(newText);
  });
});

test.describe("Editing", () => {
  test.beforeEach(async ({ page }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
    }
  });

  test("should hide other controls when editing", async ({ page }) => {
    const todoPage = new $pages.TodoPage(page);
    const item = todoPage.item(TODO_ITEMS[1]);
    await item.$text.dblclick();
    const details = await $app.read(page, { name: TODO_ITEMS[1] });
    expect(details).toEqual({
      completed: null,
      text: TODO_ITEMS[1],
      canToggle: false,
      canRemove: false,
    });
  });

  test("should save edits on blur", async ({ page }) => {
    const newText = "buy some sausages";
    await $app.update(page, {
      name: TODO_ITEMS[1],
      newText,
      confirm: "blur",
    });
    const details = await $app.read(page, { name: newText });
    expect(details?.text).toEqual(newText);
  });

  test("should trim entered text", async ({ page }) => {
    const newText = "buy some sausages";
    await $app.update(page, {
      name: TODO_ITEMS[1],
      newText: `    ${newText}    `,
    });
    const details = await $app.read(page, { name: newText });
    expect(details?.text).toEqual(newText);
  });

  test("should remove the item if an empty text string was entered", async ({
    page,
  }) => {
    const newText = "";
    await $app.update(page, { name: TODO_ITEMS[1], newText });
    const details = await $app.read(page, { target: "page" });
    const items = details?.items.map((item) => item.text);
    expect(items).toEqual([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test("should cancel edits on escape", async ({ page }) => {
    const newText = "buy some sausages";
    await $app.update(page, {
      name: TODO_ITEMS[1],
      newText,
      confirm: "escape",
    });
    const details = await $app.read(page, { name: TODO_ITEMS[1] });
    expect(details?.text).toEqual(TODO_ITEMS[1]);
  });
});

test.describe("Counter", () => {
  test("should display the current number of todo items", async ({ page }) => {
    await $app.newItem(page, { text: TODO_ITEMS[0] });
    let details = await $app.read(page, { target: "page" });
    expect(details?.count).toEqual("1 item left");

    await $app.newItem(page, { text: TODO_ITEMS[1] });
    details = await $app.read(page, { target: "page" });
    expect(details?.count).toEqual("2 items left");
  });
});

test.describe("Clear completed button", () => {
  test.beforeEach(async ({ page }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
    }
  });

  test("should display the correct text", async ({ page }) => {
    await $app.complete(page, { name: TODO_ITEMS[0] });
    const details = await $app.read(page, { target: "page" });
    expect(details?.canClearCompleted).toBeTruthy();
  });

  test("should remove completed items when clicked", async ({ page }) => {
    await $app.complete(page, { name: TODO_ITEMS[1] });
    await $app.clearCompleted(page);
    const details = await $app.read(page, { target: "page" });
    const items = details?.items.map((item) => item.text);
    expect(items).toEqual([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test("should be hidden when there are no items that are completed", async ({
    page,
  }) => {
    await $app.complete(page, { name: TODO_ITEMS[1] });
    await $app.clearCompleted(page);
    const details = await $app.read(page, { target: "page" });
    expect(details?.canClearCompleted).toBeFalsy();
  });
});

test.describe("Persistence", () => {
  test("should persist its data", async ({ page }) => {
    const expected = [
      {
        completed: true,
        text: TODO_ITEMS[0],
        canToggle: true,
        canRemove: true,
      },
      {
        completed: false,
        text: TODO_ITEMS[2],
        canToggle: true,
        canRemove: true,
      },
    ];

    await $app.newItem(page, { text: TODO_ITEMS[0] });
    await $app.newItem(page, { text: TODO_ITEMS[2] });
    await $app.complete(page, { name: TODO_ITEMS[0] });
    let details = await $app.read(page, { target: "page" });
    expect(details?.items).toEqual(expected);

    await page.reload();
    details = await $app.read(page, { target: "page" });
    expect(details?.items).toEqual(expected);
  });
});

test.describe("Routing", () => {
  test.beforeEach(async ({ page }) => {
    for (const item of TODO_ITEMS) {
      await $app.newItem(page, { text: item });
    }
  });

  test("should allow me to display active items", async ({ page }) => {
    await $app.complete(page, { name: TODO_ITEMS[1] });
    await $app.filterBy(page, { filter: "Active" });
    const details = await $app.read(page, { target: "page" });
    const items = details?.items.map((item) => item.text);
    expect(items).toEqual([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test("should respect the back button", async ({ page }) => {
    await $app.complete(page, { name: TODO_ITEMS[1] });

    await $app.filterBy(page, { filter: "All" });
    let details = await $app.read(page, { target: "page" });
    let items = details?.items.map((item) => item.text);
    expect(items).toEqual(TODO_ITEMS);

    await $app.filterBy(page, { filter: "Active" });

    await $app.filterBy(page, { filter: "Completed" });
    details = await $app.read(page, { target: "page" });
    items = details?.items.map((item) => item.text);
    expect(items).toEqual([TODO_ITEMS[1]]);

    await page.goBack();
    details = await $app.read(page, { target: "page" });
    items = details?.items.map((item) => item.text);
    expect(items).toEqual([TODO_ITEMS[0], TODO_ITEMS[2]]);

    await page.goBack();
    details = await $app.read(page, { target: "page" });
    items = details?.items.map((item) => item.text);
    expect(items).toEqual(TODO_ITEMS);
  });

  test("should allow me to display completed items", async ({ page }) => {
    await $app.complete(page, { name: TODO_ITEMS[1] });
    await $app.filterBy(page, { filter: "Completed" });
    const details = await $app.read(page, { target: "page" });
    const items = details?.items.map((item) => item.text);
    expect(items).toEqual([TODO_ITEMS[1]]);
  });

  test("should allow me to display all items", async ({ page }) => {
    await $app.complete(page, { name: TODO_ITEMS[1] });
    await $app.filterBy(page, { filter: "Active" });
    await $app.filterBy(page, { filter: "Completed" });
    await $app.filterBy(page, { filter: "All" });
    const details = await $app.read(page, { target: "page" });
    const items = details?.items.map((item) => item.text);
    expect(items).toEqual(TODO_ITEMS);
  });

  test("should highlight the currently applied filter", async ({ page }) => {
    let details = await $app.read(page, { target: "page" });
    expect(details?.currentFilter).toEqual("All");

    await $app.filterBy(page, { filter: "Active" });
    details = await $app.read(page, { target: "page" });
    expect(details?.currentFilter).toEqual("Active");

    await $app.filterBy(page, { filter: "Completed" });
    details = await $app.read(page, { target: "page" });
    expect(details?.currentFilter).toEqual("Completed");
  });
});
