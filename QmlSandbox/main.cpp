#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QTimer>

#include "init_tools.h"
#include "emscripten_api.h"
#include "qml_engine_controller.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    auto &api = EmscriptenApi::getInstance();

    InitTools initTools;
    api.addExecutor(&initTools);

    auto &engineController = QmlEngineController::getInstance();
    api.addExecutor(&engineController);

    QTimer::singleShot(0, []() {
        auto &api = EmscriptenApi::getInstance();
        api.sendJRpcToExtension({{"method", "ext.qtLoaded"}, {"params", ""}});
    });

    return app.exec();
}
