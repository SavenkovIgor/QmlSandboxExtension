import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import QtQuick.Templates as T
import QtQuick3D

import QtTemplateModule

Window {
    id: qmlSandboxWindow

    readonly property SandboxTools tools: SandboxTools{}

    visible: true

    Connections {
        target: LogCatcher

        function onNewLogMessage(logMsg) {
            logMsg.file = qmlSandboxWindow.tools.cutSandboxPrefix(logMsg.file);
            logMsg.message = qmlSandboxWindow.tools.cutSandboxPrefix(logMsg.message);
            qmlSandboxWindow.jRpcController.sendAddLog(logMsg);
        }
    }

    readonly property QtObject jRpcController: QtObject {
        readonly property Connections __privateConnection: Connections {
            target: EmscriptenListener

            function onReceiveJRpcFromExtension(jRpc) {
                qmlSandboxWindow.jRpcController.receiveJRpcFromExtension(jRpc);
            }
        }

        function receiveJRpcFromExtension(jRpc) {
            switch (jRpc.method) {
                case 'qml.makeScreenshot':
                    qmlSandboxComponentWrapper.screenshot();
                    break;
                case 'qml.update':
                    qmlSandboxComponentWrapper.file = jRpc.params.file;
                    qmlSandboxComponentWrapper.code = jRpc.params.source;
                    break;
                default:
                    console.error(`Unknown message type: ${jRpc.method}`);
            }
        }

        function sendAddLog(logMsg) {
            sendJRpcToExtension('ext.addLog', logMsg);
        }

        function sendDiagnostics(diagnostics) {
            sendJRpcToExtension('ext.setDiagnostics', diagnostics);
        }

        function sendSaveScreenshot(base64Img) {
            sendJRpcToExtension('ext.saveScreenshot', [ base64Img ]);
        }

        function sendJRpcToExtension(method, params) {
            const cmd = { method: method, params: params };
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

        function qmlErrorToVsCodeError(qmlError) {
            const vscodeError = qmlError;
            vscodeError.level = "ERROR";
            vscodeError.fileName = qmlSandboxWindow.tools.cutSandboxPrefix(qmlError.fileName);
            vscodeError.functionName = "";
            return vscodeError;
        }

        function sendDiagnostics(errors) {
            let diagnostics = [];
            for (let i = 0; i < errors.length; ++i) {
                diagnostics.push(qmlErrorToVsCodeError(errors[i]));
            }
            qmlSandboxWindow.jRpcController.sendDiagnostics(diagnostics);
        }

        function screenshot() {
            if (!codeItem) {
                console.error("No item in scene")
                return;
            }

            codeItem.grabToImage((result) => {
                const base64Img = qmlSandboxWindow.tools.imgToBase64(result.image);
                qmlSandboxWindow.jRpcController.sendSaveScreenshot(base64Img);
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
                    text: "Regular console output is redirected\nto vscode output tab, 'Qml Sandbox' category."
                    horizontalAlignment: Text.AlignLeft
                    font.pixelSize: 16
                    color: "#f5f5f5"
                }

                Text {
                    text: "Qml errors are redirected\nto vscode 'problems' tab"
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
