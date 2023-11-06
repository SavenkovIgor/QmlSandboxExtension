#pragma once

#include <QImage>
#include <QObject>
#include <QQmlEngine>
#include <QString>

class SandboxTools : public QObject
{
    Q_OBJECT
    QML_ELEMENT

public:
    explicit SandboxTools(QObject *parent = nullptr);

    Q_INVOKABLE QString imgToBase64(QImage img);
};
