import { Component } from '@angular/core';
import { faSearch, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  faSearch = faSearch;
  faTrash = faTrash;
  faPen = faPen;
  title = 'disqo-notes';
}
