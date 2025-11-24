import {  } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-reading-progress',
  standalone: true,
  imports: [],
  host: {
    class: 'block',
  },
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden="true">
      <div
    class="h-full w-full origin-left bg-gradient-to-r from-brand-cyan to-brand-accent-violet transition-transform duration-200 ease-out"
        [style.transform]="'scaleX(' + progress + ')'"
        role="presentation"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadingProgressComponent {
  @Input() progress = 0;
}
