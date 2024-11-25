# Brendon W. Smith

## Description

This repo contains the source code for my personal website.

## Development

The site is built with [Astro](https://astro.build/). It was initially generated from the [Astro Portfolio theme](https://astro.build/themes/details/portfolio/) with [`pnpm`](https://pnpm.io/) (`pnpm create astro@latest -- --template portfolio`). Note that a `node_modules` folder will still be created even if using `pnpm`. This is expected behavior - `pnpm` will link the contents of the folder to its [content-addressable store](https://pnpm.io/motivation).

Commands in [package.json](./package.json) can be run from a terminal at the root of the project. Commands include:

| Command                        | Action                                                                              |
| :----------------------------- | :---------------------------------------------------------------------------------- |
| `pnpm install`                 | Install dependencies                                                                |
| `pnpm run dev`                 | Start local dev server at `localhost:4321` (use `--port` to change default port)    |
| `pnpm run build`               | Build production site to `./dist/`                                                  |
| `pnpm run preview`             | Preview build locally before deploying                                              |
| `pnpm run astro ...`           | Run CLI commands like `astro add`, `astro check`                                    |
| `pnpm run astro -- --help`     | Get help using the Astro CLI                                                        |
| `pnpm -s dlx @astrojs/upgrade` | [Update Astro](https://docs.astro.build/en/upgrade-astro/) and related dependencies |

Media assets and other large files are stored with [Git LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

## Deployment

- The site is deployed with GitHub Pages to [br3ndonland.github.io](https://br3ndonland.github.io/) using a [GitHub Actions workflow](.github/workflows/ci.yml). The `astro build` step includes `--site "https://${GITHUB_REPOSITORY##*/}"` so that [the site URL can be set for GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) without having to hard-code it in the [Astro config file](https://docs.astro.build/en/guides/configuring-astro/).
- The site is also deployed with [Vercel](https://vercel.com/docs/frameworks/astro) to other domains including [bws.bio](https://www.bws.bio).

## License

Content in this repository authored by Brendon Smith is [licensed](LICENSE) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). _Why?_

- The repository is mostly prose and personal content. CC BY-SA allows the author to retain copyright and encourages attribution of creative content. [Wikipedia uses this license](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use).
- The software code in this repository is not intended for reuse, so the `package.json` lists the source code as `UNLICENSED`. However, if the need to adapt the source code ever arises, [CC BY-SA 4.0 is one-way compatible with GPLv3](https://wiki.creativecommons.org/wiki/ShareAlike_compatibility:_GPLv3) (CC BY-SA 4.0 -> GPLv3), allowing source code to be relicensed under GPLv3 if necessary. See the Creative Commons [compatible licenses page](https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/) for further details. It should also be noted that, although [CC BY-SA licenses are not generally recommended for software](https://creativecommons.org/faq/), [CC BY-SA 4.0 is listed on the Software Package Data Exchange ](https://spdx.org/licenses/CC-BY-SA-4.0.html) (SPDX) with identifier `CC-BY-SA-4.0`, and [SPDX-listed licenses can be used with npm](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) in `package.json`.
