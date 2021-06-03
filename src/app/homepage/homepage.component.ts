import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

import {NoteList} from '@store/actions/notes.actions';
import * as noteSelectors from '@store/selectors/notes.selectors';

import {asyncScheduler, Observable, Subject} from 'rxjs';
import {Store} from '@ngrx/store';
import {throttleTime} from 'rxjs/operators';
import {ApexOptions, ChartComponent} from 'ng-apexcharts';

import {faSearch} from '@fortawesome/free-solid-svg-icons';

import {NotesService} from '@services/notes/notes.service';
import {NotesState} from '@store/reducers/notes.reducers';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent;

  isLoading = true;

  faSearch = faSearch;

  displayNotesWithId: number[] = [];
  allNotes$: Observable<NoteList>;

  searchText = new FormControl('');
  searchTextChanged = new Subject<void>();

  chartOptions: Partial<ApexOptions>;

  constructor(
    store: Store<NotesState>,
    private notesService: NotesService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.allNotes$ = store.select(noteSelectors.allNotes);
    this.chartOptions = {
      series: [
        {
          name: 'Notes',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: false,
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight',
        lineCap: 'round',
        width: 1,
      },
      markers: {
        size: 4,
        strokeDashArray: 0,
      },
      grid: {
        row: {
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep'
        ]
      }
    };
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
