#include "emscripten_listener.h"

#include <QJsonDocument>

#include <emscripten/bind.h>
#include <emscripten/val.h>

void receiveJRpcFromExtension(std::string jRpc)
{
    auto doc = QJsonDocument::fromJson(QByteArray::fromStdString(jRpc));
    auto jRpcObj = doc.object();
    auto& inst = EmscriptenListener::getInstance();
    emit inst.receiveJRpcFromExtension(jRpcObj);
}

EMSCRIPTEN_BINDINGS(QmlSandboxModule)
{
    emscripten::function("receiveJRpcFromExtension", &receiveJRpcFromExtension);
}

EmscriptenListener& EmscriptenListener::getInstance()
{
    static EmscriptenListener instance;
    return instance;
}

EmscriptenListener *EmscriptenListener::create([[maybe_unused]] QQmlEngine *qmlEngine, [[maybe_unused]] QJSEngine *jsEngine)
{
    return &EmscriptenListener::getInstance();
}

void EmscriptenListener::sendJRpcToExtension(QJsonObject jRpc)
{
    auto doc = QJsonDocument(jRpc);
    auto jRpcString = doc.toJson(QJsonDocument::Compact).toStdString();
    emscripten::val::global("receiveJRpcFromQml")(jRpcString);
}

EmscriptenListener::EmscriptenListener(QObject *parent)
    : QObject{parent}
{
}
