import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import moment from 'moment';
import {NoteInfo} from '@store/actions/notes.actions';
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

  displayNotes: NoteInfo[] = [];
  allNotes$: Observable<NoteInfo[]>;

  searchText = new FormControl('');
  searchTextChanged = new Subject<void>();

  displayChart = false;
  chartOptions: Partial<ApexOptions>;
  private chartData: number[] = [];
  private chartCats: string[] = [];

  constructor(
    store: Store<NotesState>,
    private router: Router,
    private notesService: NotesService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.allNotes$ = store.select(noteSelectors.allNotes);
    this.chartOptions = {
      series: [
        {
          name: 'Notes',
          data: this.chartData,
        },
      ],
      xaxis: {
        categories: this.chartCats,
      },
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
      }
    };
  }

  private static formatChartDate(date: string|number): string {
    const stillUtc = moment.utc(date).toDate();
    return moment(stillUtc).local().format('DD | hh:mm');
  }

  onSearchTextChanged(): void {
    if (this.searchTextChanged.observers.length === 0) {
      this.searchTextChanged
        .pipe(throttleTime(
          200,
          asyncScheduler,
          { trailing: true }
        ))
        .subscribe(async () => {
          await this.searchNotes();

          const queryParams: {q?: string} = {};
          const {value: searchQuery} = this.searchText;
          if (searchQuery) {
            queryParams.q = searchQuery;
          }
          await this.router.navigate(
          [],
            {
              relativeTo: this.activatedRoute,
              queryParams,
            }
          );
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
        .subscribe(async (notes) => {
          await this.searchNotes();

          this.displayChart = false;
          setTimeout(() => {
            this.initializeChart([...notes]);
          }, 300);

          this.isLoading = false;
        });
    });
  }

  private async searchNotes(): Promise<void> {
    const {value: searchQuery} = this.searchText;

    this.displayNotes = await this.notesService
      .searchForNotes(searchQuery);
  }

  private initializeChart(notes: NoteInfo[]): void {
    //  Emptying chart data and categories arrays.
    [this.chartData, this.chartCats].forEach((list) => {
      while (list.length > 0) {
        list.pop();
      }
    });

    const lastDate = notes[0].createdDate;
    const firstDate = notes[notes.length - 1].createdDate;

    //  Calculating time difference between the first
    //  and the last note's createdDate,
    //  dividing it to 7 equal parts.
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const timeUnit = diffTime / 7;

    //  Finding the "breakpoints" for those time differences.
    let countTillLast = 0;
    let lastNoteTime = firstDate.getTime();
    notes.reverse().forEach((note) => {
      const createdTime = note.createdDate.getTime();
      if (lastNoteTime <= createdTime) {
        this.chartData.push(countTillLast);
        this.chartCats.push(HomepageComponent.formatChartDate(lastNoteTime));

        lastNoteTime += timeUnit;
      }
      countTillLast++;
    });

    this.displayChart = true;
  }
}
