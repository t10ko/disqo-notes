import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {NoteList} from '@store/actions/notes.actions';
import * as noteSelectors from '@store/selectors/notes.selectors';

import {asyncScheduler, Observable, Subject} from 'rxjs';
import {Store} from '@ngrx/store';

import {faSearch} from '@fortawesome/free-solid-svg-icons';

import {NotesService} from '@services/notes/notes.service';
import {NotesState} from '@store/reducers/notes.reducers';
import {throttleTime} from 'rxjs/operators';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  isLoading = true;

  faSearch = faSearch;

  displayNotesWithId: number[] = [];
  allNotes$: Observable<NoteList>;

  searchText = new FormControl('');
  searchTextChanged = new Subject<void>();

  constructor(
    store: Store<NotesState>,
    private notesService: NotesService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.allNotes$ = store.select(noteSelectors.allNotes);
  }

  async searchNotes(): Promise<void> {
    const {value: searchQuery} = this.searchText;

    this.displayNotesWithId = await this.notesService
      .searchForNotes(searchQuery);
  }

  onSearchTextChanged(): void {
    if (this.searchTextChanged.observers.length === 0) {
      this.searchTextChanged
        .pipe(throttleTime(
          500,
          asyncScheduler,
          { trailing: true }
        ))
        .subscribe(async () => {
          await this.searchNotes();
        });
    }
    this.searchTextChanged.next();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      const {q: searchQuery} = params;
      if (typeof searchQuery === 'string') {
        this.searchText.setValue(searchQuery);
      }

      this.allNotes$
        .subscribe(async () => {
          await this.searchNotes();
          this.isLoading = false;
        });
    });
  }
}
