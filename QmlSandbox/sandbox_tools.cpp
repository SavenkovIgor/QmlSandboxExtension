#include "sandbox_tools.h"

#include <QBuffer>

SandboxTools::SandboxTools(QObject *parent)
    : QObject{parent}
{
}

QString SandboxTools::imgToBase64(QImage img)
{
    QByteArray data;
    QBuffer dataDevice(&data);
    img.save(&dataDevice, "PNG");

    return data.toBase64();
}

QString SandboxTools::cutSandboxPrefix(QString string)
{
    const QString wrongFileNamePrefix = "qrc:/qt/qml/QtTemplateModule/";
    return string.replace(wrongFileNamePrefix, "");
}
