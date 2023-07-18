import {
  ComponentRef,
  Directive,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { CompileOption, ComponentInstance, DynamicCompileService, SafeAny } from './dynamic-compile.service';

/**
 * 动态编译组件和模块, 通常html属性只说设置一次,然后通过改变ctx来动态改变内容
 * @example
 * @Component({
 *   selector: 'app-dy',
 *   template: ``,
 *   styleUrls: ['./dy.component.less']
 * })
 * export class DemoComponent {
 *
 * }
 * ```html
 * <ng-container [dynamic-compile]="html" [data]="data"></ng-container>
 * ```
 *
 * ```ts
 *
 * data={list: [1,2,3]};
 * html = `<input type="text" *ngFor="let item of list" [value]="item">`;
 * html2 = `<input type="text" *ngFor="let item of data.list" [value]="item">`;
 * ```
 */
@Directive({
  selector: '[dynamic-compile]'
})
export class DynamicCompileDirective<T extends Record<string, SafeAny> = Record<string, SafeAny>>
  implements OnInit, OnChanges, OnDestroy
{
  private _html?: string;
  /**
   * html 模板
   */
  @Input('dynamic-compile') htmlAlias: CompileOption<T>['template'];
  /**
   * html 模板
   */
  @Input() html: CompileOption<T>['template'];
  /**
   * 组件选择器
   */
  @Input() selector?: CompileOption<T>['selector'];
  /**
   * 组件样式
   */
  @Input() styles?: CompileOption<T>['styles'];
  /**
   * 传递给模板的上下文, 可以直接在模板中访问属性, 也可以通过data访问里面的属性
   */
  @Input() data?: T;
  /**
   * 组件父类
   */
  @Input() parent?: CompileOption<T>['parent'];

  @Input() onCreated?: CompileOption<T>['onCreated'];
  /**
   * 组件生命周期onInit
   */
  @Input() onInit?: CompileOption<T>['onInit'];

  /**
   * 组件生命周期onDestroy
   */
  @Input() onDestroy?: CompileOption<T>['onDestroy'];
  /**
   * 发生错误处理函数
   */
  @Input() onError?: (error: Error) => void;

  /**
   * 模块配置, 默认导入了CommonModule
   */
  @Input() ngModule?: CompileOption<T>['ngModule'];

  /**
   * 是否自动清理掉上次渲染结果
   */
  @Input() autoClean?: boolean;
  private _componentRef: ComponentRef<ComponentInstance<T>> | null = null;
  private _moduleRef: NgModuleRef<SafeAny> | null = null;

  constructor(public container: ViewContainerRef, public dynamicCompile: DynamicCompileService) {}

  ngOnInit(): void {
    this.compileAttach();
  }

  ngOnChanges(changes: { [K in keyof this]?: SimpleChange } & SimpleChanges): void {
    if ((changes.html && !changes.html.isFirstChange()) || (changes.htmlAlias && !changes.htmlAlias.isFirstChange())) {
      if (this.autoClean !== false) {
        this.clear();
      }
      this.compileAttach();
    }

    if (changes.data && !changes.data.isFirstChange() && this._componentRef) {
      this._componentRef.instance.data = changes.data.currentValue;
    }
  }

  clear() {
    this.container.clear();
  }

  /**
   * 编译并加载到宿主元素
   */
  compileAttach() {
    this.ngOnDestroy();

    this._html = this.html || this.htmlAlias;
    if (this._html == null || this._html.trim() === '') {
      return;
    }

    try {
      const cm = this.dynamicCompile.compileAttach(this.container, {
        template: this._html,
        selector: this.selector,
        styles: this.styles,
        data: this.data,
        parent: this.parent,
        onInit: this.onInit,
        onDestroy: this.onDestroy,
        ngModule: this.ngModule
      });
      this._componentRef = cm.componentRef;
      this._moduleRef = cm.ngModuleRef;
    } catch (e) {
      if (this.onError == null) {
        throw e;
      } else {
        this.onError(e as Error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this._componentRef) {
      this._componentRef.destroy();
    }

    if (this._moduleRef) {
      this._moduleRef.destroy();
    }
  }
}
