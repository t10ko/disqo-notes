import { Component, OnInit } from '@angular/core';
import { faSearch, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import {RestApiService} from '@services/rest-api/rest-api.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  faSearch = faSearch;
  faTrash = faTrash;
  faPen = faPen;

  constructor(
    private restApiService: RestApiService,
  ) {}

  async ngOnInit(): Promise<void> {
    const notes = await this.restApiService.get('notes');

    console.log('--------------- NOTES', notes);
  }
}
