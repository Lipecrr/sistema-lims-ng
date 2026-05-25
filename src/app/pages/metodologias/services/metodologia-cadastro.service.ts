import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class MetodologiaCadastroService {
  save(form: FormGroup) {
    const payload = form.getRawValue();
    // Aqui o payload já está pronto para envio ao backend.
    console.log('Salvar Metodologia:', payload);
    return Promise.resolve(payload);
  }
}
