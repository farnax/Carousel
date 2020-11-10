'use strict';

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(name, func) {
    const event = this.events[name];
    if (event) event.push(func);
    else this.events[name] = [func];
  }

  emit(name, ...data) {
    const event = this.events[name];
    if (event) event.forEach(func => func(...data))
  }
}

module.exports = { EventEmitter };