
(function () {
  var baseWidth;

  baseWidth = 180;

  if (typeof this.define !== 'function') this.define = require('amdefine')(module);

  this.define(function (require) {
    var Graphs, Grid, exports;
    Graphs = require('Graphs');
    Grid = function (cssId, grid) {
      this.cssId = cssId;
      this.$div = $(cssId + ' .map');
      this.grid = grid;
      this.height = this.grid.length;
      return this.width = this.grid[0].length;
    };
    Grid.prototype.draw = function () {
      var $cell, $cells, $row, cell, em, i, j, px, row, _len, _len2, _ref;
      this.$div.html('');
      _ref = this.grid;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        row = _ref[i];
        $row = $(document.createElement('div'));
        $row.addClass('row');
        for (j = 0, _len2 = row.length; j < _len2; j++) {
          cell = row[j];
          $cell = $(document.createElement('div'));
          $cell.addClass('cell');
          if (cell !== -1) {
            $cell.addClass("cost");
            $cell.addClass("cost-" + cell);
            $cell.html("" + cell);
          } else {
            $cell.addClass('wall');
          }
          $cell.attr('data-name', Graphs.nameNode(i, j));
          $cell.attr('data-cost', cell);
          $row.append($cell);
        }
        this.$div.append($row);
      }
      $cells = this.$div.find('.cell');
      px = baseWidth / this.width;
      px = px < 5 ? 5 : px;
      em = px / 10;
      $cells.width(em + 'em');
      return $cells.height(em + 'em');
    };
    Grid.prototype.getCell = function (name) {
      return this.$div.find('[data-name="' + name + '"]');
    };
    Grid.prototype.withCell = function (name, fn) {
      return fn(this.getCell(name));
    };
    Grid.prototype.animatePath = function (opts) {
      var $cell, $cells, callback, i, j, name, path, speed, _len, _ref;
      path = opts.path;
      if (opts.speed == null) opts.speed = 50;
      speed = 1 - ((opts.speed + 1) / 101);
      callback = opts.callback || function () { };
      j = 1;
      $cells = (function () {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          name = path[_i];
          _results.push(this.getCell(name));
        }
        return _results;
      }).call(this);
      this.$cells = $cells;
      _ref = this.$cells;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        $cell = _ref[i];
        $cell.doTimeout('animatePath', speed * 300 * i, (function (i) {
          return function () {
            var color, props;
            $cell.addClass("path");
            color = i + 1 === $cells.length ? '#0CF' : '#0f0';
            props = {
              borderColor: color,
              backgroundColor: color
            };
            opts = {
              duration: speed * 500,
              complete: function () {
                return ++j;
              }
            };
            return this.animate(props, opts);
          };
        })(i));
      }
      return this.$div.doTimeout('animatePath', 50, function () {
        if (j === path.length) {
          callback();
          return false;
        }
        return true;
      });
    };
    Grid.prototype.animateSearch = function (opts) {
      var $cell, callback, data, discovery, i, j, name, path, speed, that, _i, _len, _len2, _ref,
        _this = this;
      i = 0;
      j = 0;
      path = opts.path;
      if (opts.speed == null) opts.speed = 50;
      speed = 1 - ((opts.speed + 1) / 101);
      callback = opts.callback || function () { };
      discovery = opts.discovery;
      this.$discoveredCells = [];
      that = this;
      for (_i = 0, _len = discovery.length; _i < _len; _i++) {
        data = discovery[_i];
        name = data['name'];
        this.withCell(name, function ($cell) {
          $cell.data('score', data['score']);
          return that.$discoveredCells.push($cell);
        });
      }
      _ref = this.$discoveredCells;
      for (i = 0, _len2 = _ref.length; i < _len2; i++) {
        $cell = _ref[i];
        $cell.doTimeout('animateSearch', speed * 300 * i, (function (i) {
          var colors;
          colors = ['red', 'orange', 'orange', 'orange', 'orange', 'yellow'];
          return function () {
            var $this, color, index, props, score;
            $this = this;
            $this.addClass('explored');
            score = $this.data('score');
            color = 'yellow';
            if (score) {
              index = Math.floor((((score / 2) * score) / discovery.length) * colors.length);
              if ((0 <= index && index < colors.length)) color = colors[index];
            }
            props = {
              borderColor: i + 1 === discovery.length ? 'purple' : color
            };
            opts = {
              duration: speed * 500,
              complete: function () {
                return ++j;
              }
            };
            $(this).animate(props, opts);
            return false;
          };
        })(i));
      }
      return this.$div.doTimeout('animateSearch', 50, function () {
        if (j === i) {
          _this.animatePath({
            'path': path,
            'speed': opts.speed,
            'callback': callback
          });
          return false;
        }
        return true;
      });
    };
    Grid.prototype.cancelAnimate = function () {
      var c, dc, _i, _j, _len, _len2, _ref, _ref2, _results;
      this.$div.doTimeout('animatePath');
      if (this.$cells) {
        _ref = this.$cells;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          c.doTimeout('animatePath');
        }
      }
      this.$div.doTimeout('animateSearch');
      if (this.discoveredCells) {
        _ref2 = this.discoveredCells;
        _results = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          dc = _ref2[_j];
          _results.push(dc.doTimeout('animateSearch'));
        }
        return _results;
      }
    };
    exports = {
      'Grid': Grid
    };
    return exports;
  });

}).call(this);
