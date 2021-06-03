import {Component, Input, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {objSome, randomString} from '../helpers';
import {NoteInfo} from '@store/actions/notes.actions';
import {NotesService} from '@services/notes/notes.service';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss']
})
export class NoteFormComponent implements OnInit {
  @Output() noteSave = new EventEmitter<void>();

  @Input() note: NoteInfo | null = null;
  @Input() containerClass = '';
  @Input() inputGroupClass = '';
  @Input() showPlaceholders = false;
  @Input() buttonLabel = 'Save';

  get isNewNote(): boolean {
    return !!this.note;
  }

  formId = randomString();

  isEditNoteSubmitting = false;
  formError = '';
  editNoteForm: FormGroup;
  noteTitle = new FormControl('', {
    validators: [
      Validators.required,
      Validators.maxLength(255),
    ],
  });
  noteText = new FormControl('', {
    validators: [
      Validators.required,
    ],
  });

  constructor(
    private notesService: NotesService,
  ) { }

  ngOnInit(): void {
    if (!this.isNewNote) {
      const {title, text} = this.note;

      this.noteTitle.setValue(title);
      this.noteText.setValue(text);
    }
  }

  hasError(control: AbstractControl, field: string = ''): boolean {
    return control.invalid &&
      control.dirty &&
      control.touched &&
      control.errors &&
      (
        field ?
          control.errors[field] :
          objSome<boolean>(control.errors, (value) => !!value)
      );
  }

  getFirstError(control: AbstractControl, validationErrors: { [key: string]: string }): string {
    let validator = '';
    const errors = this.editNoteForm &&
      control.invalid &&
      control.dirty &&
      control.touched &&
      control.errors;

    if (errors) {
      objSome<string>(validationErrors, (text, field) => {
        const error = errors[field];
        if (error) {
          validator = text;
        }
        return error;
      });
    }

    return validator;
  }

  async saveNote($event: Event): Promise<void> {
    $event.preventDefault();

    this.isEditNoteSubmitting = true;
    try {
      if (this.isNewNote) {
        await this.notesService.createNote({
          title: this.noteTitle.value,
          text: this.noteText.value,
        });
      } else {
        await this.notesService.updateNote(this.note.id, {
          title: this.noteTitle.value,
          text: this.noteText.value,
        });
      }

      this.noteSave.emit();
    } catch (err) {
      this.formError = err.message;
    } finally {
      this.isEditNoteSubmitting = false;
    }
  }
}
