import {ActionReducerMap, MetaReducer} from '@ngrx/store';

import {environment} from '@env';

import {reducer as notesReducer} from '@store/reducers/notes.reducers.js';
import {NotesState} from '@store/actions/notes.actions';

export interface State {
  notes: NotesState;
}

export const reducers: ActionReducerMap<State> = {
  notes: notesReducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
