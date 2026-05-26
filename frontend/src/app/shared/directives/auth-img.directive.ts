import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';

/**
 * Diretiva para carregar imagens via endpoint autenticado (Bearer token).
 *
 * Uso: <img [appAuthImg]="'http://localhost:8080/api/fotos/123/imagem'" alt="" />
 *
 * Faz GET com responseType=blob, cria object URL e atribui ao src.
 * Revoga o object URL quando troca a URL ou destroi o componente.
 */
@Directive({
  selector: 'img[appAuthImg]',
  standalone: true
})
export class AuthImgDirective implements OnChanges, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly el = inject<ElementRef<HTMLImageElement>>(ElementRef);

  @Input() appAuthImg: string | null | undefined;

  private currentBlobUrl: string | null = null;

  ngOnChanges(): void {
    this.revoke();
    const url = this.appAuthImg;
    if (!url) {
      this.el.nativeElement.removeAttribute('src');
      return;
    }
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.currentBlobUrl = URL.createObjectURL(blob);
        this.el.nativeElement.src = this.currentBlobUrl;
      },
      error: () => {
        this.el.nativeElement.removeAttribute('src');
      }
    });
  }

  ngOnDestroy(): void {
    this.revoke();
  }

  private revoke(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
