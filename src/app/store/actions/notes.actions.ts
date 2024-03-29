import {createAction, props} from '@ngrx/store';

export interface NoteEditableInfo {
  title: string;
  text: string;
}

export interface NoteInfo extends NoteEditableInfo {
  id: number;
  createdDate: Date;
}

export const loadAll = createAction(
  '[Note] Load All',
  props<{
    noteList: NoteInfo[],
  }>(),
);

export const create = createAction(
  '[Note] Create',
  props<{
    note: NoteInfo,
  }>(),
);

export const edit = createAction(
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
