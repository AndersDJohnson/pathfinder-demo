(function () {
  var $$, Timer, algorithms, domReady, g, loadGridSearchFn, s;

  if (typeof window !== "undefined" && window !== null) {
    if (window.console == null) {
      window.console = {
        assert: function () { },
        count: function () { },
        debug: function () { },
        dir: function () { },
        dirxml: function () { },
        error: function () { },
        group: function () { },
        groupCollapsed: function () { },
        groupEnd: function () { },
        info: function () { },
        markTimeline: function () { },
        profile: function () { },
        profileEnd: function () { },
        time: function () { },
        timeEnd: function () { },
        trace: function () { },
        warn: function () { }
      };
    }
  }

  Timer = function () {
    this.startTime = 0;
    return this.endTime = 0;
  };

  Timer.prototype.start = function () {
    return this.startTime = (new Date()).getTime();
  };

  Timer.prototype.stop = function () {
    this.endTime = (new Date()).getTime();
    return this.endTime - this.startTime;
  };

  algorithms = {
    'DFS': {
      'id': '#dfs',
      'fn': 'DFS'
    },
    'BFS': {
      'id': '#bfs',
      'fn': 'BFS'
    },
    'UCS': {
      'id': '#ucs',
      'fn': 'UCS'
    },
    'GBFS Manhattan': {
      'id': '#gbfs',
      'fn': 'GBFSManhattan'
    },
    'A* Manhattan': {
      'id': '#astar-manhattan',
      'fn': 'AstarManhattan'
    }
  };

  s = 's';

  g = 'g';

  $$ = {};

  loadGridSearchFn = function (mods) {
    var loadGridSearch;
    loadGridSearch = function (gridObj) {
      var algo, cell, discovered, goal, goalName, graph, grid, gridMap, grids, i, j, name, pathcosts, row, runs, sharedGoal, sharedGraph, sharedStart, start, startName, statsArray, times;
      gridMap = mods._util.object_clone(gridObj['map']);
      for (i in gridMap) {
        row = gridMap[i];
        for (j in row) {
          cell = row[j];
          if (cell === 's') {
            startName = i + ',' + j;
            gridMap[i][j] = 1;
          } else if (cell === 'g') {
            goalName = i + ',' + j;
            gridMap[i][j] = 1;
          }
        }
      }
      if (startName == null) startName = gridObj['start'];
      if (goalName == null) goalName = gridObj['goal'];
      sharedGraph = mods.Graphs.graph_from_grid(gridMap);
      sharedStart = sharedGraph.getNode(startName);
      sharedGoal = sharedGraph.getNode(goalName);
      if (sharedGoal === null || sharedStart === null) {
        console.log("invalid start '" + startName + "' and/or goal '" + goalName + "'");
      }
      $$.editButton.unbind('click');
      $$.editButton.removeAttr('disabled');
      $$.editButton.on('click', function (e) {
        var cell, i, j, row, tempMap, toEdit, _len, _len2;
        tempMap = mods._util.object_clone(gridObj['map']);
        for (i = 0, _len = tempMap.length; i < _len; i++) {
          row = tempMap[i];
          for (j = 0, _len2 = row.length; j < _len2; j++) {
            cell = row[j];
            if (i === sharedStart.y && j === sharedStart.x) {
              tempMap[i][j] = 2;
            } else if (i === sharedGoal.y && j === sharedGoal.x) {
              tempMap[i][j] = 3;
            }
          }
        }
        toEdit = JSON.stringify(tempMap).replace(/\]\,/g, "],\n");
        $$.makeDialogInput.val(toEdit);
        return $$.makeDialog.dialog('open');
      });
      runs = [];
      grids = [];
      pathcosts = {};
      discovered = {};
      times = {};
      statsArray = [];
      for (name in algorithms) {
        algo = algorithms[name];
        grid = new mods.Grid.Grid(algo.id, gridMap);
        grids.push(grid);
        grid.draw();
        graph = mods._util.object_clone(sharedGraph);
        start = graph.getNode(startName);
        goal = graph.getNode(goalName);
        runs.push((function (name, algo, grid, graph, start, goal) {
          return function () {
            var callbacks, cell, discovery, fn, path, realCost, sp, statObject, time, timer, _i, _len;
            statObject = {};
            discovery = [];
            callbacks = {
              'visit': function (data) {
                return discovery.push(data);
              }
            };
            timer = new Timer();
            timer.start();
            fn = new mods.Graphs[algo.fn](graph, start, goal, callbacks);
            path = fn.run();
            time = timer.stop();
            if (path === null) {
              $this_stats.html('<span class="error">No path possible!</span>');
              return;
            }
            console.log(name + ':', path);
            times[algo.id] = time;
            pathcosts[algo.id] = path.length;
            discovered[algo.id] = discovery.length;
            statObject['name'] = name;
            statObject['discovery'] = discovery.length;
            realCost = 0;
            for (_i = 0, _len = path.length; _i < _len; _i++) {
              cell = path[_i];
              realCost += parseInt(grid.getCell(cell).attr("data-cost"));
            }
            console.log(realCost);
            statObject['pathcost'] = realCost;
            statObject['time'] = time;
            statsArray.push(statObject);
            if (path !== null) {
              sp = $$.animSpeedSlider.slider("option", "value");
              return grid.animateSearch({
                'speed': sp,
                'path': path,
                'discovery': discovery,
                'callback': function () { }
              });
            }
          };
        })(name, algo, grid, graph, start, goal));
      }
      $$.maps.unbind('run');
      $$.maps.on('run', function (e) {
        var $table, cls, discoveredMap, id, l, min, n, pathcostsMap, run, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _results;
        for (_i = 0, _len = runs.length; _i < _len; _i++) {
          run = runs[_i];
          run();
        }
        console.log(statsArray);
        $table = $('<table>');
        $$.stats.append($table);
        $table.dataTable({
          "bJQueryUI": true,
          "bDestroy": true,
          "bProcessing": true,
          "sPaginationType": "two_button",
          "aaData": statsArray,
          "aoColumns": [
            {
              "mDataProp": "name",
              "sTitle": "Algorithm"
            }, {
              "mDataProp": "pathcost",
              "sTitle": "Path Cost"
            }, {
              "mDataProp": "discovery",
              "sTitle": "Nodes Explored"
            }, {
              "mDataProp": "time",
              "sTitle": "Time (ms)"
            }
          ],
          "aaSorting": [[1, 'asc'], [2, 'asc'], [3, 'asc']]
        });
        pathcostsMap = {};
        min = Infinity;
        for (id in pathcosts) {
          l = pathcosts[id];
          min = l < min ? l : min;
          if (!(l in pathcostsMap)) pathcostsMap[l] = [];
          pathcostsMap[l].push(id);
        }
        cls = pathcostsMap[min].length > 1 ? 'tie' : 'win';
        _ref = pathcostsMap[min];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          id = _ref[_j];
          $(id + ' .stats .path-length').addClass(cls);
        }
        discoveredMap = {};
        min = Infinity;
        for (id in discovered) {
          n = discovered[id];
          min = n < min ? n : min;
          if (!(n in discoveredMap)) discoveredMap[n] = [];
          discoveredMap[n].push(id);
        }
        cls = discoveredMap[min].length > 1 ? 'tie' : 'win';
        _ref2 = discoveredMap[min];
        _results = [];
        for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
          id = _ref2[_k];
          _results.push($(id + ' .stats .explored').addClass(cls));
        }
        return _results;
      });
      $$.maps.unbind('reset');
      $$.maps.on('reset', function (e) {
        var grid, _i, _len;
        for (_i = 0, _len = grids.length; _i < _len; _i++) {
          grid = grids[_i];
          grid.cancelAnimate();
        }
        $$.stats.html('');
        return loadGridSearch(gridObj);
      });
      $$.gridSelect = $('select#map-select');
      $$.gridSelect.selectmenu({
        'style': 'dropdown',
        'width': 100,
        'menuWidth': 200,
        'wrapperElement': '<div class="float-left" />'
      });
      return $$.gridSelect.on('change', function (e) {
        var grid, _i, _len;
        for (_i = 0, _len = grids.length; _i < _len; _i++) {
          grid = grids[_i];
          grid.cancelAnimate();
        }
        return $$.stats.html('');
      });
    };
    return loadGridSearch;
  };

  domReady = function (mods, gridObjects) {
    var addMap, fileReaderErrorHandler, ga, loadDialogOptions, loadGridSearch, makeDialogOptions, name;
    if (gridObjects == null) gridObjects = {};
    addMap = function (obj) {
      var $opt, name;
      name = obj.name;
      gridObjects[name] = obj;
      $opt = $(document.createElement('option'));
      $opt.attr('value', name);
      $opt.html(name);
      return $$.gridSelect.append($opt);
    };
    $("button, input[type=button], input[type=submit], button").button();
    $$.maps = $('#maps');
    $$.allMapWraps = $('#maps .map-wrap');
    $$.allMaps = $('#maps .map');
    $$.stats = $('#stats');
    $$.statsTable = $$.stats.find('table');
    $$.tools = $('#tools');
    $$.gridSelect = $$.tools.find('#map-select');
    $$.runButton = $$.tools.find('input[type=button]#run');
    $$.resetButton = $$.tools.find('input[type=button]#reset');
    $$.makeButton = $$.tools.find('input[type=button]#make');
    $$.loadButton = $$.tools.find('input[type=button]#load');
    $$.editButton = $$.tools.find('input[type=button]#edit');
    $$.editButton.button('option', 'disabled', true);
    $$.zoomInButton = $$.tools.find('input[type=button]#zoomin');
    $$.zoomOutButton = $$.tools.find('input[type=button]#zoomout');
    $$.zoomSlider = $$.tools.find('#zoom-slider');
    $$.zoomInButton.button({
      icons: {
        primary: 'ui-icon-zoomin',
        secondary: 'ui-icon-triangle-1-s'
      }
    });
    $$.maps.jfontsize({
      btnMinus: $$.zoomOutButton.selector,
      uiSlider: $$.zoomSlider.selector,
      btnPlus: $$.zoomInButton.selector,
      btnMinusMaxHits: 10,
      btnPlusMaxHits: 10,
      sizeChange: 1
    });
    /*
    	$$.zoomInButton.on 'click', (e) ->
    		fs = $$.maps.css('font-size')
    		console.log fs
    */
    $$.animSpeedSlider = $$.tools.find('#anim-speed-slider');
    $$.animSpeedSlider.slider({
      'value': 50,
      'step': 5
    });
    $$.dialogs = $('#dialogs');
    $$.makeDialog = $$.dialogs.find('.dialog#dialog-make');
    $$.makeDialogInput = $$.makeDialog.find('#make-map-input');
    $$.makeDialogTips = $$.makeDialog.find('#make-form-tips');
    $$.loadDialog = $$.dialogs.find('.dialog#dialog-load');
    $$.loadDialogInput = $$.loadDialog.find('#load-map-input');
    $$.loadDialogTips = $$.loadDialog.find('#load-form-tips');
    for (name in gridObjects) {
      ga = gridObjects[name];
      ga['name'] = name;
      addMap(ga);
    }
    loadGridSearch = loadGridSearchFn(mods);
    fileReaderErrorHandler = function (e) {
      switch (e.target.error.code) {
        case e.target.error.NOT_FOUND_ERR:
          return alert("File not found!");
        case e.target.error.NOT_READABLE_ERR:
          return alert("File not readable!");
        case e.target.error.ABORT_ERR:
          break;
        default:
          return alert("An unknown error occurred reading the file. Your browser may not support this feature.");
      }
    };
    loadDialogOptions = {
      autoOpen: false,
      modal: true,
      close: function () {
        return $$.loadDialogInput.val("").removeClass("ui-state-error");
      },
      buttons: [
        {
          text: "Load",
          click: function () {
            var file, filelist, reader, _i, _len;
            if (typeof window.File === "undefined" || typeof window.FileReader === "undefined") {
              alert("No support for HTML5 File API!");
              return;
            }
            filelist = $$.loadDialogInput.get(0).files;
            if (filelist.length < 1) {
              alert("No files selected!");
              return;
            }
            for (_i = 0, _len = filelist.length; _i < _len; _i++) {
              file = filelist[_i];
              reader = new FileReader();
              reader.onloadend = function (e) {
                var _ref;
                if ((e != null ? (_ref = e.target) != null ? _ref.error : void 0 : void 0) != null) {
                  return fileReaderErrorHandler(e);
                } else {
                  s = 's';
                  g = 'g';
                  try {
                    return eval(e.target.result);
                  } catch (e) {
                    return alert("Error loading file ");
                  }
                }
              };
              reader.readAsText(file);
            }
            $(this).dialog("close");
            $$.runButton.button("option", "disabled", false);
            return $$.runButton.button("refresh");
          }
        }, {
          text: "Cancel",
          click: function () {
            return $(this).dialog("close");
          }
        }
      ]
    };
    $$.loadDialog.dialog(loadDialogOptions);
    $$.loadButton.on('click', function (e) {
      $$.loadDialogTips.html('');
      return $$.loadDialog.dialog('open');
    });
    makeDialogOptions = {
      autoOpen: false,
      modal: true,
      close: function () {
        return $$.makeDialogInput.val("").removeClass("ui-state-error");
      },
      buttons: [
        {
          text: "Make",
          click: function () {
            var cell, grid, gridObject, i, input, isInt, j, row, _len, _len2;
            input = (function () {
              return $$.makeDialogInput.val();
            })();
            console.log('input:', input);
            try {
              grid = JSON.parse(input);
              console.log(grid);
              gridObject = {
                'map': grid
              };
              if (!_.isArray(grid)) throw new Error('Map must be array.');
              if (!(grid.length > 0)) {
                throw new Error('Map must have at least one row.');
              }
              for (i = 0, _len = grid.length; i < _len; i++) {
                row = grid[i];
                if (!_.isArray(row)) {
                  throw new Error('Rows must be arrays (nested)');
                }
                if (!(row.length > 0)) {
                  throw new Error('Rows must have at least one cell.');
                }
                for (j = 0, _len2 = row.length; j < _len2; j++) {
                  cell = row[j];
                  isInt = (typeof cell === 'number') && (parseFloat(cell) === parseInt(cell)) && (!isNaN(cell));
                  if (!isInt) throw new Error('Cells must be integers.');
                  if (cell === 2) {
                    if ('start' in gridObject) {
                      throw new Error('Map has multiple start cells (2).');
                    }
                    gridObject['start'] = mods.Graphs.nameNode(i, j);
                    grid[i][j] = 0;
                  } else if (cell === 3) {
                    if ('goal' in gridObject) {
                      throw new Error('Map has multiple goal cells (3).');
                    }
                    gridObject['goal'] = mods.Graphs.nameNode(i, j);
                    grid[i][j] = 0;
                  } else if ((cell !== 0) && (cell !== 1)) {
                    throw new Error('Number ' + cell + ' has no meaning for cells.');
                  }
                }
              }
              if (!('start' in gridObject)) {
                throw new Error('Map must indicate start cell with 2.');
              }
              if (!('goal' in gridObject)) {
                throw new Error('Map must indicate goal cell with 3.');
              }
            } catch (error) {
              console.log(error.prototype);
              $$.makeDialogTips.html(error.message);
              $$.makeDialogInput.addClass("ui-state-error");
              return;
            }
            $(this).dialog("close");
            console.log('gridobj', gridObject);
            loadGridSearch(gridObject);
            $$.maps.trigger('reset');
            $$.runButton.button("option", "disabled", true);
            return $$.runButton.button("refresh");
          }
        }, {
          text: "Cancel",
          click: function () {
            return $(this).dialog("close");
          }
        }
      ]
    };
    $$.makeDialog.dialog(makeDialogOptions);
    $$.makeButton.on('click', function (e) {
      $$.makeDialogTips.html('');
      return $$.makeDialog.dialog('open');
    });
    $$.gridSelect.on('change', function (e) {
      var key;
      $$.allMaps.html('');
      key = $$.gridSelect.val();
      if (key in gridObjects) loadGridSearch(gridObjects[key]);
      $$.runButton.button("option", "disabled", false);
      return $$.runButton.button("refresh");
    });
    $$.runButton.on('click', function (e) {
      $$.maps.trigger('run');
      $$.runButton.button("option", "disabled", true);
      return $$.runButton.button("refresh");
    });
    $$.resetButton.on('click', function (e) {
      $$.maps.trigger('reset');
      $$.runButton.button("option", "disabled", false);
      return $$.runButton.button("refresh");
    });
    return loadGridSearch(_.values(gridObjects)[0]);
  };

  this.define(function (require) {
    var exports;
    exports = {
      'g': g,
      's': s,
      'domReady': domReady
    };
    return exports;
  });

}).call(this);
