import {forwardRef, Component, Host, View, EventEmitter, ElementRef} from 'angular2/angular2';

import {Ion} from '../ion';
import {IonicApp} from '../app/app';
import {IonicConfig} from '../../config/config';
import {IonicComponent} from '../../config/annotations';
import * as types from './extensions/types'
import * as gestures from  './extensions/gestures'
import * as util from 'ionic/util/util'
import {dom} from 'ionic/util'

/**
 * Aside is a side-menu navigation that can be dragged out or toggled to show. Aside supports two
 * display styles currently: overlay, and reveal. Overlay is the tradtional Android drawer style, and Reveal
 * is the traditional iOS style. By default, Aside will adjust to the correct style for the platform.
 */
@IonicComponent({
  selector: 'ion-aside',
  properties: [
    'content',
    'dragThreshold'
  ],
  defaultProperties: {
    'side': 'left',
    'type': 'reveal'
  },
  events: ['opening']
})
@View({
  template: '<ng-content></ng-content><ion-aside-backdrop></ion-aside-backdrop>',
  directives: [forwardRef(() => AsideBackdrop)]
})
export class Aside extends Ion {
  /**
  * TODO
  * @param {IonicApp} app  TODO
  * @param {ElementRef} elementRef  Reference to the element.
  */
  constructor(app: IonicApp, elementRef: ElementRef, config: IonicConfig) {
    super(elementRef, config);

    this.app = app;

    this.opening = new EventEmitter('opening');

    this.isOpen = false;
    this.openAmt = 0;

    this.contentClickFn = (e) => {
      console.log(e);
      if(!this.isOpen || this.isChanging) { return; }
      this.close();
    };
  }

  /**
   * TODO
   */
  onDestroy() {
    app.unregister(this);
  }

  /**
   * TODO
   */
  onInit() {
    super.onInit();
    this.contentElement = (this.content instanceof Node) ? this.content : this.content.getNativeElement();

    this._initGesture();
    this._initType();

    if(this.contentElement) {
      this.contentElement.addEventListener('click', this.contentClickFn);
    } else {
      console.error('Aside: must have a [content] element to listen for drag events on. Supply one like this:\n\n<ion-aside [content]="content"></ion-aside>\n\n<ion-content #content>');
    }
  }

  onDestroy() {
    //this.contentElement.removeEventListener('click', this.contentClickFn);
  }

  _initGesture() {
    switch(this.side) {
      case 'right':
        this._gesture = new gestures.RightAsideGesture(this);
        break;
      case 'left':
        this._gesture = new gestures.LeftAsideGesture(this);
        break;
    }
    this._targetGesture = new gestures.AsideTargetGesture(this);
  }

  _initType() {
    switch(this.type) {
      case 'reveal':
        this._type = new types.AsideTypeReveal(this);
        break;
      case 'overlay':
        this._type = new types.AsideTypeOverlay(this);
        break;
      case 'push':
        this._type = new types.AsideTypePush(this);
        break;
    }
  }

  /**
   * TODO
   * @return {Element} The Aside's content element.
   */
  getContentElement() {
    return this.contentElement;
  }

  /**
   * TODO
   * @param {TODO} v  TODO
   */
  setOpenAmt(v) {
    this.openAmt = v;
    this.opening.next(v);
  }

  /**
   * TODO
   * @param {boolean} willOpen  TODO
   */
  setDoneTransforming(willOpen) {
    this._type.setDoneTransforming(willOpen);
  }

  /**
   * TODO
   * @param {TODO} transform  TODO
   */
  setTransform(transform) {
    this._type.setTransform(transform)
  }

  /**
   * Sets the state of the Aside to open or not.
   * @param {boolean} isOpen  If the Aside is open or not.
   * @return {Promise} TODO
   */
  setOpen(isOpen) {
    console.log('Setting open', isOpen);
    this.setChanging(true);
    return this._type.setOpen(isOpen).then((isOpen) => {
      this.isOpen = isOpen;
      this.setOpenAmt(isOpen ? 1 : 0);
      this.setChanging(false);
    });
  }

  setChanging(isChanging) {
    this.isChanging = isChanging;
    if(isChanging) {
      this.getNativeElement().style.visibility = 'visible';
    }
  }

  /**
   * TODO
   * @return {TODO} TODO
   */
  open() {
    console.log('OPEN');
    return this.setOpen(true);
  }

  /**
   * TODO
   * @return {TODO} TODO
   */
  close() {
    return this.setOpen(false);
  }

  /**
   * TODO
   * @return {TODO} TODO
   */
  toggle() {
    return this.setOpen(!this.isOpen);
  }

}

/**
 * TODO
 */
@Component({
  selector: 'ion-aside-backdrop',
  host: {
    '[style.width]': 'width',
    '[style.height]': 'height',
    '[style.opacity]': 'opacity',
    '(click)': 'clicked($event)'
  }
})
@View({
  template: ''
})
export class AsideBackdrop extends Ion {
  /**
   * TODO
   * @param {ElementReg} elementRef  TODO
   * @param {IonicConfig} config  TODO
   * @param {Aside} aside  TODO
   */
  constructor(elementRef: ElementRef, config: IonicConfig, @Host() aside: Aside) {
    super(elementRef, config);

    aside.backdrop = this;

    this.aside = aside;

    this.opacity = 0;
  }

  /**
   * TODO
   */
  onInit() {
    let ww = window.innerWidth;
    let wh = window.innerHeight;
    this.width = ww + 'px';
    this.height = wh + 'px';
  }

  /**
   * TODO
   * @param {TODO} event  TODO
   */
  clicked(event) {
    this.aside.close();
  }
}
