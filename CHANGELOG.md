# Changelog

## v5.0.1

### Added

* Added QtQuick3d (working example could be found [here](https://doc.qt.io/qt-6/qtquick3d-intro-main-qml.html))

### Changed

* Switch to Qt 6.6.0

### Fixed

* Paths substitution refactor

## v4.0.1

### Added

* Added some images and a Quick Start section to README.md.
* Added a status-bar item to disable live-updates during editing, addressing
  certain corner-cases.
* Introduced a command for manual WebView updating.

### Changed

* Conducted some code cleanup.

## v3.0.1

### Added

* Add Layout and Template module imports. They are missed in context [#46](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/46)
* Add garbage collection after destruction. It could fix memory leaks [#45](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/45)
* Add dependency from QML language vscode extension [#42](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/42)
* Add circles example

### Changed

* Now Qt/QML log is captured and redirected to the integrated vscode console [#36](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/36)
* Fix project.py script
* Update README.md
* Cleanup in extension folder structure

### Fixed

* Abbreviations and some readme fixes [#39](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/39)
* Fix Qml id's, so they don't conflict with user's id's [#30](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/30)
* Fix Visual Studio Code C++ prebuilt [#29](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/29)
* 21 Fix GitHub actions and automatic delivery to the Visual Studio Code
  marketplace [#24](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/24)

## v2.0.0

### Added

* Add screenshots and logo

## v1.0.0

### Added

* Add drawer with qml errors
