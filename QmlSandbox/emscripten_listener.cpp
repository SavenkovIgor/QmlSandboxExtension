#include "emscripten_listener.h"

#include <QBuffer>
#include <QJsonDocument>

#include <emscripten/bind.h>
#include <emscripten/val.h>

const char* qtLogLevelToString(QtMsgType type)
{
    switch (type) {
    case QtDebugMsg:    return "DEBUG   ";
    case QtInfoMsg:     return "INFO    ";
    case QtWarningMsg:  return "WARNING ";
    case QtCriticalMsg: return "CRITICAL";
    case QtFatalMsg:    return "FATAL   ";
    }
    return "UNKNOWN";
}

void logMessageCatcher(QtMsgType type, const QMessageLogContext &context, const QString &msg)
{
    QString logLevelName = qtLogLevelToString(type);
    auto& emscripten = EmscriptenListener::getInstance();
    emscripten.addLog(logLevelName, context.file, context.function, context.line, msg);
}

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

void EmscriptenListener::addLog(QString level, QString file, QString function, int line, QString msg) {
    auto params = QJsonObject{
        {"level", level},
        {"file", file},
        {"functionName", function},
        {"line", line},
        {"msg", msg}
    };
    auto logObj = QJsonObject{
        {"method", "addLog"},
        {"params", params}
    };
    sendJRpcToExtension(logObj);
}

EmscriptenListener::EmscriptenListener(QObject *parent)
    : QObject{parent}
{
    qInstallMessageHandler(logMessageCatcher);
}
