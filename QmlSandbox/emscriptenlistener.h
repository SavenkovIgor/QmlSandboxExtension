#pragma once

#include <QImage>
#include <QObject>
#include <QQmlEngine>
#include <QJsonObject>

class EmscriptenListener : public QObject
{
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON

public:
    static EmscriptenListener &getInstance();
    static EmscriptenListener *create(QQmlEngine *qmlEngine, QJSEngine *jsEngine);

    Q_INVOKABLE void sendJRpcToExtension(QJsonObject jRpc);
    Q_INVOKABLE void addLog(QString level, QString file, QString function, int line, QString msg);
    Q_INVOKABLE QString imgToBase64(QImage img);

private:
    explicit EmscriptenListener(QObject *parent = nullptr);

signals:
    void receiveJRpcFromExtension(QJsonObject jRpc);
};
