# Copyright © 2016-2023. Savenkov Igor
# SPDX-License-Identifier: GPL-3.0-or-later

cmake_minimum_required (VERSION 3.25.0)

project (QtWasmTemplate
         LANGUAGES CXX)

if (NOT DEFINED ENV{EMSDK})
    message (FATAL_ERROR "EMSDK environment variable is not defined. Please install emscripten SDK and set EMSDK environment variable.")
endif ()

find_package (Qt6 REQUIRED COMPONENTS Quick)

qt_standard_project_setup(REQUIRES 6.5)

qt_add_executable (QtWasmTemplate
    main.cpp
    emscriptenlistener.h
    emscriptenlistener.cpp)

set_target_properties (QtWasmTemplate
    PROPERTIES
        AUTOMOC ON
        CXX_STANDARD 20
        CXX_STANDARD_REQUIRED ON)

qt_add_qml_module (QtWasmTemplate
    URI QtTemplateModule
    VERSION 1.0
    QML_FILES Main.qml)

target_link_libraries (QtWasmTemplate PRIVATE Qt6::Quick)

# Preparing for deployment
message (STATUS "Preparing for deployment")
set (DEPLOY_DIR "${CMAKE_BINARY_DIR}/deploy/")

# Creating deploy folder
add_custom_command(TARGET QtWasmTemplate
                   POST_BUILD COMMAND ${CMAKE_COMMAND} -E
                   make_directory "${DEPLOY_DIR}")

# Copy of static resources
set (WASM_RESOURCES)

# Copy of build artefacts
list (APPEND WASM_RESOURCES "${CMAKE_BINARY_DIR}/qtloader.js")
list (APPEND WASM_RESOURCES "${CMAKE_BINARY_DIR}/qtlogo.svg")
list (APPEND WASM_RESOURCES "${CMAKE_BINARY_DIR}/QtWasmTemplate.js")
list (APPEND WASM_RESOURCES "${CMAKE_BINARY_DIR}/QtWasmTemplate.wasm")

foreach (WASM_RESOURCE ${WASM_RESOURCES})
    add_custom_command (TARGET QtWasmTemplate
                        POST_BUILD COMMAND ${CMAKE_COMMAND} -E
                        copy "${WASM_RESOURCE}" "${DEPLOY_DIR}")
endforeach ()

add_custom_command (TARGET QtWasmTemplate
                    POST_BUILD COMMAND ${CMAKE_COMMAND} -E
                    copy "${CMAKE_BINARY_DIR}/QtWasmTemplate.html" "${DEPLOY_DIR}/index.html")

message ("\nDEPLOY PATH at: ${DEPLOY_DIR}\n")
