import QtQuick
import Qt5Compat.GraphicalEffects

Item {
    anchors.fill: parent

    component ExampleRect: Rectangle {
        width: 100; height: 100;
        anchors.centerIn: parent
    }

    Rectangle {
        id: rect
        width: 300; height: 300;
        anchors.centerIn: parent
        color: "paleturquoise"

        ExampleRect {
            color: "blue"
            transform: Translate { x: -50; y: -50; }
        }

        ExampleRect {
            color: "darkcyan"
            radius: height / 2
            transform: Translate { x: 50; y: -50; }
        }

        ExampleRect {
            color: "darkmagenta"
            radius: height / 2
            transform: Translate { x: -50; y: 50; }
        }

        ExampleRect {
            color: "cornflowerblue"
            transform: Translate { x: 50; y: 50; }
        }

    }

    FastBlur {
        anchors.fill: rect
        source: rect
        NumberAnimation on radius {
            from: 0;
            to: 128;
            duration: 2500;
            loops: Animation.Infinite
        }
    }
}
