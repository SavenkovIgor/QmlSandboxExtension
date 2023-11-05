import QtQuick
import QtQuick.Controls

Control {
   anchors.fill: parent

   Repeater {
      model: 20
      delegate: Rectangle {
         width: 100; height: 25
         // anchors.centerIn: parent
         x: 10 + index * 30
         y: 40
         // calm svg colors
         readonly property var colors: ["coral", "darkblue", "deepskyblue", "forestgreen", "mediumvioletred", "steelblue"]
         color: colors[index % colors.length]
         border.color: "#222"
         border.width: 11
         radius: 10

         NumberAnimation on rotation {
             from: 0 + index * 10; to: 360 + index * 10
             duration: 15000
             loops: Animation.Infinite
         }
      }
   }
}
