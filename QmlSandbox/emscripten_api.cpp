#include "emscripten_api.h"

#include <QJsonDocument>

#include <emscripten/bind.h>
#include <emscripten/val.h>

void onReceivedJRpcFromExtensionBinding(std::string jRpc) {
  EmscriptenApi::getInstance().onReceiveJRpcFromExtension(jRpc);
}

EMSCRIPTEN_BINDINGS(QmlSandboxModuleApi) {
  emscripten::function("receiveJRpcFromExtension",
                       &onReceivedJRpcFromExtensionBinding);
}

void EmscriptenApi::sendJRpcToExtension(QJsonObject jRpc) {
  auto doc = QJsonDocument(jRpc);
  auto jRpcString = doc.toJson(QJsonDocument::Compact).toStdString();
  emscripten::val::global("receiveJRpcFromQml")(jRpcString);
}

void EmscriptenApi::addExecutor(CommandExecutor *executor) {
  assert(executor);
  command_executors.push_back(executor);
}

void EmscriptenApi::removeExecutor(CommandExecutor *executor) {
  assert(executor);
  auto iter =
      std::remove(command_executors.begin(), command_executors.end(), executor);
  command_executors.erase(iter, command_executors.end());
}

void EmscriptenApi::onReceiveJRpcFromExtension(std::string jRpc) {
  auto doc = QJsonDocument::fromJson(QByteArray::fromStdString(jRpc));
  auto jRpcObj = doc.object();
  QString cmd_name = jRpcObj["command"].toString();
  bool received = false;
  for (auto *executor : command_executors) {
    if (executor->canExecute(cmd_name)) {
      executor->execute(jRpcObj);
      received = true;
    }
  }
  assert(received);
  if (!received) {
    qWarning() << "No executor found for command" << cmd_name;
  }
}
