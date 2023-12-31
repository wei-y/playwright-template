class BaseComponent {
  // This is the base class of all page components, which is a group of elements
  // that serves a certain function and can be reused.

  // Usually a component is a single parent element containing all sub-elements,
  // but in some cases, if viewing from functional point of view, it may need to
  // interact with some elements not in the parent, e.g. a pop-up dialog could
  // be in the <body> directly. In that case it's still possible to group those
  // elements into the component, since we keep a reference to the page itself
  // and another one to the parent of this componnent.

  constructor(locator, parent) {
    // the locator used to find this component. It is a `Locator` object
    this.$origin = locator;

    // reference to the parent component, if it is directly under the page, the
    // parent is the page itself
    this.parent = parent || locator.page();
  }
}

module.exports = { BaseComponent };
