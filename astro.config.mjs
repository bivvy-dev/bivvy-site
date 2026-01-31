import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://bivvy.dev',
  integrations: [
    starlight({
      title: 'Bivvy',
      logo: {
        src: './src/assets/bivvy-logo.svg',
      },
      social: {
        github: 'https://github.com/bivvy-dev/bivvy',
      },
      // Auto-generate sidebar from docs structure (synced from main repo)
      sidebar: [
        { label: 'Docs', autogenerate: { directory: 'docs' } },
      ],
      customCss: ['./src/styles/docs.css'],
    }),
  ],
});
