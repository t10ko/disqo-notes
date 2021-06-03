import { Component, OnInit } from '@angular/core';
import { faSearch, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  faSearch = faSearch;
  faTrash = faTrash;
  faPen = faPen;

  constructor() { }

  ngOnInit(): void {
  }

}
