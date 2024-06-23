import QtQuick

Item {
    id: root

    readonly property var colors: [
        "#22A699",
        "#F2BE22",
        "#C74B50",
        "#D49B54",
    ]

    anchors.fill: parent

    Rectangle {
        id: bg
        anchors.fill: parent
        color: "#111"
    }

    component Tile: Rectangle {
        id: tile
        width: 36
        height: 36
        color: colors[ Math.floor(Math.random() * colors.length) ]

        property real piRange: 0
        readonly property int radiusAnim: coin()
        readonly property int xAnim: coin()
        readonly property int yAnim: coin()
        readonly property int scaleAnim: coin()
        readonly property int rotateAnim: coin()

        opacity: Math.random() > 0.8 ? 0 : 0.65

        radius: width / 2 - (Math.sin(piRange) * width / 2) * radiusAnim

        scale: 1.0 + (scaleAnim * Math.sin(piRange) * 0.1)

        transform: Translate {
            x: Math.cos(piRange) * 5 * xAnim
            y: Math.sin(piRange) * 5 * yAnim
        }

        rotation: Math.sin(piRange) * 90 * rotateAnim

        function coin() {
            return Math.random() > 0.5 ? 1 : 0
        }

        border.width: coin() * 4
        border.color: "#fff"

        // Forward backward animation on radius
        NumberAnimation {
            id: anim
            target: tile
            property: "piRange"
            from: 0
            to: Math.PI * 2
            duration: Math.random() * 2000 + 4500
            easing.type: Easing.InOutQuad
            running: Math.random() > 0.5
            loops: Animation.Infinite
        }
    }

    Flow {
        anchors.fill: parent
        spacing: 12
        Repeater {
            model: 390
            delegate: Tile {
                // id: tile
                // index: index
            }
        }
    }
}
