import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DynamicCompileModule } from '@xmagic/dynamic-compile';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DynamicCompileModule, FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
