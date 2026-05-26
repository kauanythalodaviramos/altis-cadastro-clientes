import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-album',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './album.html',
  styleUrl: './album.scss'
})
export class Album {}
