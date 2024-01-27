import QtQuick

Item {
    id: root

    anchors.fill: parent

    readonly property color base0: Qt.rgba(1, 0, 0, 1)
    readonly property color base1: Qt.rgba(0, 1, 0, 1)
    readonly property color base2: Qt.rgba(0, 0, 1, 1)
    readonly property color base3: Qt.rgba(1, 1, 0, 1)

    readonly property int tileWidth: 20
    readonly property int tileHeight: 45

    component Tile: Rectangle {
        width: 30
        height: 60
        color: "red"
        border { width: 1; color: "black" }
    }

    component Line: Repeater {
        id: rep
        property color base: root.base0
        model: 40
        delegate: Rectangle {
            x: 0 + index * width
            width: root.tileWidth
            height: root.tileHeight
            color: Qt.rgba(rep.base.r, rep.base.g, rep.base.b, 0.25 + (Math.sin(index * 3 / 10) * 0.6))
        }
    }

    Item {
        readonly property color base: root.base0
        Item { x: root.tileWidth * 4; y: root.tileHeight * 0; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 3; y: root.tileHeight * 1; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 4; y: root.tileHeight * 2; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 2; y: root.tileHeight * 3; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 4; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 5; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 0; y: root.tileHeight * 6; Line { base: parent.parent.base; } }

        NumberAnimation on x {
             from: 0;
             to: root.tileWidth * 15;
             duration: 5000;
             loops: Animation.Infinite
             easing.type: Easing.InOutQuad
        }
    }

    Item {
        readonly property color base: root.base1
        Item { x: root.tileWidth * 4; y: root.tileHeight * 0; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 3; y: root.tileHeight * 1; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 4; y: root.tileHeight * 2; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 2; y: root.tileHeight * 3; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 4; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 5; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 0; y: root.tileHeight * 6; Line { base: parent.parent.base; } }

        NumberAnimation on x {
             from: 0;
             to: root.tileWidth * 15;
             duration: 8000;
             loops: Animation.Infinite
             easing.type: Easing.InOutQuad
        }
    }

    Item {
        readonly property color base: root.base2
        Item { x: root.tileWidth * 4; y: root.tileHeight * 0; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 3; y: root.tileHeight * 1; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 4; y: root.tileHeight * 2; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 2; y: root.tileHeight * 3; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 4; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 5; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 0; y: root.tileHeight * 6; Line { base: parent.parent.base; } }

        NumberAnimation on x {
             from: 0;
             to: root.tileWidth * 15;
             duration: 3000;
             loops: Animation.Infinite
             easing.type: Easing.InOutQuad
        }
    }

    Item {
        readonly property color base: root.base3
        Item { x: root.tileWidth * 4; y: root.tileHeight * 0; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 3; y: root.tileHeight * 1; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 4; y: root.tileHeight * 2; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 2; y: root.tileHeight * 3; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 4; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 1; y: root.tileHeight * 5; Line { base: parent.parent.base; } }
        Item { x: root.tileWidth * 0; y: root.tileHeight * 6; Line { base: parent.parent.base; } }

        NumberAnimation on x {
             from: 0;
             to: root.tileWidth * 15;
             duration: 15000;
             loops: Animation.Infinite
             easing.type: Easing.InOutQuad
        }
    }
}
