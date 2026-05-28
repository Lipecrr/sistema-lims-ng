import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tempoEstimado',
  standalone: true,
})
export class TempoEstimadoPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || value <= 0) {
      return '—';
    }

    if (value === 1) {
      return `${value} dia`;
    }
    return `${value} dias`;
  }
}
