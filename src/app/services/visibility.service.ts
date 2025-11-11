import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { map, startWith, shareReplay } from 'rxjs/operators';

/**
 * Service to monitor page visibility state
 * Used to pause/resume expensive operations when tab is inactive
 */
@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Observable that emits true when page is visible, false when hidden
   * Helps reduce Firestore reads by pausing subscriptions in background tabs
   */
  public visibility$: Observable<boolean>;

  constructor() {
    if (this.isBrowser && typeof document !== 'undefined') {
      this.visibility$ = merge(
        of(null),
        fromEvent(document, 'visibilitychange')
      ).pipe(
        map(() => document.visibilityState === 'visible'),
        startWith(true),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    } else {
      // SSR: always return visible
      this.visibility$ = of(true);
    }
  }

  /**
   * Check if page is currently visible
   */
  isVisible(): boolean {
    if (!this.isBrowser || typeof document === 'undefined') {
      return true;
    }
    return document.visibilityState === 'visible';
  }
}
