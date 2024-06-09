#!/usr/bin/env python3

import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Optional

qt_version = '6.6.3'
emsdk_version = '3.1.37'


def run(command: str, env: Optional[Dict[str, str]] = None) -> None:
    if subprocess.call(command, shell=True, executable='/bin/bash', env=env) != 0:
        exit(1)


def delete_if_exist(path: Path) -> None:
    if path.exists():
        print(f'Delete {path}')
        run(f'rm -rf {path}')


class Project:

    def __init__(self) -> None:
        self.root             = Path(__file__).parent
        self.name             = self.root.name
        self.venv_root        = self.root / '.venv'
        self.qml_sandbox_root = self.root / 'QmlSandbox'
        self.wasm_engine_root = self.root / 'wasmQmlEngine'
        self.preset           = 'wasm_release'

        self.lib        = self.root / 'lib'
        self.qt_root    = self.lib / 'Qt'
        self.emsdk_root = self.lib / 'emsdk'

    def prepare_env(self) -> Dict[str, str]:
        env = os.environ.copy()
        env['QT_ROOT'] = str(self.qt_root)
        env['QT_VERSION'] = qt_version
        return env

    def install_qt(self) -> None:
        print(f'---INSTALL {self.name}---')

        # Modules list:
        # aqt list-qt linux desktop --long-modules <QT_VERSION> wasm_singlethread

        if not (self.qt_root).exists():
            print(f'Installing Qt {qt_version} with aqtinstall tool')
            py_env_prefix = f'{self.venv_root}/bin/python -m '
            output_dir = f'--outputdir {self.qt_root}'
            modules = '--modules qtimageformats qt5compat qtshadertools qtquicktimeline qtquick3d'
            archives = '--archives qttranslations qttools qtsvg qtdeclarative qtbase icu'
            run(f'{py_env_prefix} aqt install-qt linux desktop {qt_version} gcc_64 {output_dir} {modules} {archives}')
            run(f'{py_env_prefix} aqt install-qt linux desktop {qt_version} wasm_singlethread {output_dir} {modules} {archives}')
        else:
            print(f'Qt already installed at {self.qt_root}')

    def install_emsdk(self) -> None:
        if not (self.emsdk_root).exists():
            print('Install emsdk')
            os.chdir(self.emsdk_root.parent)
            run('git clone https://github.com/emscripten-core/emsdk.git')
            os.chdir(self.emsdk_root)
            run(f'./emsdk install {emsdk_version}')
            run(f'./emsdk activate {emsdk_version}')
        else:
            print(f'emsdk already installed at {self.emsdk_root}')

    def build_qml(self) -> None:
        print(f'---Build of qml project---')
        env = self.prepare_env()
        os.chdir(self.qml_sandbox_root)
        emsdk_prefix = f'source {self.emsdk_root}/emsdk_env.sh && '
        run(f'{emsdk_prefix} cmake --preset={self.preset} -Wno-dev', env=env)
        run(f'{emsdk_prefix} cmake --build --preset={self.preset}', env=env)  # Build

    def deliver_qml(self) -> None:
        print(f'---Deliver qml build to repo root---')
        build_path = self.qml_sandbox_root / f'build/{self.preset}'
        shutil.copy(build_path / 'qtloader.js', self.wasm_engine_root)
        shutil.copy(build_path / 'qtlogo.svg', self.wasm_engine_root)
        shutil.copy(build_path / 'QmlSandbox.js', self.wasm_engine_root)
        shutil.copy(build_path / 'QmlSandbox.wasm', self.wasm_engine_root)

    def remove_build(self) -> None:
        print(f'---Remove build folder---')
        delete_if_exist(self.qml_sandbox_root / 'build')

    def remove_qt_install(self) -> None:
        print(f'---Remove installed Qt---')
        delete_if_exist(self.qt_root)

    def remove_emsdk(self) -> None:
        print(f'---Remove emsdk---')
        delete_if_exist(self.emsdk_root)

    def remove_venv(self) -> None:
        print(f'---Remove virtual environment---')
        delete_if_exist(self.venv_root)

    def last_version_tag(self) -> str:
        cmd = 'git describe --tags --match="v[0-9\\.]*" --abbrev=0'
        return subprocess.check_output(cmd, shell=True).decode().strip()

    def package_version(self) -> str:
        with open(self.root / 'package.json') as f:
            return json.load(f)['version']


def main() -> None:
    parser = argparse.ArgumentParser(description='Project build script')

    parser.add_argument('--create-venv',   action='store_true', help='Create virtual environment')
    parser.add_argument('--install',       action='store_true', help='Install Qt in project folder')
    parser.add_argument('--build-qml',     action='store_true', help='Build project')
    parser.add_argument('--deliver-qml',   action='store_true', help='Copy delivery folder from qml build to wasmQmlEngine folder')
    parser.add_argument('--check-version', action='store_true', help='Check if version from tag is equal to version in package.json')
    parser.add_argument('--clear',         action='store_true', help='Clear project')
    parser.add_argument('--clear-all',     action='store_true', help='Clear all')

    args = parser.parse_args()

    # Print help if no arguments
    if not any(vars(args).values()):
        parser.print_help()
        exit(1)

    app = Project()

    if args.clear:
        app.remove_build()

    if args.clear_all:
        app.remove_build()
        app.remove_qt_install()
        app.remove_emsdk()
        app.remove_venv()

    if args.create_venv:
        print(f'---Create virtual environment---')
        if not (app.venv_root).exists():
            run(f'python3 -m venv {app.venv_root}')
            run(f'{app.venv_root}/bin/pip install --upgrade pip')

            print('Install aqtinstall tool')
            run(f'{app.venv_root}/bin/pip install aqtinstall')
            print('To activate virtual environment run:')
            print(f'source {app.venv_root}/bin/activate')
        else:
            print(f'Venv already exists at {app.venv_root}')

    if args.install:
        app.install_qt()
        app.install_emsdk()

    if args.build_qml:
        app.build_qml()

    if args.deliver_qml:
        app.deliver_qml()

    if args.check_version:
        tag_version = app.last_version_tag()
        tag_version = tag_version[1:]  # Remove first letter 'v' from version
        package_version = app.package_version()
        if tag_version != package_version:
            print(f'Version in package.json ({package_version}) is not equal to version from tag ({tag_version})')
            exit(1)
        else:
            print(f'Version in package.json ({package_version}) is equal to version from tag ({tag_version})')


if __name__ == '__main__':
    main()
