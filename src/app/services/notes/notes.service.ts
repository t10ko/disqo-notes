import { Injectable } from '@angular/core';
import {RestApiService} from '@services/rest-api/rest-api.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {NotesState} from '@store/reducers/notes.reducers';
import {NoteEditableInfo, NoteInfo, NoteList} from '@store/actions/notes.actions';

import * as notesActions from '@store/actions/notes.actions';
import * as noteSelectors from '@store/selectors/notes.selectors';

import {Observable} from 'rxjs';

const restApiPrefix = 'notes';

@Injectable({
  providedIn: 'root'
})
export class NotesService extends RestApiService {
  areNotesLoaded$: Observable<boolean>;
  allNotes$: Observable<NoteList>;

  constructor(
    http: HttpClient,
    router: Router,
    private store: Store<NotesState>,
  ) {
    super(http, router);

    this.areNotesLoaded$ = store.select(noteSelectors.areLoaded);
    this.allNotes$ = store.select(noteSelectors.allNotes);
  }

  private async getNotes(searchStr = ''): Promise<NoteInfo[]> {
    return this.get<NoteInfo[]>(restApiPrefix, {q: searchStr});
  }

  private prepareNote(note: NoteInfo): NoteInfo {
    return {
      ...note,
      createdDate: new Date(note.createdDate),
    };
  }

  async loadAllNotes(): Promise<NoteList> {
    const allNotesList = await this.getNotes();
    const allNotes = allNotesList.reduce((res, item) => {
      res[item.id] = this.prepareNote(item);
      return res;
    }, {});
    this.store.dispatch(notesActions.loadAll(allNotes));
    return allNotes;
  }

  /**
   * Searches for notes and returns their IDs.
   */
  async searchForNotes(searchStr: string): Promise<number[]> {
    let notes = null;
    if (!searchStr) {
      const areLoaded = await this.areNotesLoaded$.toPromise();
      if (areLoaded) {
        notes = await this.allNotes$.toPromise();
      }
    }
    if (!notes) {
      notes = await this.getNotes(searchStr);
    }
    return notes.map(({id}) => id);
  }

  async createNote(noteInfo: NoteEditableInfo): Promise<NoteInfo> {
    const {title, text} = noteInfo;

    const newNote = await this.post<NoteInfo>(
      restApiPrefix,
      {
        title,
        text,
      },
    );
    const note = this.prepareNote(newNote);
    this.store.dispatch(notesActions.create(note));
    return note;
  }

  async updateNote(id: number, noteInfo: NoteEditableInfo): Promise<void> {
    const {title, text} = noteInfo;
    const changes = {title, text};

    await this.put<NoteInfo>(
      `${restApiPrefix}/${id}`,
      changes,
    );

    this.store.dispatch(notesActions.edit({
      id,
      noteInfo: {
        ...noteInfo,
        ...changes,
      },
    }));
  }

  async deleteNote(id: number): Promise<void> {
    await this.delete(`${restApiPrefix}/${id}`);

    this.store.dispatch(notesActions.remove({id}));
  }
}
