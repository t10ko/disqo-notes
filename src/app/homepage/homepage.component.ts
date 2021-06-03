import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {NoteList} from '@store/actions/notes.actions';
import * as noteSelectors from '@store/selectors/notes.selectors';

import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';

import {faSearch} from '@fortawesome/free-solid-svg-icons';

import {NotesService} from '@services/notes/notes.service';
import {NotesState} from '@store/reducers/notes.reducers';

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

  async ngOnInit(): Promise<void> {
    const params = await this.activatedRoute.queryParams
      .toPromise();

    const {q: searchQuery} = params;
    if (typeof searchQuery === 'string') {
      this.searchText.setValue(searchQuery);
    }

    this.allNotes$
      .subscribe(async () => {
        await this.searchNotes();
        this.isLoading = false;
      });
  }
}
