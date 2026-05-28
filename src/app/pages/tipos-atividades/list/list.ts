import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { TiposAtividadesService } from 'src/services/tipos-atividades.service';

@Component({
  selector: 'app-tipos-atividades-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './list.html',
})
export class List {
  private readonly service = inject(TiposAtividadesService);
  tipos$ = this.service.tipos$;

  removerTipo(id: string): void {
    this.service.deleteTipoAtividade(id);
  }
}
