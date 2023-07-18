import {
  AfterContentInit,
  Component,
  createNgModuleRef,
  ElementRef,
  Injectable,
  Injector,
  Input,
  NgModule,
  OnDestroy,
  Type,
  ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * 获取下一个id
 */
export function getNextId() {
  // @ts-ignore
  if (!window.DYNAMIC_NEXT_ID) {
    // @ts-ignore
    window.DYNAMIC_NEXT_ID = 1;
  }
  // @ts-ignore
  return `dynamic-component-${window.DYNAMIC_NEXT_ID++}`;
}

@Injectable()
export class DynamicCompileService {
  /**
   * 编译并挂载到view
   * @param container 容器
   * @param option 组件模板和模块配置
   */
  compileAttach<T extends Record<string, SafeAny>>(container: ViewContainerRef, option: CompileOption<T>) {
    const cm = this.compile(container.injector, option);
    // @ts-ignore
    const componentRef = container.createComponent<ComponentInstance<T>>(cm.componentType, {
      ngModuleRef: cm.ngModuleRef,
      injector: container.injector
    });
    return { componentRef, ngModuleRef: cm.ngModuleRef };
  }

  /**
   * 编译html模板
   * @param injector 注入器
   * @param option 组件模板和模块配置
   */
  compile<T extends Record<string, SafeAny>>(injector: Injector, option: CompileOption<T>) {
    const ngModule = option.ngModule || {};
    const componentType = this.createComponentType(option);
    const moduleType = this.createNgModuleType({
      ...ngModule,
      declarations: (ngModule.declarations || []).concat([componentType])
    });
    const ngModuleRef = createNgModuleRef(moduleType, injector);
    return { componentType, moduleType, ngModuleRef };
  }

  /**
   * 创建组件Class
   * @param option
   */
  createComponentType<T extends Record<string, SafeAny>>(option: ComponentOption<T>): Type<CompileOption<T>> {
    const parent = option.parent || class {};
    const selector = option.selector || getNextId();
    // noinspection AngularMissingOrInvalidDeclarationInModule
    @Component({ ...option, selector } as ComponentOption<T>)
    class C extends parent implements AfterContentInit, OnDestroy {
      @Input() data: T;
      elementRef: ElementRef<HTMLDivElement>;

      constructor(public injector: Injector) {
        super(injector);
        this.data = option.data == null ? ({} as T) : option.data;
        // @ts-ignore
        this.data.injector = injector;
        this.elementRef = injector.get(ElementRef);
        // @ts-ignore
        this.data.elementRef = this.elementRef;
        this.elementRef.nativeElement.setAttribute('id', selector);

        if (option.onCreated) {
          // @ts-ignore
          option.onCreated.call(this, this, this.data);
        }
      }

      ngAfterContentInit(): void {
        super.ngAfterContentInit?.();
        if (option.onInit) {
          // @ts-ignore
          option.onInit.call(this, this, this.data);
        }
      }

      ngOnDestroy(): void {
        super.ngOnDestroy?.();
        if (option.onDestroy) {
          // @ts-ignore
          option.onDestroy.call(this, this, this.data);
        }
      }
    }

    if (option.data) {
      const hooks = [
        'constructor',
        'ngOnInit',
        'ngDoCheck',
        'ngAfterContentInit',
        'ngAfterContentChecked',
        'ngAfterViewChecked',
        'ngAfterViewInit',
        'ngOnDestroy',
        'ngOnChanges'
      ];
      Object.assign(C.prototype, option.data);
      const props = Object.getPrototypeOf(option.data);
      if (props) {
        Object.getOwnPropertyNames(props).forEach(name => {
          if (hooks.indexOf(name) < 0) {
            C.prototype[name] = props[name];
          }
        });
      }
    }
    return C;
  }

  /**
   * 创建NgModule Class
   * @param option
   */
  createNgModuleType(option: NgModule): Type<SafeAny> {
    @NgModule({ ...option, imports: (option.imports || []).concat([CommonModule]) })
    class M {}
    return M;
  }
}

export type DataInfo<T> = T & {
  /**
   * 当前注入器
   */
  injector: Injector;
  /**
   * 当前组件DOM元素
   */
  elementRef: ElementRef<HTMLDivElement>;
};

export type ComponentOption<T extends Record<string, SafeAny>> = Omit<Component, 'templateUrl'> & {
  /**
   * 设置父类
   */
  parent?: Type<any>;
  /**
   * 传给组件的上下文
   */
  data?: T;
  onCreated?: (this: ComponentInstance<T>, component: ComponentInstance<T>, data: DataInfo<T>) => void;
  onInit?: (this: ComponentInstance<T>, component: ComponentInstance<T>, data: DataInfo<T>) => void;
  onDestroy?: (this: ComponentInstance<T>, component: ComponentInstance<T>, data: DataInfo<T>) => void;
};

/**
 * 组件实例
 */
/**
 * 组件实例
 */
export type ComponentInstance<T extends Record<string, SafeAny>> = {
  [prop in keyof T]: T[prop];
} & {
  /**
   * 当前注入器
   */
  injector: Injector;
  /**
   * 当前组件DOM元素
   */
  elementRef: ElementRef<HTMLDivElement>;
  /**
   * 传给组件的数据
   */
  data: T;
};

/**
 * 编译组件配置项
 */
export type CompileOption<T> = ComponentOption<T> & { ngModule?: NgModule };

// ts-ignore
export type SafeAny = any;
