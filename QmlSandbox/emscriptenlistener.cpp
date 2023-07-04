#include "emscriptenlistener.h"

#include <QBuffer>

#include <emscripten/bind.h>
#include <emscripten/val.h>

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

EmscriptenListener *EmscriptenListener::create(QQmlEngine *qmlEngine, QJSEngine *jsEngine)
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
{}
