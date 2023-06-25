#include "emscriptenlistener.h"

#include <QDebug>

#include <emscripten/bind.h>

void newCodeHandler(std::string code)
{
    QString qCode = QString::fromStdString(code);
    auto &inst = EmscriptenListener::getInstance();
    emit inst.newCode(qCode);
}

EMSCRIPTEN_BINDINGS(QmlSandboxModule)
{
    emscripten::function("newCodeHandler", &newCodeHandler);
}

EmscriptenListener &EmscriptenListener::getInstance()
{
    static EmscriptenListener instance;
    return instance;
}

EmscriptenListener *EmscriptenListener::create(QQmlEngine *qmlEngine, QJSEngine *jsEngine)
{
    return &EmscriptenListener::getInstance();
}

EmscriptenListener::EmscriptenListener(QObject *parent)
    : QObject{parent}
{}
