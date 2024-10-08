# Changelog

## v8.0.1

### Fixed

* Screenshot button now visible only on qml webView tab - not on other tabs ([#125](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/125))
* On qml live update disabled the update button is now visible only on qml tabs ([#127](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/127))
* Rename qml module and main file to avoid conflicts with user files ([#132](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/132))

### Changed

* [refactor] Project script cleanup ([#130](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/130))
* [refactor] Split emscripten interaction into two separate classes ([#131](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/131))
* Replace eye icon with run icon at file title ([#123](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/123))
* Switch to Qt 6.6.3 ([#120](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/120))
* Tool version update
* Added new QmlEngine modes: Overdraw, Batches and Clip ([#136](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/136))

## v7.0.1

### Changed

* Various cleanup and refactoring
* Screenshots are try to be saved with name of the current qml file ([#102](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/102))
* Remove redundant warning prefix ([#104](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/104))

### Added

* Now this extension has info about current vscode theme and use it ([#107](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/107))
* Added 3 qml examples  ([#110](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/110))

## v6.0.1

### Changed

* Update output channel name and webView title ([#81](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/81))
* Send qml diagnostics to VS Code problems tab ([#87](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/87))
* Add qml LogCatcher and redirect warnings to Problems section ([#92](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/92))

### Fixed

* Path cleanup and move window handlers to separate file ([#79](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/79))
* Switch to json commands ([#83](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/83))
* Add support for debug build in CMakePresets.json ([#90](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/90))
* Create Sandbox tools qml component ([#91](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/91))
* Create template for release task ([#93](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/93))
* Fill in changelog from releases description ([#95](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/95))

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

* Add Layout and Template module imports. They are missed in context ([#46](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/46))
* Add garbage collection after destruction. It could fix memory leaks ([#45](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/45))
* Add dependency from QML language vscode extension ([#42](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/42))
* Add circles example

### Changed

* Now Qt/QML log is captured and redirected to the integrated vscode console ([#36](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/36))
* Fix project.py script
* Update README.md
* Cleanup in extension folder structure

### Fixed

* Abbreviations and some readme fixes ([#39](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/39))
* Fix Qml id's, so they don't conflict with user's id's ([#30](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/30))
* Fix Visual Studio Code C++ prebuilt ([#29](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/29))
* 21 Fix GitHub actions and automatic delivery to the Visual Studio Code
  marketplace ([#24](https://github.com/SavenkovIgor/QmlSandboxExtension/pull/24))

## v2.0.0

### Added

* Add screenshots and logo

## v1.0.0

### Added

* Add drawer with qml errors
