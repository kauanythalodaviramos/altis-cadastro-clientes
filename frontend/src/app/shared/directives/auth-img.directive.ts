import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';

/**
 * Diretiva para carregar imagens via endpoint autenticado (Bearer token).
 *
 * Uso: <img [appAuthImg]="'http://localhost:8080/api/fotos/123/imagem'" alt="" />
 *
 * Caracteristicas:
 * - Faz GET com responseType=blob, cria object URL e atribui ao src.
 * - **Lazy load** via IntersectionObserver: so faz fetch quando o <img> entra na viewport
 *   (com margem 200px). Bom para galerias com muitas imagens.
 * - Revoga o object URL quando a URL muda ou o componente e destruido.
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
  private observer: IntersectionObserver | null = null;
  private currentUrlSnap: string | null = null;

  ngOnChanges(): void {
    this.revoke();
    this.disconnectObserver();

    const url = this.appAuthImg;
    if (!url) {
      this.el.nativeElement.removeAttribute('src');
      return;
    }

    this.currentUrlSnap = url;

    // Se ja esta visivel, busca direto. Caso contrario, observa entrada na viewport.
    if (this.isElementInViewport()) {
      this.fetchAndAssign(url);
    } else {
      this.observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.fetchAndAssign(this.currentUrlSnap!);
            this.disconnectObserver();
            break;
          }
        }
      }, { rootMargin: '200px 0px' });
      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.revoke();
    this.disconnectObserver();
  }

  private fetchAndAssign(url: string): void {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        // Verifica que a URL ainda eh a esperada (input pode ter mudado durante o fetch).
        if (this.currentUrlSnap !== url) return;
        this.currentBlobUrl = URL.createObjectURL(blob);
        this.el.nativeElement.src = this.currentBlobUrl;
      },
      error: () => {
        this.el.nativeElement.removeAttribute('src');
      }
    });
  }

  private isElementInViewport(): boolean {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    // Considera "visivel" se qualquer parte estiver dentro de uma margem de 200px.
    return rect.bottom >= -200
      && rect.right >= -200
      && rect.top <= vh + 200
      && rect.left <= vw + 200;
  }

  private revoke(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
