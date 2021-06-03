import { Injectable } from '@angular/core';
import {RestApiService} from '@services/rest-api/rest-api.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {NotesState} from '@store/reducers/notes.reducers';
import {NoteEditableInfo, NoteInfo, NoteList} from '@store/actions/notes.actions';

import * as notesActions from '@store/actions/notes.actions';
import * as notesSelectors from '@store/selectors/notes.selectors';

import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {objReduce} from '../../helpers';

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

    this.areNotesLoaded$ = store.select(notesSelectors.areLoaded);
    this.allNotes$ = store.select(notesSelectors.allNotes);
  }

  private static prepareNote(note: NoteInfo): NoteInfo {
    return {
      ...note,
      createdDate: new Date(note.createdDate),
    };
  }

  private async getNotes(searchStr = ''): Promise<NoteInfo[]> {
    return this.get<NoteInfo[]>(restApiPrefix, {q: searchStr});
  }

  async loadAllNotes(): Promise<NoteList> {
    const notesArr = await this.getNotes();
    const noteList = notesArr.reduce((res, item) => {
      res[item.id] = NotesService.prepareNote(item);
      return res;
    }, {});
    this.store.dispatch(notesActions.loadAll({noteList}));
    return noteList;
  }

  /**
   * Searches for notes and returns their IDs.
   */
  async searchForNotes(searchStr: string): Promise<number[]> {
    let noteIds: number[];
    if (!searchStr) {
      const areLoaded = await this.areNotesLoaded$
        .pipe(first())
        .toPromise();

      if (areLoaded) {
        const notes = await this.allNotes$
          .pipe(first())
          .toPromise();
        noteIds = objReduce<NoteInfo, number[]>(
          notes,
          (acc, note) => (acc.push(note.id), acc),
          []
        );
      }
    }

    if (!noteIds) {
      const notes = await this.getNotes(searchStr);
      noteIds = notes.map(({id}) => id);
    }
    return noteIds;
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
    const note = NotesService.prepareNote(newNote);
    this.store.dispatch(notesActions.create({note}));
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
