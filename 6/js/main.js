/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(1);
	__webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	(function() {
	  /**
	   * @constructor
	   * @param {string} image
	   */
	  var Resizer = function(image) {
	    // Изображение, с которым будет вестись работа.
	    this._image = new Image();
	    this._image.src = image;
	
	    // Холст.
	    this._container = document.createElement('canvas');
	    this._ctx = this._container.getContext('2d');
	
	    // Создаем холст только после загрузки изображения.
	    this._image.onload = function() {
	      // Размер холста равен размеру загруженного изображения. Это нужно
	      // для удобства работы с координатами.
	      this._container.width = this._image.naturalWidth;
	      this._container.height = this._image.naturalHeight;
	
	      /**
	       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	       * стороны изображения.
	       * @const
	       * @type {number}
	       */
	      var INITIAL_SIDE_RATIO = 0.75;
	
	      // Размер меньшей стороны изображения.
	      var side = Math.min(
	          this._container.width * INITIAL_SIDE_RATIO,
	          this._container.height * INITIAL_SIDE_RATIO);
	
	      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	      // от размера меньшей стороны.
	      this._resizeConstraint = new Square(
	          this._container.width / 2 - side / 2,
	          this._container.height / 2 - side / 2,
	          side);
	
	      // Отрисовка изначального состояния канваса.
	      this.setConstraint();
	    }.bind(this);
	
	    // Фиксирование контекста обработчиков.
	    this._onDragStart = this._onDragStart.bind(this);
	    this._onDragEnd = this._onDragEnd.bind(this);
	    this._onDrag = this._onDrag.bind(this);
	  };
	
	  Resizer.prototype = {
	    /**
	     * Родительский элемент канваса.
	     * @type {Element}
	     * @private
	     */
	    _element: null,
	
	    /**
	     * Положение курсора в момент перетаскивания. От положения курсора
	     * рассчитывается смещение на которое нужно переместить изображение
	     * за каждую итерацию перетаскивания.
	     * @type {Coordinate}
	     * @private
	     */
	    _cursorPosition: null,
	
	    /**
	     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	     * от верхнего левого угла исходного изображения.
	     * @type {Square}
	     * @private
	     */
	    _resizeConstraint: null,
	
	    /**
	     * Отрисовка канваса.
	     */
	    redraw: function() {
	      // Очистка изображения.
	      this._ctx.clearRect(0, 0, this._container.width, this._container.height);
	
	      // Параметры линии.
	      // NB! Такие параметры сохраняются на время всего процесса отрисовки
	      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	      // чего-либо с другой обводкой.
	
	      // Толщина линии.
	      this._ctx.lineWidth = 3;
	      // Цвет обводки.
	      this._ctx.fillStyle = '#ffe753';
	
	      // Сохранение состояния канваса.
	      this._ctx.save();
	
	      // Установка начальной точки системы координат в центр холста.
	      this._ctx.translate(this._container.width / 2, this._container.height / 2);
	
	      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
	      // Отрисовка изображения на холсте. Параметры задают изображение, которое
	      // нужно отрисовать и координаты его верхнего левого угла.
	      // Координаты задаются от центра холста.
	      this._ctx.drawImage(this._image, displX, displY);
	
	      // Отрисовка прямоугольника, обозначающего область изображения после
	      // кадрирования. Координаты задаются от центра.
	      var cropRectangleX = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
	      var cropRectangleY = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
	      var cropRectangleSide = this._resizeConstraint.side - this._ctx.lineWidth / 2;
	
	
	      var pointRadius = this._ctx.lineWidth;
	      var ctx = this._ctx;
	
	      var drawPoint = function(x, y) {
	        ctx.beginPath();
	        ctx.arc(x, y, pointRadius, 0, 360, false);
	        ctx.fill();
	      };
	
	      var drawDottedLine = function(startX, startY, side, horizontal) {
	        var dottedLineStart = horizontal ? startX : startY;
	        for(var i = dottedLineStart; i < dottedLineStart + side; i += pointRadius * 4) {
	          if (horizontal) {
	            drawPoint(i, startY);
	          } else {
	            drawPoint(startX, i);
	          }
	        }
	      };
	
	      var drawDottedSquare = function(x, y, side) {
	        drawDottedLine(x + pointRadius, y + pointRadius, side, true);
	        drawDottedLine(x + pointRadius, y + side - pointRadius / 2, side, true);
	        drawDottedLine(x + pointRadius, y + pointRadius, side, false);
	        drawDottedLine(x + side - pointRadius / 2, y + pointRadius, side, false);
	      };
	
	      drawDottedSquare(cropRectangleX, cropRectangleY, cropRectangleSide);
	
	
	      var transparentSquareX = cropRectangleX - this._ctx.lineWidth / 2;
	      var transparentSquareY = cropRectangleY - this._ctx.lineWidth / 2;
	      var transparentSquareSide = cropRectangleSide / 2;
	
	      this._ctx.beginPath();
	      this._ctx.moveTo(transparentSquareX, transparentSquareY);
	      this._ctx.lineTo(transparentSquareSide, transparentSquareY);
	      this._ctx.lineTo(transparentSquareSide, transparentSquareSide);
	      this._ctx.lineTo(transparentSquareX, transparentSquareSide);
	      this._ctx.lineTo(transparentSquareX, transparentSquareY);
	
	      this._ctx.moveTo(-this._ctx.lineWidth / 2, -this._container.height / 2);
	      this._ctx.lineTo(this._container.width, -this._container.height / 2);
	      this._ctx.lineTo(this._container.width, this._container.height);
	      this._ctx.lineTo(-this._container.width / 2, this._container.height);
	      this._ctx.lineTo(-this._container.width / 2, -this._container.height / 2);
	
	      this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
	      this._ctx.fill('evenodd');
	      this._ctx.closePath();
	
	      var fotoSizeString = this._image.naturalWidth + ' x ' + this._image.naturalHeight;
	      this._ctx.fillStyle = '#ffffff';
	      this._ctx.font = '16px Arial';
	      this._ctx.fillText(fotoSizeString, -this._ctx.measureText(fotoSizeString).width / 2, transparentSquareY - this._ctx.lineWidth);
	
	      // Восстановление состояния канваса, которое было до вызова ctx.save
	      // и последующего изменения системы координат. Нужно для того, чтобы
	      // следующий кадр рисовался с привычной системой координат, где точка
	      // 0 0 находится в левом верхнем углу холста, в противном случае
	      // некорректно сработает даже очистка холста или нужно будет использовать
	      // сложные рассчеты для координат прямоугольника, который нужно очистить.
	      this._ctx.restore();
	    },
	
	    /**
	     * Включение режима перемещения. Запоминается текущее положение курсора,
	     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	     * позволяющие перерисовывать изображение по мере перетаскивания.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    _enterDragMode: function(x, y) {
	      this._cursorPosition = new Coordinate(x, y);
	      document.body.addEventListener('mousemove', this._onDrag);
	      document.body.addEventListener('mouseup', this._onDragEnd);
	    },
	
	    /**
	     * Выключение режима перемещения.
	     * @private
	     */
	    _exitDragMode: function() {
	      this._cursorPosition = null;
	      document.body.removeEventListener('mousemove', this._onDrag);
	      document.body.removeEventListener('mouseup', this._onDragEnd);
	    },
	
	    /**
	     * Перемещение изображения относительно кадра.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    updatePosition: function(x, y) {
	      this.moveConstraint(
	          this._cursorPosition.x - x,
	          this._cursorPosition.y - y);
	      this._cursorPosition = new Coordinate(x, y);
	    },
	
	    /**
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDragStart: function(evt) {
	      this._enterDragMode(evt.clientX, evt.clientY);
	    },
	
	    /**
	     * Обработчик окончания перетаскивания.
	     * @private
	     */
	    _onDragEnd: function() {
	      this._exitDragMode();
	    },
	
	    /**
	     * Обработчик события перетаскивания.
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDrag: function(evt) {
	      this.updatePosition(evt.clientX, evt.clientY);
	    },
	
	    /**
	     * Добавление элемента в DOM.
	     * @param {Element} element
	     */
	    setElement: function(element) {
	      if (this._element === element) {
	        return;
	      }
	
	      this._element = element;
	      this._element.insertBefore(this._container, this._element.firstChild);
	      // Обработчики начала и конца перетаскивания.
	      this._container.addEventListener('mousedown', this._onDragStart);
	    },
	
	    /**
	     * Возвращает кадрирование элемента.
	     * @return {Square}
	     */
	    getConstraint: function() {
	      return this._resizeConstraint;
	    },
	
	    /**
	     * Смещает кадрирование на значение указанное в параметрах.
	     * @param {number} deltaX
	     * @param {number} deltaY
	     * @param {number} deltaSide
	     */
	    moveConstraint: function(deltaX, deltaY, deltaSide) {
	      this.setConstraint(
	          this._resizeConstraint.x + (deltaX || 0),
	          this._resizeConstraint.y + (deltaY || 0),
	          this._resizeConstraint.side + (deltaSide || 0));
	    },
	
	    /**
	     * @param {number} x
	     * @param {number} y
	     * @param {number} side
	     */
	    setConstraint: function(x, y, side) {
	      if (typeof x !== 'undefined') {
	        this._resizeConstraint.x = x;
	      }
	
	      if (typeof y !== 'undefined') {
	        this._resizeConstraint.y = y;
	      }
	
	      if (typeof side !== 'undefined') {
	        this._resizeConstraint.side = side;
	      }
	
	      requestAnimationFrame(function() {
	        this.redraw();
	        window.dispatchEvent(new CustomEvent('resizerchange'));
	      }.bind(this));
	    },
	
	    /**
	     * Удаление. Убирает контейнер из родительского элемента, убирает
	     * все обработчики событий и убирает ссылки.
	     */
	    remove: function() {
	      this._element.removeChild(this._container);
	
	      this._container.removeEventListener('mousedown', this._onDragStart);
	      this._container = null;
	    },
	
	    /**
	     * Экспорт обрезанного изображения как HTMLImageElement и исходником
	     * картинки в src в формате dataURL.
	     * @return {Image}
	     */
	    exportImage: function() {
	      // Создаем Image, с размерами, указанными при кадрировании.
	      var imageToExport = new Image();
	
	      // Создается новый canvas, по размерам совпадающий с кадрированным
	      // изображением, в него добавляется изображение взятое из канваса
	      // с измененными координатами и сохраняется в dataURL, с помощью метода
	      // toDataURL. Полученный исходный код, записывается в src у ранее
	      // созданного изображения.
	      var temporaryCanvas = document.createElement('canvas');
	      var temporaryCtx = temporaryCanvas.getContext('2d');
	      temporaryCanvas.width = this._resizeConstraint.side;
	      temporaryCanvas.height = this._resizeConstraint.side;
	      temporaryCtx.drawImage(this._image,
	          -this._resizeConstraint.x,
	          -this._resizeConstraint.y);
	      imageToExport.src = temporaryCanvas.toDataURL('image/png');
	
	      return imageToExport;
	    }
	  };
	
	  /**
	   * Вспомогательный тип, описывающий квадрат.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   * @private
	   */
	  var Square = function(x, y, side) {
	    this.x = x;
	    this.y = y;
	    this.side = side;
	  };
	
	  /**
	   * Вспомогательный тип, описывающий координату.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  var Coordinate = function(x, y) {
	    this.x = x;
	    this.y = y;
	  };
	
	  window.Resizer = Resizer;
	})();


/***/ },
/* 2 */
/***/ function(module, exports) {

	/* global Resizer: true */
	
	/**
	 * @fileoverview
	 * @author Igor Alexeenko (o0)
	 */
	
	'use strict';
	
	(function() {
	  /** @enum {string} */
	  var FileType = {
	    'GIF': '',
	    'JPEG': '',
	    'PNG': '',
	    'SVG+XML': ''
	  };
	
	  /** @enum {number} */
	  var Action = {
	    ERROR: 0,
	    UPLOADING: 1,
	    CUSTOM: 2
	  };
	
	  /**
	   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
	   * из ключей FileType.
	   * @type {RegExp}
	   */
	  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');
	
	  /**
	   * @type {Object.<string, string>}
	   */
	  var filterMap;
	
	  /**
	   * Объект, который занимается кадрированием изображения.
	   * @type {Resizer}
	   */
	  var currentResizer;
	
	  /**
	   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
	   * изображением.
	   */
	  function cleanupResizer() {
	    if (currentResizer) {
	      currentResizer.remove();
	      currentResizer = null;
	    }
	  }
	
	  /**
	   * Ставит одну из трех случайных картинок на фон формы загрузки.
	   */
	  function updateBackground() {
	    var images = [
	      'img/logo-background-1.jpg',
	      'img/logo-background-2.jpg',
	      'img/logo-background-3.jpg'
	    ];
	
	    var backgroundElement = document.querySelector('.upload');
	    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
	    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
	  }
	
	  /**
	   * Проверяет, валидны ли данные, в форме кадрирования.
	   * @return {boolean}
	   */
	  function resizeFormIsValid() {
	    return true;
	  }
	
	  /**
	   * Форма загрузки изображения.
	   * @type {HTMLFormElement}
	   */
	  var uploadForm = document.forms['upload-select-image'];
	
	  /**
	   * Форма кадрирования изображения.
	   * @type {HTMLFormElement}
	   */
	  var resizeForm = document.forms['upload-resize'];
	
	  /**
	   * Форма добавления фильтра.
	   * @type {HTMLFormElement}
	   */
	  var filterForm = document.forms['upload-filter'];
	
	  /**
	   * @type {HTMLImageElement}
	   */
	  var filterImage = filterForm.querySelector('.filter-image-preview');
	
	  /**
	   * @type {HTMLElement}
	   */
	  var uploadMessage = document.querySelector('.upload-message');
	
	  /**
	   * @param {Action} action
	   * @param {string=} message
	   * @return {Element}
	   */
	  function showMessage(action, message) {
	    var isError = false;
	
	    switch (action) {
	      case Action.UPLOADING:
	        message = message || 'Кексограмим&hellip;';
	        break;
	
	      case Action.ERROR:
	        isError = true;
	        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	        break;
	    }
	
	    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
	    uploadMessage.classList.remove('invisible');
	    uploadMessage.classList.toggle('upload-message-error', isError);
	    return uploadMessage;
	  }
	
	  function hideMessage() {
	    uploadMessage.classList.add('invisible');
	  }
	
	  /**
	   * Обработчик изменения изображения в форме загрузки. Если загруженный
	   * файл является изображением, считывается исходник картинки, создается
	   * Resizer с загруженной картинкой, добавляется в форму кадрирования
	   * и показывается форма кадрирования.
	   * @param {Event} evt
	   */
	  uploadForm.onchange = function(evt) {
	    var element = evt.target;
	    if (element.id === 'upload-file') {
	      // Проверка типа загружаемого файла, тип должен быть изображением
	      // одного из форматов: JPEG, PNG, GIF или SVG.
	      if (fileRegExp.test(element.files[0].type)) {
	        var fileReader = new FileReader();
	
	        showMessage(Action.UPLOADING);
	
	        fileReader.onload = function() {
	          cleanupResizer();
	
	          currentResizer = new Resizer(fileReader.result);
	          currentResizer.setElement(resizeForm);
	          uploadMessage.classList.add('invisible');
	
	          uploadForm.classList.add('invisible');
	          resizeForm.classList.remove('invisible');
	
	          hideMessage();
	        };
	
	        fileReader.readAsDataURL(element.files[0]);
	      } else {
	        // Показ сообщения об ошибке, если формат загружаемого файла не поддерживается
	        showMessage(Action.ERROR);
	      }
	    }
	  };
	
	  /**
	   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
	   * и обновляет фон.
	   * @param {Event} evt
	   */
	  resizeForm.onreset = function(evt) {
	    evt.preventDefault();
	
	    cleanupResizer();
	    updateBackground();
	
	    resizeForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  };
	
	  /**
	   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
	   * кропнутое изображение в форму добавления фильтра и показывает ее.
	   * @param {Event} evt
	   */
	  resizeForm.onsubmit = function(evt) {
	    evt.preventDefault();
	
	    if (resizeFormIsValid()) {
	      var image = currentResizer.exportImage().src;
	
	      var thumbnails = filterForm.querySelectorAll('.upload-filter-preview');
	      for (var i = 0; i < thumbnails.length; i++) {
	        thumbnails[i].style.backgroundImage = 'url(' + image + ')';
	      }
	
	      filterImage.src = image;
	
	      resizeForm.classList.add('invisible');
	      filterForm.classList.remove('invisible');
	    }
	  };
	
	  /**
	   * Сброс формы фильтра. Показывает форму кадрирования.
	   * @param {Event} evt
	   */
	  filterForm.onreset = function(evt) {
	    evt.preventDefault();
	
	    filterForm.classList.add('invisible');
	    resizeForm.classList.remove('invisible');
	  };
	
	  /**
	   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
	   * записав сохраненный фильтр в cookie.
	   * @param {Event} evt
	   */
	  filterForm.onsubmit = function(evt) {
	    evt.preventDefault();
	
	    cleanupResizer();
	    updateBackground();
	
	    filterForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  };
	
	  /**
	   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
	   * выбранному значению в форме.
	   */
	  filterForm.onchange = function() {
	    if (!filterMap) {
	      // Ленивая инициализация. Объект не создается до тех пор, пока
	      // не понадобится прочитать его в первый раз, а после этого запоминается
	      // навсегда.
	      filterMap = {
	        'none': 'filter-none',
	        'chrome': 'filter-chrome',
	        'sepia': 'filter-sepia',
	        'marvin': 'filter-marvin'
	      };
	    }
	
	    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
	      return item.checked;
	    })[0].value;
	
	    // Класс перезаписывается, а не обновляется через classList потому что нужно
	    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
	    // состояние или просто перезаписывать.
	    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
	  };
	
	  cleanupResizer();
	  updateBackground();
	
	  // Валидация формы кадрирования изображения.
	
	  var resizeFields = document.querySelectorAll('.upload-resize-controls > input');
	  var resizeX = document.querySelector('#resize-x');
	  var resizeY = document.querySelector('#resize-y');
	  var resizeSide = document.querySelector('#resize-size');
	  var resizeSubmit = document.querySelector('#resize-fwd');
	
	  var validateResizeFields = function() {
	    if ((+resizeX.value + +resizeSide.value) > currentResizer._image.naturalWidth
	    || (+resizeY.value + +resizeSide.value) > currentResizer._image.naturalHeight
	    || resizeX.value < 0 || resizeY.value < 0) {
	      resizeSubmit.setAttribute('disabled', '');
	    } else {
	      resizeSubmit.removeAttribute('disabled');
	    }
	  };
	
	  resizeX.value = 0;
	  resizeY.value = 0;
	
	  for (var j = resizeFields.length - 1; j >= 0; j--) {
	    resizeFields[j].addEventListener('input', function() {
	      validateResizeFields();
	    } );
	  }
	
	})();


/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map