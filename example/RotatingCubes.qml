import QtQuick
import QtQuick.Controls

Control {
   anchors.fill: parent

   Repeater {
      model: 20
      delegate: Rectangle {
         width: 100; height: 25
         // anchors.centerIn: parent
         x: 100 + index * 30
         y: 100 + index * 25
         // calm svg colors
         readonly property var colors: ["coral", "darkblue", "deepskyblue", "forestgreen", "mediumvioletred", "steelblue"]
         color: colors[index % colors.length]
         border.color: "black"
         border.width: 2
         radius: 10

         NumberAnimation on rotation {
             from: 0; to: 360
             duration: 15000
             loops: Animation.Infinite
         }
      }
   }
}