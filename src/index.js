'use strict';

import { EventEmitter } from './eventEmitter.js';
import { elems } from './data.js';
import './main.css';

const transformRegExp = new RegExp('[-0-9.]+(?=px)');

const getElemWidth = elem => {
  const width = window.getComputedStyle(elem,null).width;
  const numb = +width.substring(0, width.length - 2);
  return +numb.toFixed(2);
};

const slide = (elem, startElemWidth, length) => {
  let transition = '1.5s';
  let transform = elem.style.transform.match(transformRegExp)[0];
  let index = 0;
  
  return direction => {
    if (direction === 'btn_prev') {
      if (index === 0) {
        transform = -Number((startElemWidth * (length - 1)).toFixed(2));
        index = length - 1;

      } else {
        transform = +(transform + startElemWidth ).toFixed(2);
        index--;
      }
    } else if (direction === 'btn_next') {
      if (index === length - 1) {
        transform = 0;
        index = 0;

      } else {
        transform = transform - startElemWidth;
        index++;
      }
    }

    elem.style.transform = `translateX(${transform}px)`;
  }
};

const getEvent = () => event.type.includes('touch') ? event.touches[0] : event;

class Swipe {
  constructor(content, transform) {
    this.startX = 0;
    this.offsetX = 0;
    this.finishX = 0;
    this.content = content;
    this.transform = transform;
    this.prev = 'btn_prev';
    this.next = 'btn_next';
  }

  swipeStart() {
    const event = getEvent();
    this.startX = event.clientX;

    this.content.addEventListener('click', () => this._swipe());
    this.content.addEventListener('mouseup', () => this._swipeEnd());
    this.content.addEventListener('touchmove', () => this._swipe());
    this.content.addEventListener('touchend', () => this._swipeEnd());
  }

  _swipe() {
    const event = getEvent();
    this.finishX = event.clientX;
  }

  _swipeEnd() {
    this.content.removeEventListener('click', () => this._swipe());
    this.content.removeEventListener('mouseup', () => this._swipeEnd());
    this.content.removeEventListener('touchmove', () => this._swipe());
    this.content.removeEventListener('touchend', () => this._swipeEnd());

    this.offsetX = this.finishX - this.startX;

    if (this.offsetX < 0) {
      this.transform(this.prev);
    } else if (this.offsetX > 0 ) {
      this.transform(this.next);
    }

    this.startX = 0;
    this.offsetX = 0;
    this.finishX = 0;
  }
}

class Carousel {
  constructor(interval, carousel, contentElements) {
    this.ee = new EventEmitter();
    this.carousel = document.querySelector(carousel);

    this.content = null;
    this.contentElements = contentElements;
    
    this.autoEvent = 'autoChange';
    this.interval = interval;
    this.next = 'btn_next';
    
    this.btn = null;
    this.transform = null;
  }

  createInterfase() {
    const carousel_list = document.createElement('div');
    carousel_list.className = 'carousel_list';
    this.carousel.appendChild(carousel_list);

    this.content = document.createElement('div');
    this.content.className = 'carousel_content';
    carousel_list.appendChild(this.content);

    this.contentElements.forEach(elem => {
      const wrapper = document.createElement('div');
      wrapper.className = 'element';
      wrapper.innerHTML = elem;
      this.content.appendChild(wrapper);
    });

    this.btn = document.createElement('div');
    this.btn.className = 'carousel_btn';
    this.carousel.appendChild(this.btn);

    const btnPrev = document.createElement('button');
    btnPrev.className = 'btn_prev';
    btnPrev.innerHTML = '&larr;';
    const btnNext = document.createElement('button');
    btnNext.className = 'btn_next';
    btnNext.innerHTML = '&rarr;';
    this.btn.appendChild(btnPrev);
    this.btn.appendChild(btnNext);

    return this;
  }

  startCarousel() {
    const contentWidth = getElemWidth(this.content);
    this.content.style.transform = `translateX(0px)`;
    this.content.style.transition = 'transform 1.5s';
    this.transform = slide(this.content, contentWidth, this.contentElements.length);

    return this;
  }

  autoChange() {
    setInterval(() => {
      this.ee.emit(this.autoEvent, this.next);
    }, this.interval);

    setTimeout(() => this.ee.on(this.autoEvent, direction => this.transform(direction)),
      this.interval * 4
    );
    return this;
  }

  btnChange() {
    this.btn.addEventListener('click', () => this.transform(event.target.className));
    return this;
  }
  
  swipeChange() {
    const swipe = new Swipe(this.content, this.transform);

    this.content.addEventListener('mousedown', () => swipe.swipeStart());
    this.content.addEventListener('touchstart', () => swipe.swipeStart());
    return this;
  }
}

const carousel = new Carousel(10000, '.carousel', elems)
      .createInterfase()
      .startCarousel()
      .autoChange()
      .btnChange()
      .swipeChange();