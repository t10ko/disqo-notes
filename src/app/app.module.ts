import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomepageComponent} from './homepage/homepage.component';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NoteComponent} from './note/note.component';
import {ReactiveFormsModule} from '@angular/forms';
import {NoteFormComponent} from './note-form/note-form.component';
import {NotesService} from '@services/notes/notes.service';

function configureApp(
  notesService: NotesService,
): () => void {
  return async () => {
    await notesService.loadAllNotes();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    NoteComponent,
    NoteFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: configureApp,
      deps: [NotesService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
