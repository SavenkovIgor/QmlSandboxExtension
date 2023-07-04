import QtQuick
import QtQuick.Controls

import QtTemplateModule

Window {
    id: window
    visible: true

    Connections {
        target: EmscriptenListener

        function onNewCode(code) {
            componentItem.create(code)
        }

        function onScreenshot() {
            componentItem.screenshot()
        }
    }

    Item {
        id: componentItem
        property var codeItem: null
        readonly property bool hasItem: codeItem != null
        anchors.fill: parent

        function create(text) {
            if (codeItem)
                codeItem.destroy()

            try {
                codeItem = Qt.createQmlObject(text, componentItem);
                errorsDrawer.close();
            } catch (error) {
                errorsDrawer.showError(error.qmlErrors, "UserFile.qml");
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
        visible: !componentItem.hasItem
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
        id: errorsDrawer
        edge: Qt.BottomEdge
        width: window.width
        height: window.height * 0.2
        interactive: false

        function showError(errorList) {
            let allErrorsText = ""
            for (let i = 0; i < errorList.length; ++i) {
                let error = errorList[i]
                let errorLine = "[" + error.fileName;
                if (error.line)
                    errorLine += ":" + error.line;
                errorLine += "] " + error.message;
                allErrorsText += errorLine + "\n";
            }
            errorsTextItem.text = allErrorsText;
            open();
        }

        Text {
            id: errorsTextItem
            padding: 10
            lineHeightMode: Text.ProportionalHeight
            lineHeight: 1.5
            anchors.fill: parent
        }
    }
}
