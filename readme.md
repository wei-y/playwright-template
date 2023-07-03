# Template using Playwright with Page Object pattern

## Introduction

This project demonstrate applying the Page Object pattern to Playwright. When running `npm init playwright@latest` to initialize a new Playwright project, it generates a demo test file in `tests-examples/demo-todo-app.spec.js`. This repo refactors this test file applying Page Object pattern to demonstrate how to use the pattern with Playwright.

Also, this project can be used as a template for any web app testing automation projects. It will need to remove the demo page definitions in `components`, `pages`, `services` and `tests`, plus any references of them.

- Use Page Object pattern
- Split test data and test logic (TBA)
- Define and use re-usable component
- Service layer handling business level description
- Allure report supported
- Dockerise test execution environment (TBA)
- A bunch of usful utilities

## Run the demo

Clone this repo and run the following to start the demo test.

```shell
# install dependencies
npm install

# install browsers
npx playwright install

# run tests
npx playwright test ./tests/demo-todo-app.spec.js

# view report
npx playwright show-report ./playwright-report
```

## Re-use the template

1. Copy the repo
2. Delete `todo.js` in `components`, `pages`, and `services`
3. Update `index.js` in directories above to remove the references to `todo.js` files
4. Detete `demo-todo-app.spec.js` in `tests`
5. Add your own components, pages, services, and tests, following the same pattern as in the `todo.*.js` files (details in next section).

## Test case patterns

### Define components

Components are a group of functionally related elements in pages sharing a commong container element, and usually appear more than once in one or multiple pages. In this template, todo item is a defined as a component.

Components are defined in the `components` directory and exported by the `components/index.js` file. Each component is defined as a class inheriting from `BaseComponent` in `components.js`. The base class is only a wrapper of the container element of the component. The container element can be accessed via `this.$origin`.

Inside the component class, it defines all sub-elements locators in the constructor, and add actions as member functions.

### Define pages

Similar to components, pages are defined in `pages` directory inheriting from `BasePage` class. The original Playwright page object can be accessed via `this.$origin`. Elements, components, and actions are defined in the page class. Since components are just wrappers of Playwright locators, they can be defined synchronously either in constructor or at runtime. All pages are exported by the `pages/index.js` file.

### Define services

Above the pages layer, there is a service layer which defines the business actions instead of page actions. In this demo it is unnecessary since the app is tiny. They exist only for demonstration. In real life, the benefits defining the service layer lies in a few points.

- It uses business language instead of UI language, so that it keeps tests cases less affected by the constant changing of UI. For an example, in the test we write `$app.newItem()` instead of `page.itemInput.fill()` and `page.addButton.click()`. When UI changes, we just need to re-define the page, test cases using the service layer are not affected
- It can unify the language we use in testing. In many cases, it is mainly doing CRUD operations of different items. We choose `newItem()`, `update()`, `remove()`, `read()`, and `isExisting()` as the function names for all items need CRUD. Any other functions can be added to each type of items
- The layer can be a integrated place for other functions other than page actions. Suppose we are doing E2E testing and there needs to run some back end or DB scripts preparing for testing. This layer would be the place defining these actions

Services are defined in the services directory, with each file defining a type of item with actions. Services are exported by `services/index.js` and is defined as a global variable `$app`. Testa cases should use `$app` to call actions as much as possible.

### Define test cases

## Utilities

### Test related

### Generate random data

### Browser related

### SSH/SCP to remote

### File handling

### Postgres query

### Generate random file (based on markdown)
