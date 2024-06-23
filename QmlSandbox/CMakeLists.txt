# Copyright © 2016-2023. Savenkov Igor
# SPDX-License-Identifier: GPL-3.0-or-later

cmake_minimum_required (VERSION 3.25.0)

project (QmlSandbox
         LANGUAGES CXX)

if (NOT DEFINED ENV{EMSDK})
    message (FATAL_ERROR "EMSDK environment variable is not defined. Please install emscripten SDK and set EMSDK environment variable.")
endif ()

set (CMAKE_CXX_STANDARD 20)

find_package (Qt6 REQUIRED COMPONENTS Quick Quick3D)

qt_standard_project_setup(REQUIRES 6.6)

qt_add_executable (QmlSandbox
    emscripten_api.cpp
    emscripten_api.h
    log_catcher.cpp
    log_catcher.h
    main.cpp
    qml_emscripten_api.cpp
    qml_emscripten_api.h
    sandbox_tools.cpp
    sandbox_tools.h)

set_target_properties (QmlSandbox
    PROPERTIES
        AUTOMOC ON
        CXX_STANDARD 20
        CXX_STANDARD_REQUIRED ON)

qt_add_qml_module (QmlSandbox
    URI QmlSandboxModule
    QML_FILES Main.qml)

target_link_libraries (QmlSandbox PRIVATE Qt::Quick Qt::Quick3D)
