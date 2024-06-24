#include "init_tools.h"

#include <QJsonDocument>

void InitTools::visualizeOverdraw() { qputenv("QSG_VISUALIZE", "overdraw"); }

void InitTools::visualizeBatches() { qputenv("QSG_VISUALIZE", "batches"); }

void InitTools::visualizeClip() { qputenv("QSG_VISUALIZE", "clip"); }

bool InitTools::canExecute(QString command_name) {
  return command_name == "qt.setVisualizeMode";
}

void InitTools::execute(QJsonObject command) {
  const auto method = command["method"].toString();
  assert(method == "qt.setVisualizeMode");

  const auto mode = command["params"].toString();
  if (mode == "overdraw") {
    visualizeOverdraw();
  } else if (mode == "batches") {
    visualizeBatches();
  } else if (mode == "clip") {
    visualizeClip();
  }
}
