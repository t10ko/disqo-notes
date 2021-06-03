import {createAction, props} from '@ngrx/store';

export interface NoteEditableInfo {
  title: string;
  text: string;
  isEditing: boolean;
}

export interface NoteInfo extends NoteEditableInfo {
  id: number;
  createdDate: Date;
}

export type NoteList = {[key: number]: NoteInfo};

export interface NotesState {
  searchString: string;
  allNotes: NoteList;
  displayedNotes: NoteList;
}

export const loadAll = createAction(
  '[Note] Load All',
  props<NoteList>(),
);

export const search = createAction(
  '[Note] Search',
  props<{
    searchString: string;
    displayedNotes: NoteList,
  }>(),
);

export const create = createAction(
  '[Note] Create',
  props<NoteInfo>(),
);

export const startEditing = createAction(
  '[Note] Start Editing',
  props<{
    id: number;
  }>(),
);

export const saveEdited = createAction(
  '[Note] Save Edited',
  props<{
    id: number;
    noteInfo: NoteEditableInfo;
  }>(),
);

export const remove = createAction(
  '[Note] Remove',
  props<{
    id: number,
  }>(),
);
