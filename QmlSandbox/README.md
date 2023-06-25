# QmlSandbox: An Online QML Editor with Github Pages Deployment

Welcome to QmlSandbox, a dedicated online QML editor project built with C++/Qt. The project is designed to be easily deployed on Github Pages.

[![Build and deploy to GitHub Pages](https://github.com/SavenkovIgor/QmlSandbox/actions/workflows/BuildDeploy.yml/badge.svg)](https://github.com/SavenkovIgor/QmlSandbox/actions/workflows/BuildDeploy.yml)

View a live demo of QmlSandbox in action here: [QmlSandbox](https://savenkovigor.github.io/QmlSandbox/). :warning: Please allow ~20 seconds for it to load the Qt libraries.

## Project structure
```bash
├── .github/workflows/BuildDeploy.yml # Github Actions workflow for build and deploy to Github Pages
├── CMakeLists.txt                    # CMake configuration file
├── CMakePresets.json                 # CMake presets file
├── main.cpp                          # Main cpp file that initializes the qml engine
├── main.qml                          # QML file containing the primary application interface
└── project.py                        # The main project script
```

## Getting Started

To get started with the QmlSandbox project, you can use the "Use this template" button located at the top of the repository. You will also need to activate Github Pages for your repository, using the Github actions way of deployment.

## Dependencies
- Cmake/Ninja
- Qt 6.5.1
- aqtinstall (script for qt installation. optional)

## :hammer_and_wrench: Build instructions
To build the QmlSandbox project, you can use a script

```bash
./project.py --install --build
```

or you can run commands from the script manually:

```bash
# Install dependencies
pip install aqtinstall

# Install Qt [optional if you already have Qt installed]
aqt install-qt linux desktop 6.5.1 gcc_64 --outputdir ./Qt
aqt install-qt linux desktop 6.5.1 wasm_32 --outputdir ./Qt

# Configure cmake
cmake --preset=wasm_release -Wno-dev

# Build the project
cmake --build --preset=wasm_release

# Upon completion, you will have a folder ready for deployment at
# ./build/wasm_release/deploy
```

## Contributing
We welcome and appreciate contributions! If you would like to contribute to QmlSandbox, please fork the repository and submit a pull request.
