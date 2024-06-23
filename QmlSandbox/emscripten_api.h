#pragma once

#include <QJsonObject>
#include <QString>
#include <vector>

class CommandExecutor {
public:
  virtual ~CommandExecutor() = default;

  virtual bool canExecute(QString command_name) = 0;
  virtual void execute(QJsonObject command) = 0;
};

class EmscriptenApi {
public:
  static EmscriptenApi &getInstance() {
    static EmscriptenApi instance;
    return instance;
  }

  void sendJRpcToExtension(QJsonObject jRpc);
  void addExecutor(CommandExecutor *executor);
  void removeExecutor(CommandExecutor *executor);

private:
  EmscriptenApi() = default;
  ~EmscriptenApi() = default;
  EmscriptenApi(const EmscriptenApi &) = delete;
  EmscriptenApi &operator=(const EmscriptenApi &) = delete;

  // Allow embind to call private methods
  friend void onReceivedJRpcFromExtensionBinding(std::string jRpc);

  void onReceiveJRpcFromExtension(std::string jRpc);
  std::vector<CommandExecutor *> command_executors;
};
