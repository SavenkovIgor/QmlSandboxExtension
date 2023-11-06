#pragma once

#include <QObject>
#include <QQmlEngine>
#include <QJsonObject>

class LogCatcher : public QObject
{
    Q_OBJECT
    QML_ELEMENT
    QML_SINGLETON

public:
    static LogCatcher& getInstance();
    static LogCatcher* create(QQmlEngine *qmlEngine, QJSEngine *jsEngine);

    void sendNewLogMessage(QtMsgType type, const QMessageLogContext &context, const QString &msg);

signals:
    void newLogMessage(QJsonObject logMessage);

private:
    explicit LogCatcher(QObject *parent = nullptr);
};
