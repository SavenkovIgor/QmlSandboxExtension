#!/usr/bin/env python3

import subprocess, os
import argparse
from pathlib import Path

qt_version = '6.5.1'
emsdk_version = '3.1.25'

def repository_root() -> Path:
    return Path(__file__).parent

def system_call(command: str, env: dict = None):
    if subprocess.call(command, shell=True, executable='/bin/bash', env=env) != 0:
        exit(1)


def delete_if_exist(path: Path):
    if path.exists():
        print(f'Delete {path}')
        system_call(f'rm -rf {path}')

def prepare_env():
    env = os.environ.copy()
    env['QT_ROOT'] = str(repository_root() / 'QmlSandbox/Qt')
    env['QT_VERSION'] = '6.5.1'
    return env

class Project:
    def root_dir(self) -> Path:
        return Path(__file__).parent

    def name(self) -> str:
        return self.root_dir().name

    def install_qt(self):
        print(f'---INSTALL {self.name()}---')

        print('Install aqtinstall tool')
        system_call('pip install aqtinstall')

        if not (self.root_dir() / 'Qt').exists():
            print(f'Installing Qt {qt_version} with aqtinstall tool')
            system_call(f'aqt install-qt linux desktop {qt_version} gcc_64 --outputdir ./Qt')
            system_call(f'aqt install-qt linux desktop {qt_version} wasm_singlethread --outputdir ./Qt')
        else:
            print('Qt already installed at ./Qt')

    def install_emsdk(self):
        if not (self.root_dir() / 'emsdk').exists():
            print('Install emsdk')
            system_call('git clone https://github.com/emscripten-core/emsdk.git')
            os.chdir(self.root_dir() / 'emsdk')
            system_call(f'./emsdk install {emsdk_version}')
            system_call(f'./emsdk activate {emsdk_version}')
            system_call('source ./emsdk_env.sh')
        else:
            print('emsdk already installed at ./emsdk')

    def build(self):
        print(f'---BUILD {self.name()}---')
        env = prepare_env()

        # Configure cmake
        system_call('cmake --preset=wasm_release -Wno-dev', env=env)

        # Build
        system_call('cmake --build --preset=wasm_release', env=env)

    def remove_build(self):
        print(f'---Remove build folder---')
        delete_if_exist(self.root_dir() / 'build')

    def remove_qt_install(self):
        print(f'---Remove installed Qt---')
        delete_if_exist(self.root_dir() / 'Qt')

    def remove_emsdk(self):
        print(f'---Remove emsdk---')
        delete_if_exist(self.root_dir() / 'emsdk')

    def remove_venv(self):
        print(f'---Remove virtual environment---')
        delete_if_exist(self.root_dir() / 'QtBuildEnv')


def main():
    parser = argparse.ArgumentParser(description='Project build script')

    parser.add_argument('--create-venv', action='store_true', help='Create virtual environment')
    parser.add_argument('--install',     action='store_true', help='Install Qt in project folder')
    parser.add_argument('--build',       action='store_true', help='Build project')
    parser.add_argument('--clear',       action='store_true', help='Clear project')
    parser.add_argument('--clear-all',   action='store_true', help='Clear all')

    args = parser.parse_args()

    app = Project()

    if args.clear:
        app.remove_build()

    if args.clear_all:
        app.remove_build()
        app.remove_qt_install()
        app.remove_emsdk()
        app.remove_venv()

    if args.create_venv:
        system_call('python -m venv QtBuildEnv')
        print('To activate virtual environment: source QtBuildEnv/bin/activate')

    if args.install:
        app.install_qt()
        app.install_emsdk()

    if args.build:
        app.build()


if __name__ == '__main__':
    main()
