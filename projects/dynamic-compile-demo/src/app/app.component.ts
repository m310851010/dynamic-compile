import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  link = 'https://github.com/m310851010/dynamic-compile';
  title = 'dynamic-compile-demo';
  list: string[] = [];
  template = `
      <ul>
        <li *ngFor="let value of data.list; index as index; key as key; count as c">
          <span>{{ index }}/{{ c }}. {{ key }}: {{ value }}</span> <button (click)="showAlert(value)">alert</button>
        </li>
      </ul>`;
  text = `["张三", "李四", "王五"]`;
  message = '';

  constructor() {
    this.onTextChange(this.text);
  }

  onTextChange(text: string) {
    this.message = '';
    try {
      this.list = JSON.parse(text);
    } catch (e) {
      this.message = e.message;
    }
  }

  showAlert(value: string) {
    alert(value);
  }
}
