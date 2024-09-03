# New Release Version Bump Workflow

## Workflow Overview

Scicat Backend controls new releases with the `GitHub-tag-and-release` GitHub Action. This workflow is triggered by push events to the release branch. It automates the version bumping and release processes based on semantic commit messages. Full documentation of the action package can be found on [github-tag-action](https://github.com/marketplace/actions/github-tag)

The image below shows visualized workflow.
![image](https://github.com/SciCatProject/scicat-backend-next/assets/78078898/0f3c5386-4a16-4ed1-a2ee-d71ef6f34e99)

## Workflow Trigger Condition

> [!Caution]  
> Any push to the `release` branch initiates the workflow.

## Versioning and Release Strategy

**Semantic Versioning:**

- The version is automatically bumped according to the semantic PR titles, using the [semantic-release](https://github.com/semantic-release/semantic-release) conventions:

  - `fix:` prefixed titles generate a patch release.
  - `feat:` prefixed titles generate a minor release.
  - `BREAKING CHANGE:` in the commit message triggers a major release.

**Auto-generated Release Notes:**

The release log is automatically populated with all commit messages since the last tag, providing a detailed changelog for the release. By default semantic-release uses [Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).
