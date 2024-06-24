import QtQuick
import QtQuick3D


View3D {
    id: view
    anchors.fill: parent

    environment: SceneEnvironment {
        clearColor: "darkturquoise"
        backgroundMode: SceneEnvironment.Color
    }

    PerspectiveCamera {
        position: Qt.vector3d(0, -150, 600)
        eulerRotation.x: -0
        eulerRotation.z: 90
    }

    DirectionalLight {
        eulerRotation.x: -10

        NumberAnimation on eulerRotation.y { from: -100; to: 100; duration: 3000; loops: Animation.Infinite; }
    }

    Model {
        position: Qt.vector3d(0, -200, 0)
        source: "#Cylinder"
        scale: Qt.vector3d(1, 0.1, 1)
        materials: [ DefaultMaterial { diffuseColor: "coral"; } ]
    }

    Model {
        position: Qt.vector3d(0, 150, 0)
        source: "#Sphere"
        materials: [ DefaultMaterial { diffuseColor: "deeppink" } ]

        SequentialAnimation on y {
            loops: Animation.Infinite

            NumberAnimation { from: 150; to: -150; duration: 2000; easing.type:Easing.InQuad; }
            NumberAnimation { from: -150; to: 150; duration: 2000; easing.type:Easing.OutQuad; }
        }
    }

    Model {
        position: Qt.vector3d(0, 150, 0)
        source: "#Sphere"
        materials: [ DefaultMaterial { diffuseColor: "steelblue" } ]

        SequentialAnimation on y {
            loops: Animation.Infinite

            NumberAnimation { from: -500; to: -260; duration: 2000; easing.type:Easing.InQuad; }
            NumberAnimation { from: -260; to: -500; duration: 2000; easing.type:Easing.OutQuad; }
        }
    }
}
