# Pixiv Downloader (pixivd)

Программа для скачивания работ заданного автора с сайта pixiv.net

# Установка





# English

# Pixiv downloader (pixivd)

Download all user images by user_id form pixiv.net

# run

```
node pixivd.js user_id
```

First time it ask you to enter yore pixiv login and password and store it in user.json file.
On pixiv.net user_id and iamge_id are not the same, take user id from user image list url.
All images will be saved in directory named by user id.
Log file places int ./user_id/log.txt
