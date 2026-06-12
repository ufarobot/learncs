# Navigator MkDocs source

`/navigator/` is built as a separate MkDocs subsite on the same learncs.ru domain.

Build flow:

1. `npm run build:navigator` generates MkDocs pages from `src/content/materials`.
2. MkDocs writes the production navigator to `dist/navigator`.
3. The same generated output is copied to `public/navigator` so Astro dev preview serves the MkDocs navigator on `/navigator/`.
4. `npm run build` generates the navigator before Astro so local preview routes have files to read, then runs the normal Astro build, then rebuilds the MkDocs navigator over `dist/navigator`.

The navigator copies shared MkDocs CSS and JS from `/Users/airatishimbaev/Developer/git-cs-book` during the build. The sync direction is one-way: textbook interface files can flow into the navigator, but navigator changes must not write back to the textbook.

Manual navigator-only CSS lives in `docs/stylesheets/navigator.css`. Generated material pages under `docs/materials`, the generated `mkdocs.yml`, and the generated `public/navigator` output should not be edited by hand.
