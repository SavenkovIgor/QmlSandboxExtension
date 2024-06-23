#pragma once

#include <QImage>
#include <QObject>
#include <QQmlEngine>
#include <QJsonObject>

#include "emscripten_api.h"

class QmlEmscriptenApi : public QObject, public CommandExecutor
{
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON

public:
    static QmlEmscriptenApi &getInstance();
    static QmlEmscriptenApi *create(QQmlEngine *qmlEngine, QJSEngine *jsEngine);

    Q_INVOKABLE void sendJRpcToExtension(QJsonObject jRpc);

signals:
    void receiveJRpcFromExtension(QJsonObject jRpc);

private:
    explicit QmlEmscriptenApi(QObject *parent = nullptr);

    // Implement CommandExecutor
    bool canExecute(QString command_name) final;
    void execute(QJsonObject command) final;
};
