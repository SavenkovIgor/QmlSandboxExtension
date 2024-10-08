import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import QtQuick.Templates as T
import QtQuick3D
import Qt5Compat.GraphicalEffects

Window {
    id: qmlSandboxWindow

    readonly property SandboxTools tools: SandboxTools{}

    property QtObject theme: QtObject {
        property string raw: ""
        property var info: JSON.parse(raw)

        readonly property color defaultBackground: '#1e1e1e'
        readonly property color defaultForeground: '#d4d4d4'

        readonly property color editorBackground:   info?.['editor.background']   ?? defaultBackground
        readonly property color focusBorder:        info?.['focusBorder']         ?? defaultForeground
        readonly property color foreground:         info?.['foreground']          ?? defaultForeground
        readonly property color textLinkForeground: info?.['textLink.foreground'] ?? defaultForeground
        readonly property color inputBackground:    info?.['input.background']    ?? defaultBackground

        readonly property QtObject button: QtObject {
            readonly property alias parent: qmlSandboxWindow.theme
            readonly property var info: qmlSandboxWindow.theme.info

            readonly property color background:      info?.['button.background']      ?? parent.defaultBackground
            readonly property color foreground:      info?.['button.foreground']      ?? parent.defaultForeground
            readonly property color hoverBackground: info?.['button.hoverBackground'] ?? parent.defaultForeground
        }
    }

    visible: true

    component VsCodeText: Text {
        property int horizontalPadding: 0
        property int verticalPadding: 0
        leftPadding: horizontalPadding
        rightPadding: horizontalPadding
        topPadding: verticalPadding
        bottomPadding: verticalPadding
        color: qmlSandboxWindow.theme.foreground
        linkColor: qmlSandboxWindow.theme.textLinkForeground
        lineHeight: 1.45
        wrapMode: Text.WordWrap
        textFormat: Text.RichText

        function wrapLink(href, text) {
            const color = linkColor;
            return `<a href='${href}' style='color: ${color};'>${text}</a>`;
        }
    }

    component VsCodeH2Text: VsCodeText {
        horizontalPadding: 12
        verticalPadding: 8
        font.pixelSize: 20
    }

    component VsCodeH3Text: VsCodeText {
        horizontalPadding: 8
        verticalPadding: 4
        font.pixelSize: 14
    }

    component InfoBox: Control {
        horizontalPadding: 16
        verticalPadding: 12
        property color borderColor: hovered ? qmlSandboxWindow.theme.focusBorder : "transparent"

        background: Rectangle {
            border { color: parent.borderColor; width: 1 }
            color: qmlSandboxWindow.theme.inputBackground
        }
    }

    component VsCodeButton: AbstractButton {
        readonly property QtObject theme: qmlSandboxWindow.theme.button
        verticalPadding: 4
        horizontalPadding: 12

        contentItem: VsCodeH3Text {
            text: `<b>${parent.text}</b>`
            color: parent.theme.foreground
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
        }

        background: Rectangle {
            color: parent.hovered ? parent.theme.hoverBackground : parent.theme.background
            radius: 4
        }
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
            target: QmlEmscriptenApi

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

        function sendOpenExample(filename) {
            sendJRpcToExtension('ext.openExample', filename);
        }

        function sendJRpcToExtension(method, params) {
            const cmd = { method: method, params: params };
            QmlEmscriptenApi.sendJRpcToExtension(cmd);
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

    component ExampleLink: VsCodeH3Text {
        width: parent.width
        onLinkActivated: (link) => { qmlSandboxWindow.jRpcController.sendOpenExample(link); }
    }

    Rectangle {
        id: qmlSandboxInfo

        readonly property int columnWidth: 420

        anchors.fill: parent
        visible: !qmlSandboxComponentWrapper.hasItem
        color: qmlSandboxWindow.theme.editorBackground

        Column {
            anchors.centerIn: parent
            spacing: 16

            InfoBox {
                id: qmlSandboxMainInfoBox
                contentItem: Column {
                    width: qmlSandboxInfo.columnWidth
                    spacing: 0

                    VsCodeH2Text {
                        width: parent.width
                        text: "Select a tab containing a Qml file\nto load it here"
                        horizontalAlignment: Text.AlignHCenter
                    }

                    VsCodeH3Text {
                        width: parent.width
                        text: "• Your console output is sent to the <b>OUTPUT</b> tab at bottom panel (Qml Sandbox category)"
                        horizontalAlignment: Text.AlignLeft
                    }

                    VsCodeH3Text {
                        width: parent.width
                        text: "• Qml errors are sent to the <b>PROBLEMS</b> tab at bottom panel"
                        horizontalAlignment: Text.AlignLeft
                    }

                    VsCodeButton {
                        anchors.right: parent.right
                        anchors.rightMargin: 16
                        text: "Qml examples"
                        onClicked: {
                            qmlSandboxMainInfoBox.visible = false;
                            qmlSandboxLimitationsInfoBox.visible = false;
                            qmlSandboxExamplesInfoBox.visible = true;
                        }
                    }
                }
            }

            InfoBox {
                id: qmlSandboxLimitationsInfoBox
                contentItem: Column {
                    width: qmlSandboxInfo.columnWidth

                    VsCodeH2Text {
                        width: parent.width
                        text: "! Limitations !"
                    }

                    VsCodeH3Text {
                        width: parent.width
                        text: "• No support of more than one file (at least for now)"
                        horizontalAlignment: Text.AlignLeft
                    }

                    VsCodeH3Text {
                        width: parent.width
                        text: "• No support for local file access"
                        horizontalAlignment: Text.AlignLeft
                    }
                }
            }

            InfoBox {
                id: qmlSandboxExamplesInfoBox
                visible: false

                contentItem: Column {
                    width: qmlSandboxInfo.columnWidth
                    spacing: 8

                    VsCodeH2Text {
                        width: parent.width
                        text: "Qml examples (click to open)"
                    }

                    ExampleLink { text: wrapLink('Circles.qml', 'Circles') + ' - circles with randomized animation' }
                    ExampleLink { text: wrapLink('CubicWave.qml', 'CubicWave') + ' - simple animation with rotating rectangles' }
                    ExampleLink { text: wrapLink('Logo.qml', 'Logo') + ' - this extension logo' }
                    ExampleLink { text: wrapLink('CompatibilityEffect.qml', 'FastBlur') + ' - fast blur effect from Qt5Compat module' }
                    ExampleLink { text: wrapLink('QtQuick3D.qml', 'QtQuick3D') + ' - simple 3D scene with QtQuick3D' }
                }
            }
        }
    }
}
