# novogodoff-game
## Игра для сайта novogodoff.ru
Сделано с использованием react. Т.к. мини-игра должна располагаться на сайте, сделанном на Тильде, на странице сайта в конструкторе был добавлен блок HTML, в который помещены: 

  - корневой html-элемент для react компонента, 
  - поделючение файлов библиотеки react, babel для работы с JSX,
  - js-код мини-игры,
  - поключение файлов css

Файлы шрифтов, файл стилей и изображения находятся на отдельном домене, т.к. в Тильду на данный момент нельзя загрузить сторонние файлы.

## Суть игры
Участниками игры могут быть обладатели специального набора конфет. Вкусные и невкусные конфеты упакованы в фантики одного цвета, например, под оранжевым фантиком может быть апельсиновая конфета или конфета со скусом чеснока.

Игроки по очереди крутят барабан и берут конфету выпавшего цвета. Если съел - продолжаешь игру, не съел - выбываешь.

Так же на барабане есть два красных сектора с двуми заданиями на каждом. При попадании на такой сектор случайным образом выбирается одно из заданий:

 - съешь две конфеты
 - пропусти ход
 - возьми конфуту с закрытыми глазами
 - угости любой конфетой друга (предлагается выбрать друга, и он выбывает, если не съест конфету)


