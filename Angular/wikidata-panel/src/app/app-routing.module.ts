import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditModeComponent } from './edit-mode/edit-mode.component';
import { LoadingModeComponent } from './loading-mode/loading-mode.component';
import { ClickableSpanComponent } from './clickable-span/clickable-span.component';

const routes: Routes = [
  { path: '', component: LoadingModeComponent},
  { path: 'edit', component: EditModeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoadingModeComponent, EditModeComponent, ClickableSpanComponent]