import { Injectable, signal } from '@angular/core';

const CHAVE_ARMAZENAMENTO = 'sidebar-recolhida';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly recolhida = signal<boolean>(localStorage.getItem(CHAVE_ARMAZENAMENTO) === 'true');

  alternar(): void {
    const novoValor = !this.recolhida();
    this.recolhida.set(novoValor);
    localStorage.setItem(CHAVE_ARMAZENAMENTO, String(novoValor));
  }
}
