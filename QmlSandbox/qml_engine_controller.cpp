#include "qml_engine_controller.h"

#include <QJsonDocument>

bool QmlEngineController::canExecute(QString command_name) {
  return command_name == "qt.initQml";
}

void QmlEngineController::execute(QJsonObject command) {
  const auto method = command["method"].toString();
  assert(method == "qt.initQml");
  initQmlEngine();
}

void QmlEngineController::initQmlEngine() {
  qml_engine = std::make_unique<QQmlApplicationEngine>();
  qml_engine->loadFromModule("QmlSandboxModule", "QmlSandboxMain");
}
