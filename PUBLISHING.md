# Publishing to npm

This project uses **npm Trusted Publishing** (OIDC) via GitHub Actions.
When a GitHub release is created, the [npm-publish workflow](.github/workflows/npm-publish.yml) automatically builds and publishes the package to npm — no long-lived tokens required.

## One-time setup (npmjs.com)

> You must have published at least one version of the package to npm before you can enable trusted publishing.

1. Go to [npmjs.com](https://www.npmjs.com) and sign in to the account that owns the `ddnet` package.
2. Navigate to the **package settings** page: <https://www.npmjs.com/package/ddnet/access>
3. Under **Publishing access**, find the **Trusted Publishers** section.
4. Click **Add a trusted publisher** and fill in:
   - **Organization or user:** `Sans3108`
   - **Repository:** `DDNet`
   - **Workflow filename:** `npm-publish.yml`
   - **Environment:** _(leave blank)_
5. Save the configuration.

Once this is done, the GitHub Actions workflow can publish to npm using OIDC without any stored secrets (`NPM_TOKEN` is no longer needed and can be removed from the repository secrets if it exists).

## How to publish a new release

1. **Update the version** in `package.json`:
   ```bash
   # Bump the patch version (e.g., 0.10.2 → 0.10.3)
   npm version patch

   # Or for a minor version bump (e.g., 0.10.2 → 0.11.0)
   npm version minor

   # Or for a major version bump (e.g., 0.10.2 → 1.0.0)
   npm version major
   ```
   This updates `package.json` and creates a git tag automatically.

2. **Push the commit and tag** to GitHub:
   ```bash
   git push origin master --follow-tags
   ```

3. **Create a GitHub release** from the tag:
   - Go to <https://github.com/Sans3108/DDNet/releases/new>
   - Select the tag you just pushed (e.g., `v0.10.3` or `0.10.3`)
   - Fill in the release title and notes
   - Click **Publish release**

4. The **npm-publish** workflow will trigger automatically, build the package, and publish it to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements) attached.

## What the workflow does

```
checkout → install pnpm → setup node → pnpm install → pnpm build → npm publish --provenance
```

- Uses OIDC (`id-token: write` permission) so npm can verify the package was published from this repository.
- Runs `pnpm install --frozen-lockfile` for reproducible builds.
- Publishes with `--provenance` so consumers can verify the package origin on npmjs.com.

## Troubleshooting

| Problem | Fix |
|---|---|
| **"No matching trusted publisher"** error in CI | Ensure the workflow filename in npmjs.com settings matches exactly: `npm-publish.yml` |
| **403 Forbidden** during publish | Verify that trusted publishing is configured for the correct user/org and repo on npmjs.com |
| **Version already exists** | You need to bump the version in `package.json` before publishing. npm does not allow re-publishing the same version. |
| **Provenance error** | Make sure the workflow has `permissions: id-token: write` and is running in a public repository |
