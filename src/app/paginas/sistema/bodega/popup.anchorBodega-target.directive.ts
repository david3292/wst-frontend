import { Directive, ElementRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[popupAnchor]',
    exportAs: 'popupAnchor'
})
export class PopupAnchorBodegaDirective {
    constructor(public element: ElementRef) { }
}
