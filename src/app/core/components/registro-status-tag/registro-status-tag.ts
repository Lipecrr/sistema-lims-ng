import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

export type ConsultarStatus =
  | 'Ativo'
  | 'Férias'
  | 'Afastado'
  | 'Inativo';
@Component({
  selector: 'app-registro-status-tag',
  imports: [TagModule],
  templateUrl: './registro-status-tag.html',
})
export class ResgistroStatusTag {
  status= input<boolean | ConsultarStatus>()
}
