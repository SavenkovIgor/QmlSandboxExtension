import QtQuick
import QtQuick.Controls

import QtTemplateModule

Window {
    id: qmlSandboxWindow

    visible: true

    Connections {
        target: EmscriptenListener

        function onNewCode(code) { qmlSandboxComponentWrapper.code = code; }
        function onScreenshot() { qmlSandboxComponentWrapper.screenshot(); }

        function onAddLog(level: string, functionName: string, line: int, msg: string) {
            qmlSandboxConsole.addLine(level, "qml", functionName, line, msg);
        }
    }

    Item {
        id: qmlSandboxComponentWrapper

        property var codeItem: null
        property string code
        readonly property bool hasItem: codeItem != null

        anchors.fill: parent

        onCodeChanged: {
            if (codeItem)
                codeItem.destroy()

            try {
                codeItem = Qt.createQmlObject(code, qmlSandboxComponentWrapper);
                qmlSandboxConsole.close();
                qmlSandboxConsole.clear();
            } catch (error) {
                qmlSandboxConsole.setErrors(error.qmlErrors);
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
                    text: "Select tab with QML file\nto load it here"
                    horizontalAlignment: Text.AlignHCenter
                    font.pixelSize: 28
                    color: "#f5f5f5"
                }

                Text {
                    text: "To open/close console press Ctrl+Shift+I"
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

    Drawer {
        id: qmlSandboxConsole

        readonly property bool isOpen: position === 1.0

        edge: Qt.BottomEdge
        width: qmlSandboxWindow.width
        height: qmlSandboxWindow.height * 0.2
        interactive: false

        function switchDrawer() {
            isOpen ? close() : open();
        }

        function setErrors(errorList) {
            clear();
            for (let i = 0; i < errorList.length; ++i) {
                const err = errorList[i];
                addLine("ERROR", err.fileName, "", err.lineNumber, err.message);
            }
            open();
        }

        function formatLog(level, file, funcName, line, msg) {
            const timestamp = (new Date()).toISOString().substr(11, 12);
            return `[${timestamp}:${level}:${file}(${line}) ${funcName}] ${msg}`;
        }

        function addLine(level, file, funcName, line, msg) {
            qmlSandboxConsoleText.addLine(formatLog(level, file, funcName, line, msg));
            open();
        }

        function clear() { qmlSandboxConsoleText.clear(); }

        Text {
            text: "Console"
            anchors {
                top: parent.top
                bottom: qmlSandboxConsoleClearButton.bottom
                left: parent.left
                right: qmlSandboxConsoleClearButton.left
            }
            font.pixelSize: 16
            verticalAlignment: Text.AlignVCenter
            leftPadding: 8

            Rectangle {
                height: 1
                anchors { left: parent.left; right: parent.right; bottom: parent.bottom; }
                color: "black"
            }
        }

        Button {
            id: qmlSandboxConsoleClearButton
            text: "⌄"
            width: 32
            height: 32
            anchors { top: parent.top; right: parent.right; }
            font.pixelSize: 20
            onClicked: qmlSandboxConsole.close()
        }

        Text {
            id: qmlSandboxConsoleText
            anchors {
                top: qmlSandboxConsoleClearButton.bottom
                bottom: parent.bottom
                left: parent.left
                right: parent.right
            }
            padding: 10
            lineHeightMode: Text.ProportionalHeight
            lineHeight: 1.5
            wrapMode: Text.WordWrap

            function addLine(line) { text += `${line}\n`; }

            function clear() { text = ""; }
        }
    }

    Shortcut {
        sequence: "Ctrl+Shift+I"
        context: Qt.ApplicationShortcut
        onActivated: qmlSandboxConsole.switchDrawer()
    }

    Shortcut {
        sequence: "Esc"
        enabled: qmlSandboxConsole.isOpen
        context: Qt.ApplicationShortcut
        onActivated: qmlSandboxConsole.close()
    }
}
