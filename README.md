<h1 align="center">dynamic-compile</h1>

<p align="center">把字符串动态编译成`angular`组件</p>

<p align="center">
  <a aria-label="build status" href="https://npmjs.com/package/@xmagic/dynamic-compile'">
    <img alt="" src="https://img.shields.io/npm/v/@xmagic/dynamic-compile/latest.svg">
  </a>
  <a aria-label="last commit" href="https://www.github.com/angular/angular">
    <img alt="" src="https://img.shields.io/badge/Build%20with-Angular%20CLI-red?logo=angular">
  </a>

  <a aria-label="license" href="https://m310851010.github.io/dynamic-compile/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="">
  </a>
</p>

## Demo

[Live Demo](https://m310851010.github.io/dynamic-compile)

## Installation

### 1. Install

```
npm install @xmagic/dynamic-compile --save
```

### 2. 在 `angular.json` 中禁用 `aot`

```json
{
    "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json",

            // 此处改为 false
            "aot": false,

            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
    }
}
```

### 🔨 Usage

### import `DynamicCompileModule`。

```diff
import { DynamicCompileModule } from '@xmagic/dynamic-compile';

@NgModule({
  imports: [
+  DynamicCompileModule
  ],
  declarations: [TestComponent],
})
export class TestModule { }
```

### Code

```typescript
@Component({
  selector: 'app-test',
  template: `
    <ng-container [dynamic-compile]="html" [data]="this"></ng-container>
    <ng-container dynamic-compile [html]="html2" [data]="this"></ng-container>
    <div [dynamic-compile]="html" [data]="this" [parent]="parentClass"></div>
  `,
  styleUrls: ['./dy.component.less']
})
export class TestComponent {
  list = [1, 2, 3];
  html = `<input type="text" *ngFor="let item of list" [value]="item">`;
  html2 = `<input type="text" *ngFor="let item of data.list" [value]="item">`;
  parentClass = class TestParent implements OnInit, AfterViewInit {
    constructor(public injector: Injector) {}

    ngOnInit(): void {}
    ngAfterViewInit(): void {}
  };
}
```

## 生产打包

```bash
ng build --aot=false --build-optimizer=false
```

## API

### Inputs

| 属性              | 类型                                                                                     | 说明                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `dynamic-compile` | string                                                                                   | html 模板, 任选其一                                                          |
| `html`            | string                                                                                   | html 模板, 任选其一                                                          |
| `selector`        | string                                                                                   | 选择器,默认随机生成                                                          |
| `styles`          | string[]                                                                                 | 组件样式                                                                     |
| `data`            | any                                                                                      | 传递给模板的上下文, 可以直接在模板中访问属性, 也可以通过 data 访问里面的属性 |
| `parent`          | Type<any>                                                                                | 组件父类                                                                     |
| `onCreated`       | (this: ComponentInstance<T>, component: ComponentInstance<T>, data: DataInfo<T>) => void | 组件被创建时的回调函数                                                       |
| `onInit`          | (this: ComponentInstance<T>, component: ComponentInstance<T>, data: DataInfo<T>) => void | 组件生命周期 onInit                                                          |
| `onDestroy`       | (this: ComponentInstance<T>, component: ComponentInstance<T>, data: DataInfo<T>) => void | 组件生命周期 onDestroy                                                       |
| `onError`         | (error: Error) => void                                                                   | 发生错误处理函数                                                             |
| `ngModule`        | NgModule                                                                                 | 模块配置, 默认导入了 CommonModule                                            |

parent 类定义如下:

```typescript
class TestParent {
  constructor(public injector: Injector) {}
}
```

你可以实现 ng 的生命周期,例如:

```typescript
class TestParent implements OnInit, AfterViewInit {
  constructor(public injector: Injector) {}

  ngOnInit(): void {}
  ngAfterViewInit(): void {}
}
```

### License

The MIT License (see the [LICENSE](https://github.com/m310851010/dynamic-compile/blob/master/LICENSE) file for the full text)
