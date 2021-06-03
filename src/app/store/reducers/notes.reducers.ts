import {createReducer, on} from '@ngrx/store';

import {NoteList} from '@store/actions/notes.actions';
import * as authActions from '@store/actions/notes.actions';

import {hasOwn} from '../../helpers';

export const notesFeatureKey = 'notes';

export interface NotesState {
  areLoaded: boolean;
  allNotes: NoteList;
}

export const initialState: NotesState = {
  areLoaded: false,
  allNotes: [],
};

export const reducer = createReducer(
  initialState,
  on(authActions.loadAll, (state, allNotes) => ({...state, allNotes, areLoaded: true})),
  on(authActions.create, (state, noteInfo) => ({...state, allNotes: {[noteInfo.id]: noteInfo, ...state.allNotes}})),
  on(authActions.edit, (state, {id, noteInfo}) => {
    const updatedNotes = {...state.allNotes};
    if (hasOwn(updatedNotes, id)) {
      updatedNotes[id] = {
        ...updatedNotes[id],
        ...noteInfo,
      };
    }
    return {...state, notes: updatedNotes};
  }),
  on(authActions.remove, (state, {id}) => {
    const updatedNotes = {...state.allNotes};
    delete updatedNotes[id];
    return {...state, notes: updatedNotes};
  }),
);
