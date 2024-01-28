import QtQuick
import QtQuick.Controls

// NOTE: Just a proof of concept, not a real cheatsheet
// Real cheatsheet at: https://docs.conan.io/2/_images/conan2-cheatsheet-v5.png
Page {
    anchors.fill: parent

    padding: 20

    component H1: Text {
      font.pixelSize: 24
    }

    component H2: Text {
        font.pixelSize: 18
        font.weight: Font.Bold
        color: "black"
        bottomPadding: 5
    }

    component H3: Text {
        font.pixelSize: 14
        color: "black"
    }

    component Console: Control {
        property alias text: textItem.text
        horizontalPadding: 10
        verticalPadding: 5
        width: parent.width - parent.leftPadding - parent.rightPadding
        contentItem: H3 { id: textItem; color: "#719adf" }
        background: Rectangle { color: "white"; radius: 5; }
    }

   Column {

      H1 {
         text: "CONAN 2.0 CHEATSHEET"
         font.weight: Font.Bold
      }

      Control {
         // y: 100
         width: 400
         contentItem: Column {
           padding: 10
           spacing: 5

        H2 { text: "Search packages" }
        H3 { text: "Search for packages in a remote" }
        Console { text: "$ conan search \"zlib/*\" -r conancenter" }

        H2 { text: "Consume packages"; topPadding: 20 }
        H3 { text: "Install package using just a reference" }
        Console { text: "$ conan install --requires zlib/1.2.13" }
        H3 { text: "Install list of packages from conanfile" }
        Console { text: "$ cat conanifle.txt\n[requires]\nzlib/1.2.13\n$ conan install . # path to a conanfile" }
      }

      background: Rectangle {
         color: "#9bddff"
      }
   }
   }

   background: Rectangle {
      color: "#e6f8ff"
   }
}
