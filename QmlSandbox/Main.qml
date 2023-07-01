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
    }

    Item {
        id: componentItem
        property var codeItem: null
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
