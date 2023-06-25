#!/usr/bin/env python3

import subprocess, os
import argparse
from pathlib import Path


def repository_root() -> Path:
    return Path(__file__).parent


def system_call(command: str, env: dict = None):
    if subprocess.call(command, shell=True, executable='/bin/bash', env=env) != 0:
        exit(1)


def delete_if_exist(path: Path):
    if path.exists():
        print(f'Delete {path}')
        system_call(f'rm -rf {path}')


class Project:
    def root_dir(self) -> Path:
        return Path(__file__).parent

    def name(self) -> str:
        return self.root_dir().name

    def install_qt(self):
        print(f'---INSTALL {self.name()}---')

        print('Install aqtinstall tool')
        system_call('pip install aqtinstall')

        print('Installing Qt 6.5.1 with aqtinstall tool')
        system_call('aqt install-qt linux desktop 6.5.1 gcc_64 --outputdir ./Qt')
        system_call('aqt install-qt linux desktop 6.5.1 wasm_32 --outputdir ./Qt')

    def build(self):
        print(f'---BUILD {self.name()}---')

        env = os.environ.copy()
        env['QT_ROOT'] = self.root_dir() / 'Qt'
        env['QT_VERSION'] = '6.5.1'

        # Configure cmake
        system_call('cmake --preset=wasm_release -Wno-dev', env=env)

        # Build
        system_call('cmake --build --preset=wasm_release', env=env)

    def remove_build(self):
        print(f'---Remove build folder---')
        delete_if_exist(self.root_dir() / 'build')

    def remove_qt_install(self):
        print(f'---Remove installed Qt---')
        delete_if_exist(self.root_dir() / '6.5.1')


def main():
    parser = argparse.ArgumentParser(description='Project build script')

    parser.add_argument('--install',   action='store_true', help='Install Qt in project folder')
    parser.add_argument('--build',     action='store_true', help='Build project')
    parser.add_argument('--clear',     action='store_true', help='Clear project')
    parser.add_argument('--clear-all', action='store_true', help='Clear all')

    args = parser.parse_args()

    app = Project()

    if args.clear:
        app.remove_build()

    if args.clear_all:
        app.remove_build()
        app.remove_qt_install()

    if args.install:
        app.install_qt()

    if args.build:
        app.build()


if __name__ == '__main__':
    main()
