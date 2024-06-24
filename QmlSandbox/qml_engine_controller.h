#pragma once

#include <memory>

#include <QQmlApplicationEngine>

#include "emscripten_api.h"

class QmlEngineController : public CommandExecutor {
public:
  static QmlEngineController &getInstance() {
    static QmlEngineController instance;
    return instance;
  }

private:
  bool canExecute(QString command_name) final;
  void execute(QJsonObject command) final;

  void initQmlEngine();

  std::unique_ptr<QQmlApplicationEngine> qml_engine;
};
