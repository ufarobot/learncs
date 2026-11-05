---
layout: ../../layouts/GuideLayout.astro
title: Установка Java и IntelliJ IDEA в России
description: "Установщики для России, настройка Java и запуск первой программы в Windows и на Mac."
path: software/java/
basePath: ../../
backHref: /students/#resource-tools
backLabel: Установка программ
---

Инструкции: **Java и IntelliJ IDEA** · [C++ и CLion](/software/cpp/) · [Python и PyCharm](/software/).

Для занятий нужны **JDK** и **IntelliJ IDEA**. JDK содержит инструменты для компиляции и запуска программ на Java. IntelliJ IDEA помогает писать код и запускать его кнопкой **Run**.

Выберите свой компьютер: [Windows](#windows) · [Mac](#mac). Затем переходите к [созданию проекта](#project).

## Скачивание для установки из России

Основные ссылки ведут на **mirror.ismdeep.com**, стороннее зеркало, которое мы используем в инструкциях LearnCS. Скачивать установщики с сайта JetBrains через эту инструкцию не требуется. Если ссылка не открывается в вашей сети, сообщите преподавателю, какой файл нужен и какая у вас операционная система.

Используем **IntelliJ IDEA 2026.2.3**. Начиная с версии 2025.3, это единая программа с бесплатными базовыми возможностями Java; отдельную Community Edition искать не нужно. Для наших занятий этих возможностей достаточно. После пробного периода Ultimate можно продолжать пользоваться IDEA бесплатно; покупать подписку не нужно. [Объяснение JetBrains](https://www.jetbrains.com/help/idea/intellij-idea-single-distribution.html).

| Компьютер | IntelliJ IDEA 2026.2.3 |
| --- | --- |
| Windows, Intel или AMD, x64 | [Скачать .exe](https://mirror.ismdeep.com/jetbrains/IDEA/release/2026.2/2026.2.3/windows/idea-2026.2.3.exe) |
| Mac с процессором Intel | [Скачать .dmg](https://mirror.ismdeep.com/jetbrains/IDEA/release/2026.2/2026.2.3/mac/idea-2026.2.3.dmg) |
| Mac с чипом Apple, серия M | [Скачать .dmg для Apple Silicon](https://mirror.ismdeep.com/jetbrains/IDEA/release/2026.2/2026.2.3/macM1/idea-2026.2.3-aarch64.dmg) |

Для Java выбран **Eclipse Temurin JDK 17**, бесплатная сборка OpenJDK. Ниже приведён один набор установщиков **17.0.20.1+1**. Более свежие обновления Java 17 можно выбрать на [официальной странице Adoptium](https://adoptium.net/temurin/releases/?version=17). Если JDK 17 уже установлен, повторная установка не нужна.

| Компьютер | Eclipse Temurin JDK 17 |
| --- | --- |
| Windows, Intel или AMD, x64 | [Скачать .msi](https://mirror.ismdeep.com/adoptium-temurin17-binaries/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.msi) |
| Mac с процессором Intel | [Скачать .pkg](https://mirror.ismdeep.com/adoptium-temurin17-binaries/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_mac_hotspot_17.0.20.1_1.pkg) |
| Mac с чипом Apple, серия M | [Скачать .pkg для Apple Silicon](https://mirror.ismdeep.com/adoptium-temurin17-binaries/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.20.1_1.pkg) |

На Mac тип процессора указан в **меню Apple → Об этом Mac**. В Windows откройте **Параметры → Система → О системе** и проверьте тип системы. Файлы Windows из таблиц предназначены для x64; для компьютера с ARM-процессором нужен другой установщик.

<h2 id="windows">Windows</h2>

1. Скачайте JDK из второй таблицы и откройте файл `.msi`.
2. В мастере установки прочитайте условия использования. Если согласны, продолжите установку. На шаге **Custom Setup** оставьте добавление Java в **PATH** включённым. Запомните папку установки внутри `C:\Program Files\Eclipse Adoptium`.
3. Нажмите **Install**, дождитесь завершения и нажмите **Finish**.
4. Скачайте IntelliJ IDEA из первой таблицы, откройте `.exe` и пройдите шаги мастера. Оставьте предложенную папку установки.
5. Запустите **IntelliJ IDEA** из меню «Пуск».

В новом окне командной строки можно проверить JDK:

```text
java -version
javac -version
```

В обоих ответах должна быть версия `17`. Если отображается другая установленная Java, выберите JDK 17 вручную в настройках проекта ниже. [Установка Temurin в Windows](https://adoptium.net/installation/windows).

<h2 id="mac">Mac</h2>

1. Скачайте JDK для своего процессора и откройте `.pkg`.
2. Пройдите шаги установщика. Прочитайте условия использования и продолжите, если согласны.
3. Скачайте IntelliJ IDEA для того же процессора. Откройте `.dmg` и перетащите **IntelliJ IDEA** в **Applications**.
4. Откройте IDEA из папки «Программы».

Чтобы узнать, где установлен JDK 17, откройте «Терминал» и выполните:

```sh
/usr/libexec/java_home -v 17
```

Команда покажет папку JDK. Этот путь пригодится, если IDEA не найдёт его автоматически. [Установка Temurin на Mac](https://adoptium.net/installation/macOS).

<h2 id="project">Создайте проект</h2>

1. На стартовом экране IDEA нажмите **New Project** и выберите **Java**.
2. Укажите имя проекта, например `csprog`. В поле **Build system** выберите **IntelliJ**.
3. В поле **JDK** выберите установленный **Temurin 17**. Если его нет в списке, нажмите **Add JDK from disk** и укажите папку установленного JDK: в Windows внутри `C:\Program Files\Eclipse Adoptium`, на Mac по пути из команды выше. Выбирайте папку JDK целиком, а не вложенную папку `bin`.
4. Оставьте **Create Git repository** и **Add sample code** выключенными. Нажмите **Create**.

При таком способе Java уже установлена на компьютере, и функция **Download JDK** не требуется. Если IDEA пишет, что SDK не указан, откройте **File → Project Structure → Project** и выберите этот же JDK 17. [Настройка JDK в IDEA](https://www.jetbrains.com/help/idea/sdk.html).

## Запустите первую программу

В панели **Project** нажмите правой кнопкой на папку `src`, выберите **New → Java Class** и введите `Main`. IDEA создаст файл `Main.java`. Замените его содержимое кодом, который выводит приветствие:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

Нажмите зелёный треугольник слева от `main` и выберите **Run 'Main.main()'**. В окне **Run** должно появиться:

```text
Hello, world!
```

Строка IDEA `Process finished with exit code 0` означает, что программа завершилась без ошибки. Теперь замените приветствие на `Java работает!` и запустите файл ещё раз. Новый текст в окне **Run** подтвердит, что запускается изменённый файл. [Создание и запуск Java-проекта](https://www.jetbrains.com/help/idea/creating-and-running-your-first-java-application.html).
