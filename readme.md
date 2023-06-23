# Template using Playwright with Page Object pattern

## Introduction

This template applies the Page Object pattern to Playwright. It refactored `tests-examples/demo-todo-app.spec.js` come with running `npm init playwright@latest`. The template is re-usable by removing the demo app related file (and references). Feature in this template:

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

### Define pages

### Define services

### Define test cases

## Utilities

### Test related

### Generate random data

### Browser related

### SSH/SCP to remote

### File handling

### Postgres query

### Generate random file (based on markdown)
