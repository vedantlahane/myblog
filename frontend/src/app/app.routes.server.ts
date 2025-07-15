import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'post/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'category/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'tag/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile/**',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
