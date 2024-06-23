import QtQuick

Rectangle {
    id: root
    width: 200
    height: 140
    color: "#41cd52"

    Text {
        id: text
        anchors.centerIn: parent
        font.pixelSize: 64
        font.weight: Font.ExtraBold
        color: "#fff"
        text: "QML"
        transform: Translate { y: -20 }
    }

    Rectangle {
        color: "#35322f"
        width: parent.width
        height: 42
        anchors.bottom: parent.bottom

        Text {
            anchors.centerIn: parent
            font.pixelSize: 28
            font.weight: Font.ExtraBold
            color: "#d7d6d5"
            text: "Sandbox"
            transform: Translate { x: -8 }
        }
    }

    Rectangle {
        color: "white"
        width: 100
        height: 200
        rotation: 45
        x: -115
        y: -65
    }

    Rectangle {
        color: "white"
        width: 100
        height: 200
        rotation: 45
        x: 115
        y: 105
    }
}
