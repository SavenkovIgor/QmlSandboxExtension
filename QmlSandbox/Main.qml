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

    property QtObject theme: QtObject {
        property string raw: ""
        property var info: JSON.parse(raw)

        readonly property color defaultBackground: '#1e1e1e'
        readonly property color defaultForeground: '#d4d4d4'

        readonly property color editorBackground:   info ? info['editor.background']   : defaultBackground
        readonly property color tabActiveBorderTop: info ? info['tab.activeBorderTop'] : defaultForeground
        readonly property color foreground:         info ? info['foreground']          : defaultForeground
    }

    visible: true

    component VsCodeThemeText: Text { color: qmlSandboxWindow.theme.foreground }
    component VsCodeH2Text: VsCodeThemeText { font.pixelSize: 20 }
    component VsCodeH3Text: VsCodeThemeText { font.pixelSize: 14 }
    component VsCodeBorder: Rectangle {
        border.color: qmlSandboxWindow.theme.tabActiveBorderTop
        border.width: 1
    }

    Connections {
        target: LogCatcher

        function onNewLogMessage(logMsg) {
            logMsg.file = qmlSandboxWindow.tools.cutSandboxPrefix(logMsg.file);
            logMsg.message = qmlSandboxWindow.tools.cutSandboxPrefix(logMsg.message);
            qmlSandboxWindow.jRpcController.sendAddLog(logMsg);
        }
    }

    Component.onCompleted: qmlSandboxWindow.jRpcController.sendQmlLoaded();

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
                case 'qml.setTheme':
                    qmlSandboxWindow.theme.raw = jRpc.params;
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

        function sendQmlLoaded() {
            sendJRpcToExtension('ext.qmlLoaded', {});
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
        color: qmlSandboxWindow.theme.editorBackground

        Control {
            horizontalPadding: 16
            verticalPadding: 8
            anchors.centerIn: parent

            contentItem: Column {
                spacing: 12

                VsCodeH2Text {
                    width: parent.width
                    text: "Select a tab with Qml file\nto load it here"
                    horizontalAlignment: Text.AlignHCenter
                }

                VsCodeH3Text {
                    text: "Regular console output is redirected\nto vscode output tab, 'Qml Sandbox' category."
                    horizontalAlignment: Text.AlignLeft
                }

                VsCodeH3Text {
                    text: "Qml errors are redirected\nto vscode 'problems' tab"
                    horizontalAlignment: Text.AlignLeft
                }
            }

            background: VsCodeBorder { color: qmlSandboxWindow.theme.editorBackground }
        }
    }
}
