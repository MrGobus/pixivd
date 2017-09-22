# Pixiv Downloader (pixivd)

Программа для скачивания картинок сайта [pixiv.net](https://www.pixiv.net) по id автора

Собрана на основе свободных неофициальных библиотек дающих доступ к закрытому API сайта pixiv.net. Официально API не опубликовано, похоже дынные об API брались отслеживанием запросов с мобильных приложений. Все библиотеки находятся в свободном доступе и распространяются через сервис npm.

Если что-то пойдет не так, я тут не причем, используйте на свой страх и риск.

Программа работает с двумя библиотеками pixiv-app-api и pixiv.js, одна из которых работает через api для iphone которое дает нормальную информацию о пользователе но пропускает некоторые изображения по непонятным для меня причинам, зато другая дает полный список изображений.

## Установка

Берем последнюю версию тут: [git](https://github.com/MrGobus/pixivd).

Убеждаемся, что у вас установлена [node.js](https://nodejs.org/en/).

Заходим в папку с *pixivd* консолью с прописанными путями к node.js.

(Заходим в папку проводником, с зажатым shift жмем правую кнопку мыши, в появившемся меню выбираем "открыть окно Power Shell здесь")

Скачиваем последние версии библиотек.

```
npm install
```

Выполняем первый запуск.

```
node pixivd
```

Вводим логин и пароль. Надо, без них не работает.

Логин и пароль записываются в файл ```user.json```.

Логин и пароль хранятся в незашифрованном виде, помните это.

Если ввели неверно, правим user.json или удаляем и повторяем шаг выше.

Программа неофициальная, желательно заведите отдельный логин и пароль для pixivd.

## Использование

Идем на сайт [pixiv.net](https://www.pixiv.net) в список работ понравившегося автора.

Копируем id из урла страницы.

Внимание id пользователя и id работы разные вещи, берем id пользователя из урл списка работ.

Выполняем: ```node pixivd <id>```

Например:

```
node pixivd 5151250
```

Наслаждаемся логом скачивания.

Скаченные ранее файлы пропускаются даже если они битые.

Все работы будут сохранены в папке с названием соответствующим id автора. Туда же будет положен log.txt с логом действий.

# English

# Pixiv downloader (pixivd)

Download all user images by user_id form pixiv.net

## run

```
node pixivd.js user_id
```

First time it ask you to enter yore pixiv login and password and store it in user.json file.
On pixiv.net user_id and image_id are not the same, take user id from user image list url.
All images will be saved in directory named by user id.
Log file places in ./user_id/log.txt
