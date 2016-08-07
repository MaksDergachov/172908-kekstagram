'use strict';

function getMessage(a, b) {
  if (typeof a === 'boolean') {
    return a ? 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров' : 'Переданное GIF-изображение не анимировано';
  }

  if (typeof a === 'number') {
    return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + (b * 4) + ' атрибутов';
  }

  if (Array.isArray(a) && !Array.isArray(b)) {
      var amountOfRedPoints = 0;
      for (var i = 0; i < a.length; i++) {
        amountOfRedPoints += a[i];
      };
      return 'Количество красных точек во всех строчках изображения: ' + amountOfRedPoints;
    } else {
      var artifactsSquare = 0;
      for (var j = 0; j < a.length; j++) {
        artifactsSquare += a[j] * b[j];
      };
      return 'Общая площадь артефактов сжатия: ' + artifactsSquare + ' пикселей';
    };

}
