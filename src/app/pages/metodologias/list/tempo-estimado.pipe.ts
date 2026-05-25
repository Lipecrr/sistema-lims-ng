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

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes} min`;
  }
}
