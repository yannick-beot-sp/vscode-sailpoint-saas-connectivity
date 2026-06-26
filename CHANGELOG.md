# Change Log

All notable changes to the "vscode-sailpoint-saas-connectivity" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## Unreleased

### Added

- Use of OutputChannel "SaaS Connectivity" for easier access to log and control

### Fixed

- If no connector spec is present, the actions will be all standard actions by default in the connector tester
- Fixed returned body in case of error (due to streamable output)

### Security 

- The workspace must be trusted for the extension to be used (cf. https://code.visualstudio.com/docs/editing/workspaces/workspace-trust)

## [0.1.0] - 2026-04-22

### Added

- Add to response display search and collapse
- Add configuration settings for response max size
- Add headers from remote response

### Changed

- Remove filtering of configuration keys fetched from the cloud
- Response are now truncated

### Fixed

- Reset the response of the output

## [0.0.9] - 2026-04-13

### Removed

- `spConnectorInstanceId` is not considered a "system property" and is returned from the source.

### Changed

- Update UI of Connector tester for clarity on expected value for "input".
- Update Axios dependency

## [0.0.8] - 2026-04-08

### Fixed

- Fixed CI/CD issue for webview

## [0.0.7] - 2026-04-07

### Added

- Connector tester to test locally or remotely
- Publication to Open VSX registry

## [0.0.6] - 2025-10-06

### Added

- Initialize projects for Connectors and Customizers with the commands "SaaS Connectivity: Create Connector Project..." and "SaaS Connectivity: Create Customizer Project...".
- Remove dependency to sailpoint-api-client

### Security

- Update dependencies

## [0.0.5] - 2025-05-20

### Added

- Support for customizers
- New command: copy ID of a connector, a source, or a customizer

## [0.0.4] - 2025-05-05

### Added

- Deploy will also build the package

## [0.0.3] - 2025-04-21

### Fixed

- Logging issue when logging object within the connector

## [0.0.2] - 2025-04-08

### Fixed

- Downgrade VSCode requirement to support Cursor
- Fix confirmation message when uploading connector

## [0.0.1] - 2025-04-06

### Added

- List of tenants and folders linked to ISC Extension
- Create/Delete/Rename connectors
- Upload a zip or deploy local zip for a connector
- Start/stop streaming logs from an instance
