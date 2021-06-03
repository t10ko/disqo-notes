import {createReducer, on} from '@ngrx/store';

import {NoteInfo} from '@store/actions/notes.actions';
import * as authActions from '@store/actions/notes.actions';
import {removeFrom} from '../../helpers';

export const notesFeatureKey = 'notes';

export interface NotesState {
  areLoaded: boolean;
  allNotes: NoteInfo[];
}

export const initialState: NotesState = {
  areLoaded: false,
  allNotes: [],
};

export const reducer = createReducer(
  initialState,
  on(authActions.loadAll, (state, {noteList: allNotes}) => ({...state, allNotes, areLoaded: true})),
  on(authActions.create, (state, {note: noteInfo}) => ({...state, allNotes: [noteInfo, ...state.allNotes]})),
  on(authActions.edit, (state, {id, noteInfo}) => {
    const allNotes = [...state.allNotes];
    allNotes.some((note, i) => {
      const found = note.id === id;
      if (found) {
        allNotes[i] = {
          ...note,
          ...noteInfo,
        };
      }
      return found;
    });
    return {...state, allNotes};
  }),
  on(authActions.remove, (state, {id}) => {
    const allNotes = [...state.allNotes];
    allNotes.some((note, i) => {
      const found = note.id === id;
      if (found) {
        removeFrom(allNotes, i);
      }
      return found;
    });
    return {...state, allNotes};
  }),
);
