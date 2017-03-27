import tap from 'tap';
import {jsdom} from 'jsdom';
import Accordion from './accordion';

tap.test('The accordion module should exist', (t) => {
  t.ok(Accordion);
  t.end();
});

tap.test('An accordion module instance', (t) => {
  let markup = `<div data-accordion></div>`;
  let window = jsdom(markup).defaultView;
  let accordionElement = window.document.querySelector('div[data-accordion]');
  let accordion = new Accordion(accordionElement);
  t.ok(accordion.container.hasAttribute('data-accordion'), 'container property is defined');
  t.ok(accordion.container.hasAttribute('data-accordion'), 'container property contains a data-accordion element');
  t.end();
});

tap.test('Accordion module instance children method', (t) => {
  let markup = `
    <div data-accordion>
      <div data-accordion-item></div>
    </div>
  `;
  let window = jsdom(markup).defaultView;
  let accordionElement = window.document.querySelector('div[data-accordion]');
  let accordion = new Accordion(accordionElement);
  t.ok(accordion.children, 'is defined');
  t.same(accordion.children(), accordionElement.children, 'returns container children');
  t.end();
});

tap.test('Accordion module instance initialize method', (t) => {
  let markup = `
    <div data-accordion>
      <div data-accordion-item>
        <div data-accordion-item-body></div>
      </div>
    </div>
  `;
  let window = jsdom(markup).defaultView;
  let accordionElement = window.document.querySelector('div[data-accordion]');
  let accordion = new Accordion(accordionElement);
  t.ok(accordion.initialize, 'is defined');
  accordion.initialize();
  t.ok(accordionElement.children[0].hasAttribute('closed'), 'mark accordion items as closed');
  t.end();
});

tap.test('Accordion module instance closeItem method', (t) => {
  let markup = `
    <div data-accordion-item>
      <div data-accordion-item-body></div>
    </div>
    <div data-accordion-item open></div>
  `;
  let window = jsdom(markup).defaultView;
  let accordionItemElements = window.document.querySelectorAll('div[data-accordion-item]');
  let itemBody = accordionItemElements[0].querySelector('*[data-accordion-item-body]');
  let accordion = new Accordion();
  t.ok(accordion.closeItem, 'is defined');
  accordion.closeItem(accordionItemElements[0]);
  accordion.closeItem(accordionItemElements[1]);
  t.ok(accordionItemElements[0].hasAttribute('closed'), 'mark accordion item closed');
  t.ok(accordionItemElements[1].hasAttribute('closed'), 'mark bodyless accordion item closed');
  t.equal(itemBody.style.display, 'none', 'hides accordion item body when present');
  t.end();
});

tap.test('Accordion module instance openItem method', (t) => {
  let markup = `
    <div data-accordion-item>
      <div data-accordion-item-body style="display: none;"></div>
    </div>
    <div data-accordion-item closed></div>
  `;
  let window = jsdom(markup).defaultView;
  let accordionItemElements = window.document.querySelectorAll('div[data-accordion-item]');
  let itemBody = accordionItemElements[0].querySelector('*[data-accordion-item-body]');
  let accordion = new Accordion();
  t.ok(accordion.openItem, 'is defined');
  accordion.openItem(accordionItemElements[0]);
  accordion.openItem(accordionItemElements[1]);
  t.ok(accordionItemElements[0].hasAttribute('open'), 'mark accordion item open');
  t.ok(accordionItemElements[1].hasAttribute('open'), 'mark bodyless accordion item open');
  t.notEqual(itemBody.style.display, 'none', 'hides accordion item body when present');
  t.end();
});
