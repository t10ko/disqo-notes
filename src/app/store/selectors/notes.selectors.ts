import {createFeatureSelector, createSelector} from '@ngrx/store';
import {notesFeatureKey, NotesState} from '@store/reducers/notes.reducers';

const authSel = createFeatureSelector<NotesState>(notesFeatureKey);

export const areLoaded = createSelector(authSel, (state: NotesState) =>
  state.areLoaded
);

export const allNotes = createSelector(authSel, (state: NotesState) =>
  state.allNotes
);
