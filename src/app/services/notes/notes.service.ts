import { Injectable } from '@angular/core';
import {RestApiService} from '@services/rest-api/rest-api.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {NoteEditableInfo, NoteInfo, NoteList} from '@store/actions/notes.actions';

const restApiPrefix = 'notes';

@Injectable({
  providedIn: 'root'
})
export class NotesService extends RestApiService {

  constructor(
    http: HttpClient,
    router: Router,
  ) {
    super(http, router);
  }

  private async getNotes(searchStr = ''): Promise<NoteList> {
    const list = await this.get<NoteInfo[]>(restApiPrefix, {q: searchStr});

    return list.reduce((res, item) => {
      res[item.id] = {
        ...item,
        createdDate: new Date(item.createdDate),
      };
      return res;
    }, {});
  }

  async getAllNotes(): Promise<NoteList> {
    const allNotes = await this.getNotes();
    //  TODO: update the list in the state.
    return allNotes;
  }

  async searchForNotes(searchStr: string): Promise<NoteList> {
    const displayedNotes = await this.getNotes(searchStr);
    //  TODO: update the list in the state.
    return displayedNotes;
  }

  async createNote(noteInfo: NoteEditableInfo): Promise<NoteInfo> {
    const {title, text} = noteInfo;

    return this.post<NoteInfo>(
      restApiPrefix,
      {
        title,
        text,
      },
    );
  }

  async updateNote(id: number, noteInfo: NoteEditableInfo): Promise<NoteInfo> {
    const {title, text} = noteInfo;

    const note = await this.put<NoteInfo>(
      `${restApiPrefix}/${id}`,
      {
        title,
        text,
      },
    );
    //  TODO: add isEditing flag switching back here
    return note;
  }

  async deleteNote(id: number): Promise<void> {
    await this.delete(`${restApiPrefix}/${id}`);
  }
}
