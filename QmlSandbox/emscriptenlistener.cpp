#include "emscriptenlistener.h"

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

void EmscriptenListener::addLog(QString level, QString file, QString function, int line, QString msg) {
    emscripten::val::global("addLog")(level.toStdString(), file.toStdString(), function.toStdString(), line, msg.toStdString());
}

void EmscriptenListener::saveScreenshot(QImage img)
{
    QByteArray data;
    QBuffer dataDevice(&data);
    img.save(&dataDevice, "PNG");

    auto base64Data = data.toBase64().toStdString();
    emscripten::val::global("receiveScreenshot")(base64Data);
}

EmscriptenListener::EmscriptenListener(QObject *parent)
    : QObject{parent}
{
    qInstallMessageHandler(logMessageCatcher);
}
