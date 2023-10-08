# Qml Sandbox extension for Visual Studio Code

![Logo](resources/logo.png)

Welcome to QmlSandboxExtension, a specialized tool designed to streamline
the development process for Qml experiments. This extension allows you
to preview your Qml files directly within Visual Studio Code, eliminating
the need for context switching and enhancing your productivity.

[![Build status](https://github.com/SavenkovIgor/QmlSandboxExtension/actions/workflows/Build.yml/badge.svg)](https://github.com/SavenkovIgor/QmlSandboxExtension/actions/workflows/Build.yml)

## Quick start

![Quick start](resources/quick_start.gif)

To get started:

1. Open or create a file with qml content
1. Check at the bottom right corner that `qml` language is detected properly
1. Click on the `eye` icon appeared at the top right corner of your Qml file or
 press `Ctrl+Shift+Q` to open the preview window

## Features

- **Preview Qml:** This extension allows you to preview standalone Qml files in
a sandbox environment. To open the preview window, simply click on
the `eye` icon located at the top right corner of your Qml file or
use the `Open Qml Sandbox` command, or press `Ctrl+Shift+Q`.

> Make sure that VsCode properly identifies your file as Qml, or the icon won't appear.
> Qml language support is provided by the `bbenoist.QML` extension dependency.

- **Screenshot**: You can take screenshot of your Qml scene by clicking on the
`camera` icon in the top right corner of the preview window or by using
the `Screenshot Qml Scene` command.

## Build dependencies

- Cmake/Ninja
- aqtinstall (optional script for Qt installation)
- Qt 6.5.2
- Emscripten 3.1.25

## Contributing

We welcome and appreciate contributions! If you would like to contribute to
QmlSandboxExtension, please fork the repository and submit a pull request.
