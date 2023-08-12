#include "emscriptenlistener.h"

#include <QBuffer>

#include <emscripten/bind.h>
#include <emscripten/val.h>

void logMessageCatcher(QtMsgType type, const QMessageLogContext &context, const QString &msg)
{
    auto& emscripten = EmscriptenListener::getInstance();
    switch (type) {
    case QtDebugMsg:
        emit emscripten.addLog("DEBUG", context.function, context.line, msg);
        break;
    case QtInfoMsg:
        emit emscripten.addLog("INFO", context.function, context.line, msg);
        break;
    case QtWarningMsg:
        emit emscripten.addLog("WARNING", context.function, context.line, msg);
        break;
    case QtCriticalMsg:
        emit emscripten.addLog("CRITICAL", context.function, context.line, msg);
        break;
    case QtFatalMsg:
        emit emscripten.addLog("FATAL", context.function, context.line, msg);
        break;
    }
}

void newCodeHandler(std::string code)
{
    QString qCode = QString::fromStdString(code);
    auto &inst = EmscriptenListener::getInstance();
    emit inst.newCode(qCode);
}

void screenshotHandler()
{
    auto &inst = EmscriptenListener::getInstance();
    emit inst.screenshot();
}

EMSCRIPTEN_BINDINGS(QmlSandboxModule)
{
    emscripten::function("newCodeHandler", &newCodeHandler);
    emscripten::function("screenshotHandler", &screenshotHandler);
}

EmscriptenListener &EmscriptenListener::getInstance()
{
    static EmscriptenListener instance;
    return instance;
}

EmscriptenListener *EmscriptenListener::create([[maybe_unused]] QQmlEngine *qmlEngine, [[maybe_unused]] QJSEngine *jsEngine)
{
    return &EmscriptenListener::getInstance();
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
