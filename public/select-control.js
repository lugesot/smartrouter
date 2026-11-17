let nextId = 0;

// Shared by the React pages and the standalone /dataflow document.
export function enhanceSelect(host) {
  const select = host.querySelector('select');
  if (!select) return { sync() {}, destroy() {} };
  const id = `smart-select-${++nextId}`;
  const abort = new AbortController();
  const listen = (node, event, callback, extra = {}) => node.addEventListener(event, callback, { ...extra, signal: abort.signal });
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ui-select__trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', id);
  const label = document.createElement('span');
  label.className = 'ui-select__value';
  trigger.append(label);
  const menu = document.createElement('div');
  menu.id = id;
  menu.className = 'ui-select__menu';
  menu.setAttribute('role', 'listbox');
  const nativePopover = 'popover' in HTMLElement.prototype;
  if (nativePopover) menu.setAttribute('popover', 'auto');
  else menu.hidden = true;
  host.append(trigger, menu);
  host.dataset.enhanced = '';
  let opened = false, active = -1, search = '', searchTimer;
  const options = () => Array.from(select.options);

  function position() {
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 160), window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    // Always below the control; constrained height scrolls instead of covering it.
    menu.style.setProperty('--select-left', `${left}px`);
    menu.style.setProperty('--select-top', `${rect.bottom + 8}px`);
    menu.style.setProperty('--select-width', `${width}px`);
    menu.style.setProperty('--select-height', `${Math.max(0, Math.min(300, window.innerHeight - rect.bottom - 20))}px`);
  }
  function highlight(index) {
    active = index;
    Array.from(menu.children).forEach((item, i) => item.classList.toggle('is-active', i === active));
    if (opened && active >= 0) {
      trigger.setAttribute('aria-activedescendant', `${id}-${active}`);
      menu.children[active]?.scrollIntoView({ block: 'nearest' });
    }
  }
  function close() {
    opened = false;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    if (nativePopover) { if (menu.matches(':popover-open')) menu.hidePopover(); }
    else menu.hidden = true;
  }
  function sync() {
    const items = options();
    label.textContent = items[select.selectedIndex]?.textContent || '';
    trigger.disabled = select.disabled;
    const name = select.getAttribute('aria-label') || select.name || '';
    trigger.setAttribute('aria-label', `${name}：${label.textContent}`);
    menu.setAttribute('aria-label', name);
    menu.replaceChildren();
    items.forEach((option, index) => {
      const item = document.createElement('div');
      item.id = `${id}-${index}`;
      item.className = 'ui-select__option';
      item.textContent = option.textContent;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(index === select.selectedIndex));
      item.setAttribute('aria-disabled', String(option.disabled));
      item.dataset.index = String(index);
      menu.append(item);
    });
    highlight(select.selectedIndex);
    if (opened) position();
  }
  function open() {
    if (select.disabled) return;
    sync();
    position();
    if (nativePopover) menu.showPopover();
    else menu.hidden = false;
    opened = true;
    trigger.setAttribute('aria-expanded', 'true');
    highlight(select.selectedIndex >= 0 ? select.selectedIndex : 0);
  }
  function choose(index) {
    const option = options()[index];
    if (!option || option.disabled) return;
    select.value = option.value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    sync();
    trigger.focus();
  }
  function move(step) {
    const items = options();
    let index = active;
    for (let count = 0; count < items.length; count++) {
      index = (index + step + items.length) % items.length;
      if (!items[index].disabled) { highlight(index); break; }
    }
  }
  listen(trigger, 'click', () => opened ? close() : open());
  listen(trigger, 'keydown', event => {
    if (event.key === 'Tab') { close(); return; }
    if (event.key === 'Escape') { if (opened) { event.preventDefault(); close(); } return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!opened) open(); else move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (search && event.key === ' ') return;
      event.preventDefault();
      if (opened) choose(active); else open();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); if (!opened) open();
      const enabled = options().map((o, i) => o.disabled ? -1 : i).filter(i => i >= 0);
      highlight(event.key === 'Home' ? enabled[0] : enabled.at(-1));
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); if (!opened) open();
      search += event.key.toLocaleLowerCase();
      clearTimeout(searchTimer); searchTimer = setTimeout(() => { search = ''; }, 600);
      const match = options().findIndex(o => !o.disabled && o.textContent.trim().toLocaleLowerCase().startsWith(search));
      if (match >= 0) highlight(match);
    }
  });
  listen(menu, 'pointerdown', event => event.preventDefault());
  listen(menu, 'click', event => {
    const item = event.target.closest('[data-index]');
    if (item) choose(Number(item.dataset.index));
  });
  listen(menu, 'toggle', event => { if (event.newState === 'closed') { opened = false; trigger.setAttribute('aria-expanded', 'false'); trigger.removeAttribute('aria-activedescendant'); } });
  listen(document, 'pointerdown', event => { if (opened && !host.contains(event.target)) close(); });
  listen(trigger, 'blur', close);
  listen(select, 'change', () => queueMicrotask(sync));
  listen(window, 'resize', () => { if (opened) position(); });
  listen(window, 'scroll', () => { if (opened) position(); }, { capture: true, passive: true });
  listen(select.form || document, 'reset', () => queueMicrotask(sync));
  const observer = new MutationObserver(sync);
  observer.observe(select, { childList: true, subtree: true, characterData: true, attributes: true });
  sync();
  return { sync, destroy() { close(); abort.abort(); observer.disconnect(); clearTimeout(searchTimer); trigger.remove(); menu.remove(); delete host.dataset.enhanced; } };
}
