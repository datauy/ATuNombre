export default class Accordion {
  constructor (container) {
    this.container = container;
  }

  children() {
    return this.container.children;
  }

  initialize() {
    [].forEach.call(this.container.children, (child) => {
      if (!child.hasAttribute('closed') && !child.hasAttribute('open')) {
        this.closeItem(child);
      }
    });
  }

  closeItem(item) {
    let itemBody = item.querySelector('*[data-accordion-item-body]');
    if (!item.hasAttribute('closed')) {
      item.setAttribute('closed', true);
      if (item.hasAttribute('open')) {
        item.removeAttribute('open');
      }
      if (itemBody) {
        itemBody.style.display = 'none';
      }
    }
  }

  openItem(item) {
    let itemBody = item.querySelector('*[data-accordion-item-body]');
    if (!item.hasAttribute('open')) {
      item.setAttribute('open', true);
      if (item.hasAttribute('closed')) {
        item.removeAttribute('closed');
      }
      if (itemBody) {
        itemBody.style.display = null;
      }
    }
  }
}
