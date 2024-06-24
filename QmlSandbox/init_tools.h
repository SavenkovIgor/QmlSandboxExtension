#pragma once

#include "emscripten_api.h"

class InitTools : public CommandExecutor {

public:
  void visualizeOverdraw();
  void visualizeBatches();
  void visualizeClip();

private:
  bool canExecute(QString command_name) final;
  void execute(QJsonObject command) final;
};
