import { NgModule } from '@angular/core';
import { DynamicCompileService } from './dynamic-compile.service';
import { DynamicCompileDirective } from './dynamic-compile.directive';

@NgModule({
  imports: [],
  exports: [DynamicCompileDirective],
  declarations: [DynamicCompileDirective],
  providers: [DynamicCompileService]
})
export class DynamicCompileModule {}
