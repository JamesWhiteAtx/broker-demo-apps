import { Component, OnInit, Input } from '@angular/core';

export interface HasLabel {
  label: string;
}

export class LabelDescr implements HasLabel {
  public label: string;
  public descr: string;
}

export class Decoded implements HasLabel {
  constructor(
    public label: string,
    public encoded: string,
    public values: (LabelDescr | Decoded)[] = [],
    public errors?: LabelDescr[]) {   
  }  
}

@Component({
  selector: 'demo-decoded',
  templateUrl: '../shared/decode.component.html',
  directives: [DecodeComponent]
})
export class DecodeComponent {
  public showValues: boolean = true;

  @Input() source: Decoded;

  constructor() {
  }

  ngOnInit() {
  }

  toggle() {
    this.showValues = ! this.showValues;
    return false;
  }  
}