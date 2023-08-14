import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import QtQuick.Templates as T

import QtTemplateModule

Window {
    id: qmlSandboxWindow

    visible: true

    Connections {
        target: EmscriptenListener

        function onNewCode(code) { qmlSandboxComponentWrapper.code = code; }
        function onScreenshot() { qmlSandboxComponentWrapper.screenshot(); }
    }

    Item {
        id: qmlSandboxComponentWrapper

        property var codeItem: null
        property string code
        readonly property bool hasItem: codeItem != null

        anchors.fill: parent

        onCodeChanged: {
            if (codeItem) {
                codeItem.destroy();
                gc();
            }

            try {
                codeItem = Qt.createQmlObject(code, qmlSandboxComponentWrapper);
            } catch (error) {
                for (let i = 0; i < error.qmlErrors.length; ++i) {
                    const err = error.qmlErrors[i];
                    EmscriptenListener.addLog("ERROR", err.fileName, "", err.lineNumber, err.message);
                }
            }
        }

        function screenshot() {
            if (!codeItem) {
                console.error("No item in scene")
                return;
            }

            codeItem.grabToImage((result) => {
                EmscriptenListener.saveScreenshot(result.image);
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
