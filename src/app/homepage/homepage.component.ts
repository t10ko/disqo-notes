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
  private chartData: number[] = new Array(7);
  private chartCats: string[] = new Array(7);

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
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontFamily: 'Montserrat, Roboto, Helvetica, Arial, sans-serif',
          },
        },
      },
      yaxis: {
        title: {
          text: 'Number of notes',
          style: {
            fontSize: '10px',
            fontFamily: 'Montserrat, Roboto, Helvetica, Arial, sans-serif',
            fontWeight: 400,
          },
        },
        labels: {
          style: {
            fontFamily: 'Montserrat, Roboto, Helvetica, Arial, sans-serif',
          },
        },
      },
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
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
    this.chartData.fill(0);
    this.chartCats.fill('');

    const lastDate = notes[0].createdDate;
    const firstDate = notes[notes.length - 1].createdDate;

    //  Calculating time difference between the first
    //  and the last note's createdDate,
    //  dividing it to 7 equal parts.
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());

    const timePoints = 7;
    const timeUnit = diffTime / (timePoints - 1);

    //  Finding the "breakpoints" for those time differences.
    const startTime = firstDate.getTime();
    notes.reverse().forEach((note) => {
      const createdTime = note.createdDate.getTime();
      const timeIndex = Math.ceil((createdTime - startTime) / timeUnit);
      for (let i = timeIndex; i < timePoints; i++) {
        this.chartData[i]++;
      }
    });

    let i = timePoints;
    while (i--) {
      this.chartCats[i] = HomepageComponent.formatChartDate(i * timeUnit + startTime);
    }

    this.displayChart = true;
  }
}
