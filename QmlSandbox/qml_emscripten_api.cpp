#include "qml_emscripten_api.h"

#include <QJsonDocument>

QmlEmscriptenApi &QmlEmscriptenApi::getInstance() {
  static QmlEmscriptenApi instance;
  return instance;
}

QmlEmscriptenApi *
QmlEmscriptenApi::create([[maybe_unused]] QQmlEngine *qmlEngine,
                         [[maybe_unused]] QJSEngine *jsEngine) {
  return &QmlEmscriptenApi::getInstance();
}

void QmlEmscriptenApi::sendJRpcToExtension(QJsonObject jRpc) {
  EmscriptenApi::getInstance().sendJRpcToExtension(jRpc);
}

QmlEmscriptenApi::QmlEmscriptenApi(QObject *parent) : QObject{parent} {
  EmscriptenApi::getInstance().addExecutor(this);
}

bool QmlEmscriptenApi::canExecute([[maybe_unused]] QString command_name) {
  return true;
}

void QmlEmscriptenApi::execute(QJsonObject command) {
  emit receiveJRpcFromExtension(command);
}
