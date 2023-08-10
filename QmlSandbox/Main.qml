import QtQuick
import QtQuick.Controls

import QtTemplateModule

Window {
    id: qmlSandboxWindow

    visible: true

    Connections {
        target: EmscriptenListener

        function onNewCode(code) {
            qmlSandboxComponentWrapper.create(code)
        }

        function onScreenshot() {
            qmlSandboxComponentWrapper.screenshot()
        }
    }

    Item {
        id: qmlSandboxComponentWrapper

        property var codeItem: null
        readonly property bool hasItem: codeItem != null

        anchors.fill: parent

        function create(text) {
            if (codeItem)
                codeItem.destroy()

            try {
                codeItem = Qt.createQmlObject(text, qmlSandboxComponentWrapper);
                qmlSandboxConsole.close();
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
            contentItem: Text {
                text: "Select tab with QML file\nto load it here"
                horizontalAlignment: Text.AlignHCenter
                font.pixelSize: 28
                color: "#f5f5f5"
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
            qmlSandboxConsoleText.clear();
            for (let i = 0; i < errorList.length; ++i) {
                addError(errorList[i]);
            }
            open();
        }

        function addError(error) {
            const errString = errorToString(error.fileName, error.lineNumber, error.message);
            qmlSandboxConsoleText.addLine(errString);
        }

        function errorToString(fileName, line, message) {
            fileName = (!fileName || fileName.endsWith('undefined')) ? 'UserFile.qml' : fileName;
            const lineStr = line ? `:${line}` : ``;
            return `[${fileName}${lineStr}] ${message}`;
        }

        Text {
            id: qmlSandboxConsoleText
            anchors { fill: parent; margins: 10; }
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
        context: Qt.ApplicationShortcut
        onActivated: qmlSandboxConsole.close()
    }
}
