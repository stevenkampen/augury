import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: require('./app.component.html'),
  styleUrls: [require('to-string!./app.component.css')]
})
export class AppComponent {
  title = 'Augury Routes Demo';
  boolFlag = true;
}
