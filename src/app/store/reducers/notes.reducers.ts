import {createReducer, on} from '@ngrx/store';

import {hasOwn} from '../../helpers';

import * as authActions from '@store/actions/notes.actions';
import {NotesState} from '@store/actions/notes.actions';

export const notesFeatureKey = 'notes';

export const initialState: NotesState = {
  searchString: '',
  allNotes: [],
  displayedNotes: [],
};

export const reducer = createReducer(
  initialState,
  on(authActions.loadAll, (state, allNotes) => ({...state, allNotes})),
  on(authActions.search, (state, {searchString, displayedNotes}) => ({...state, searchString, displayedNotes})),
  on(authActions.create, (state, noteInfo) => ({...state, allNotes: {[noteInfo.id]: noteInfo, ...state.allNotes}})),
  on(authActions.startEditing, (state, {id}) => {
    const updatedNotes = {...state.allNotes};
    if (hasOwn(updatedNotes, id)) {
      updatedNotes[id] = {
        ...updatedNotes[id],
        isEditing: true,
      };
    }
    return {...state, allNotes: updatedNotes};
  }),
  on(authActions.saveEdited, (state, {id, noteInfo}) => {
    const updatedNotes = {...state.allNotes};
    if (hasOwn(updatedNotes, id)) {
      updatedNotes[id] = {
        ...updatedNotes[id],
        ...noteInfo,
        isEditing: false,
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
