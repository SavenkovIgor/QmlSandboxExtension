import QtQuick

Item {
    readonly property var colors: ["coral", "cornflowerblue", "darkblue", "darkcyan", "darkorchid", "mediumvioletred", "orchid", "steelblue"]

    anchors.fill: parent

    Repeater {
        model: 25
        delegate: Rectangle {
            x: 16 * index
            y: 12 * index
            width: 500 - 20 * index
            height: 500 - 20 * index
            color: colors[index % colors.length]
        }
    }
}
