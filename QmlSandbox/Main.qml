import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import QtQuick.Templates as T
import QtQuick3D

import QtTemplateModule

Window {
    id: qmlSandboxWindow

    visible: true

    Connections {
        target: EmscriptenListener

        function onReceiveJRpcFromExtension(jRpc) {
            qmlSandboxWindow.jRpcController.receiveJRpcFromExtension(jRpc);
        }
    }

    readonly property QtObject jRpcController: QtObject {
        function receiveJRpcFromExtension(jRpc) {
            switch (jRpc.method) {
                case 'makeScreenshot':
                    qmlSandboxComponentWrapper.screenshot();
                    break;
                case 'update':
                    qmlSandboxComponentWrapper.file = jRpc.params.file;
                    qmlSandboxComponentWrapper.code = jRpc.params.source;
                    break;
                default:
                    console.error(`Unknown message type: ${jRpc.method}`);
            }
        }

        function sendJRpcToExtension(method, params) {
            const cmd = {
                method: method,
                params: params
            };
            EmscriptenListener.sendJRpcToExtension(cmd);
        }
    }

    Item {
        id: qmlSandboxComponentWrapper

        property var codeItem: null
        property string file
        property string code
        readonly property bool hasItem: codeItem != null

        anchors.fill: parent

        onCodeChanged: {
            if (codeItem) {
                codeItem.destroy();
                gc();
            }

            try {
                codeItem = Qt.createQmlObject(code, qmlSandboxComponentWrapper, file);
                sendDiagnostics([]);
            } catch (error) {
                sendDiagnostics(error.qmlErrors);
            }
        }

        function cutTemplateModulePath(fileName) {
            const wrongFileNamePrefix = 'qrc:/qt/qml/QtTemplateModule/';
            if (fileName.startsWith(wrongFileNamePrefix)) {
                return fileName.substring(wrongFileNamePrefix.length);
            }
            return fileName;
        }

        function qmlErrorToVsCodeError(qmlError) {
            const vscodeError = qmlError;
            vscodeError.level = "ERROR";
            vscodeError.fileName = cutTemplateModulePath(qmlError.fileName);
            vscodeError.functionName = "";
            return vscodeError;
        }

        function sendDiagnostics(errors) {
            let diagnostics = [];
            for (let i = 0; i < errors.length; ++i) {
                diagnostics.push(qmlErrorToVsCodeError(errors[i]));
            }
            qmlSandboxWindow.jRpcController.sendJRpcToExtension('setDiagnostics', diagnostics);
        }

        function screenshot() {
            if (!codeItem) {
                console.error("No item in scene")
                return;
            }

            codeItem.grabToImage((result) => {
                const base64Img = EmscriptenListener.imgToBase64(result.image);
                qmlSandboxWindow.jRpcController.sendJRpcToExtension('saveScreenshot', [ base64Img ]);
            });
        }
    }

    Rectangle {
        anchors.fill: parent
        visible: !qmlSandboxComponentWrapper.hasItem
        color: "#f5f5f5"

        Control {
            horizontalPadding: 16
            verticalPadding: 8
            anchors.centerIn: parent

            contentItem: Column {
                spacing: 12

                Text {
                    text: "Select a tab with Qml file\nto load it here"
                    horizontalAlignment: Text.AlignHCenter
                    font.pixelSize: 28
                    color: "#f5f5f5"
                }

                Text {
                    text: "All qml console output is redirected\nto vscode output tab,\n('Qml Sandbox' category)"
                    horizontalAlignment: Text.AlignLeft
                    font.pixelSize: 16
                    color: "#f5f5f5"
                }
            }

            background: Rectangle {
                color: "#5d5b59"
                border { color: "#35322f"; width: 2 }
                radius: 8
            }
        }
    }
}
