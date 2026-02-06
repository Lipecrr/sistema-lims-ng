import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DrawerModule,
    ToggleSwitchModule
  ],
  templateUrl: './sidebar.html',
  styles: [`
    .sidebar-btn .p-button {
      background-color: transparent !important;
      color: black !important;
      border: none !important;
      box-shadow: none !important;
    }
    .sidebar-btn .p-button:hover {
      background-color: #f3f3f3 !important;
    }
  `]
})
export class Sidebar {
  visible = true;
}
