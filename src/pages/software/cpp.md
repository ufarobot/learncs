---
layout: ../../layouts/GuideLayout.astro
title: Установка C++ и CLion в России
description: "Прямые ссылки на CLion, настройка компилятора в Windows и macOS и вариант без аккаунта JetBrains."
path: software/cpp/
basePath: ../../
backHref: /students/#resource-tools
backLabel: Установка программ
---

Инструкции: [Java и IntelliJ IDEA](/software/java/) · **C++ и CLion** · [Python и PyCharm](/software/).

Для программирования на C++ нужны **компилятор** и **среда разработки**. Компилятор переводит код в исполняемую программу. В среде разработки **CLion** вы пишете код и запускаете его кнопкой **Run**.

Выберите свой компьютер: [Windows](#windows) · [Mac](#mac). После установки переходите к [первой программе](#first-program). Если не получается активировать CLion, используйте [вариант без аккаунта JetBrains](#without-account).

## Скачивание из России

Используем **CLion 2026.2.4**, как в LMS LearnCS. Ссылки ведут на стороннее зеркало **mirror.ismdeep.com**. Установщик скачивается напрямую, без перехода на страницу загрузок JetBrains.

| Компьютер | Скачать CLion 2026.2.4 |
| --- | --- |
| Windows, Intel или AMD (x64) | [Установщик .exe](https://mirror.ismdeep.com/jetbrains/CLion/release/2026.2/2026.2.4/windows/CLion-2026.2.4.exe) |
| Mac, Intel | [Установщик .dmg](https://mirror.ismdeep.com/jetbrains/CLion/release/2026.2/2026.2.4/mac/CLion-2026.2.4.dmg) |
| Mac, Apple Silicon (чипы M1, M2 и новее) | [Установщик .dmg](https://mirror.ismdeep.com/jetbrains/CLion/release/2026.2/2026.2.4/macM1/CLion-2026.2.4-aarch64.dmg) |

На Mac процессор указан в **меню Apple → Об этом Mac**. В Windows откройте **Параметры → Система → О системе → Тип системы**. Windows-файл из таблицы рассчитан на x64; для Windows на ARM нужен отдельный вариант.

### Активация для домашних занятий

Для личного некоммерческого обучения у CLion есть бесплатная лицензия **Non-commercial use**. Откройте **Help → Manage Subscriptions**, выберите **Non-commercial use**, прочитайте условия и, если согласны, войдите в **JetBrains Account** и нажмите **Start Non-Commercial Use**. [Инструкция JetBrains](https://www.jetbrains.com/help/clion/register.html).

Для активации нужен доступ к сервису JetBrains. Скачанный файл с зеркала не заменяет активацию. Если вход или активация из вашей сети не работают, переходите к [варианту без аккаунта](#without-account). Для первых домашних задач покупка подписки не нужна.

<h2 id="windows">Windows</h2>

1. Скачайте `.exe`, запустите его и пройдите шаги установщика. Оставьте предложенную папку установки.
2. Откройте CLion из меню «Пуск» и выполните активацию, описанную выше.
3. Откройте **File → Settings → Build, Execution, Deployment → Toolchains**.
4. Выберите **MinGW** и в поле **Toolset** оставьте **Bundled MinGW**. Этот набор компиляторов входит в CLion; скачивать отдельный GCC для этой настройки не требуется.
5. Дождитесь определения инструментов. Поле **C++ Compiler** должно содержать путь к компилятору без сообщения об ошибке.

[Настройка CLion в Windows](https://www.jetbrains.com/help/clion/quick-tutorial-on-configuring-clion-on-windows.html).

<h2 id="mac">Mac</h2>

1. Скачайте `.dmg` для своего процессора. Откройте его и перетащите **CLion** в **Applications**.
2. Для компиляции нужен **Apple Clang** из набора **Xcode Command Line Tools**. Откройте «Терминал» и выполните:

   ```sh
   xcode-select --install
   ```

3. Если появится окно установки, завершите её. Если инструменты уже установлены, повторная установка не нужна. Проверьте компилятор:

   ```sh
   clang++ --version
   ```

   В ответе должны быть название Apple Clang и номер версии.
4. Запустите CLion из папки «Программы» и выполните активацию.
5. В **Settings → Build, Execution, Deployment → Toolchains** проверьте, что **C++ Compiler** определён. В полях **CMake** и **Build Tool** можно оставить встроенные инструменты.

Полный Xcode для этой настройки не нужен. [Настройка CLion на Mac](https://www.jetbrains.com/help/clion/quick-tutorial-on-configuring-clion-on-macos.html).

<h2 id="first-program">Создайте проект и запустите программу</h2>

1. Нажмите **New Project → C++ Executable**.
2. Назовите проект `hello`, выберите стандарт **C++17** и нажмите **Create**. Если в вашем курсе указан другой стандарт, выберите его.
3. Дождитесь завершения настройки CMake. Откройте `main.cpp` и замените его содержимое кодом, который выводит приветствие:

   ```cpp
   #include <iostream>

   int main() {
       std::cout << "Hello, world!\n";
       return 0;
   }
   ```

4. Выберите конфигурацию `hello` на панели запуска и нажмите **Run**. В окне **Run** должна появиться строка `Hello, world!`.
5. Замените приветствие на `C++ works!` и запустите программу ещё раз. Новый текст подтвердит, что запускается изменённый файл.

Сообщение среды `Process finished with exit code 0` означает успешное завершение. Если запуск не начинается, сначала прочитайте ошибку в окне **Build** или **CMake**. Если запускается другой файл, проверьте выбранную конфигурацию рядом с кнопкой Run. [Проект C++ в CLion](https://www.jetbrains.com/help/clion/quick-cmake-tutorial.html).

<h2 id="without-account">Вариант без аккаунта JetBrains</h2>

### Windows: Code::Blocks с компилятором

Для первых задач можно использовать бесплатный **Code::Blocks 25.03**. Он не требует аккаунта JetBrains или активации подписки.

1. Скачайте [codeblocks-25.03mingw-setup.exe](https://sourceforge.net/projects/codeblocks/files/Binaries/25.03/Windows/codeblocks-25.03mingw-setup.exe/download). Это установщик Windows x64 с компилятором; слово **mingw** в имени файла обязательно. [Официальная страница загрузок](https://www.codeblocks.org/downloads/binaries/).
2. Запустите установщик, оставьте компонент **MinGW** включённым и завершите установку.
3. Откройте **File → New → Project → Console application → Go**. Выберите **C++**, укажите имя `hello` и папку проекта.
4. Оставьте **GNU GCC Compiler** и нажмите **Finish**.
5. В дереве проекта раскройте **Sources**, откройте `main.cpp` и вставьте программу с приветствием выше.
6. Нажмите **F9 (Build and run)**. В консоли должно появиться `Hello, world!`.

[Создание проекта в руководстве Code::Blocks](https://www.codeblocks.org/docs/main_codeblocks_en3.html).

### Mac: компилятор и «Терминал»

После установки Xcode Command Line Tools можно запустить ту же программу без CLion. В TextEdit выберите **Формат → Сделать обычным текстом**, вставьте код выше и сохраните файл `main.cpp` в отдельной папке. Проверьте, что к имени не добавилось `.txt`.

В «Терминале» перейдите в эту папку командой `cd`, затем соберите и запустите программу:

```sh
clang++ -std=c++17 main.cpp -o main
./main
```

Ожидаемый вывод: `Hello, world!`. Этот способ подходит для начала занятий, пока вы настраиваете среду разработки.
