#pragma once

#include <QObject>
#include <QQmlEngine>

class EmscriptenListener : public QObject
{
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON

public:
    static EmscriptenListener &getInstance();
    static EmscriptenListener *create(QQmlEngine *qmlEngine, QJSEngine *jsEngine);

private:
    explicit EmscriptenListener(QObject *parent = nullptr);

signals:
    void newCode(QString code);
};
