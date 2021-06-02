import {createFeatureSelector, createSelector} from '@ngrx/store';
import {notesFeatureKey} from '@store/reducers/notes.reducers';
import {NotesState} from '@store/actions/notes.actions';

const authSel = createFeatureSelector<NotesState>(notesFeatureKey);

export const searchString = createSelector(authSel, (state: NotesState) =>
  state.searchString
);

export const allNotes = createSelector(authSel, (state: NotesState) =>
  state.allNotes
);

export const displayedNotes = createSelector(authSel, (state: NotesState) =>
  state.displayedNotes
);
