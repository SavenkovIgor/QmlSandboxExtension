import QtQuick
import QtQuick.Controls

import QtTemplateModule

Window {
    width: 640
    height: 480
    visible: true

    Connections {
        target: EmscriptenListener

        function onNewCode(code) {
            componentItem.create(code)
        }
    }

    SplitView {
        id: split
        anchors.fill: parent
        orientation: Qt.Horizontal

        Item {
            id: componentItem
            property var codeItem: null

            function create(text) {
                if (codeItem)
                    codeItem.destroy()

                codeItem = Qt.createQmlObject(text, componentItem)
            }
        }
    }
}
