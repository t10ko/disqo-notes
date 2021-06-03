import {Component, Input, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotesService} from '@services/notes/notes.service';

import {objSome, randomString} from '../helpers';

import {NoteInfo} from '@store/actions/notes.actions';

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
  @Input() buttonClass = '';

  @Input() showPlaceholders = false;
  @Input() buttonLabel = 'Save';

  get isNewNote(): boolean {
    return !this.note;
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

  validationErrors = {
    title: {
      required: 'Note title is required.',
      maxLength: 'Note title cannot be longer than 255 characters.',
    },
    text: {
      required: 'Note text is required.',
    },
  };

  constructor(
    private notesService: NotesService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.editNoteForm = this.formBuilder.group({
      title: this.noteTitle,
      text: this.noteText,
    });

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

  getFirstError(control: AbstractControl, fieldName: string): string {
    let validator = '';
    const errors = this.editNoteForm &&
      control.invalid &&
      control.dirty &&
      control.touched &&
      control.errors;

    if (errors) {
      objSome<string>(this.validationErrors[fieldName], (text, field) => {
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
      if (this.isNewNote || this.editNoteForm.dirty) {
        const noteInfo = {
          title: this.noteTitle.value,
          text: this.noteText.value,
        };

        if (this.isNewNote) {
          await this.notesService.createNote(noteInfo);
          this.editNoteForm.reset();
        } else {
          await this.notesService.updateNote(this.note.id, noteInfo);
        }
      }

      this.noteSave.emit();
    } catch (err) {
      this.formError = err.message;
    } finally {
      this.isEditNoteSubmitting = false;
    }
  }
}
