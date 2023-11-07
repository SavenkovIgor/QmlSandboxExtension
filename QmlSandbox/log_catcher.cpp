#include "log_catcher.h"

#include <QJsonDocument>

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
    auto& logCatcher = LogCatcher::getInstance();
    logCatcher.sendNewLogMessage(type, context, msg);
}

LogCatcher& LogCatcher::getInstance()
{
    static LogCatcher instance;
    return instance;
}

LogCatcher* LogCatcher::create([[maybe_unused]] QQmlEngine *qmlEngine, [[maybe_unused]] QJSEngine *jsEngine)
{
    return &LogCatcher::getInstance();
}

LogCatcher::LogCatcher(QObject *parent)
    : QObject{parent}
{
    qInstallMessageHandler(logMessageCatcher);
}

void LogCatcher::sendNewLogMessage(QtMsgType type, const QMessageLogContext &context, const QString &msg)
{
    auto msgInfo = QJsonObject{};
    msgInfo.insert("type", qtLogLevelToString(type));
    msgInfo.insert("line", context.line);
    if (context.file) {
        msgInfo.insert("file", context.file);
    }
    if (context.function) {
        msgInfo.insert("functionName", context.function);
    }
    if (context.category) {
        msgInfo.insert("category", context.category);
    }
    msgInfo.insert("message", msg);
    emit newLogMessage(msgInfo);
}
