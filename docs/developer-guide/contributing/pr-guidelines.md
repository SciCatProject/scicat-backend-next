# Pull Request Guidelines

When creating a pull request (PR) for this repository, it's important to follow the guidelines for PR titles and PR template to ensure consistency and clarity. Proper PR titles help maintain a clear and understandable project history and facilitate better release notes.

## PR Title Format

All PR titles must adhere to the conventional commits format. This format helps in automating the release process and generating changelogs. The format is as follows:

```
<type>(<scope>): <description>
```

type: The type of change being made. It must be one of the following:

- `feat:` A new feature
- `fix:` A bug fix
- `ci:` Continuous integration-related changes.
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white -space, formatting, missing semi -colons, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `revert`: Reverts a previous commit.
- `perf:` A code change that improves performance
- `test:` Adding missing or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools and libraries such as documentation generation
- `build:` Changes that affect the build system or external dependencies.
- `BREAKING CHANGE:` A change that introduces a breaking API change.

scope: An `optional` description of the section of the codebase affected by the changes (e.g., api, ui, docs). This is enclosed in parentheses.

description: A brief summary of the changes made.

## Examples

- feat(api): add new endpoint for data retrieval
- fix(ui): correct button alignment on mobile devices
- docs: update contributing guidelines
- BREAKING CHANGE: refactor authentication middleware to use new library
