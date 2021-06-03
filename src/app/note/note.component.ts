import {Component, Input, OnInit} from '@angular/core';
import {faTrash, faPen} from '@fortawesome/free-solid-svg-icons';
import {NoteInfo} from '@store/actions/notes.actions';
import {NotesService} from '@services/notes/notes.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  @Input() note: NoteInfo;
  @Input() containerClass = '';

  isEditing = false;

  faTrash = faTrash;
  faPen = faPen;

  constructor(
    private notesService: NotesService,
  ) {}

  async editNote(): Promise<void> {
    this.isEditing = true;
  }

  async deleteNote(): Promise<void> {
    await this.notesService.deleteNote(this.note.id);
  }
}
