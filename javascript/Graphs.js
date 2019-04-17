
(function () {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  if (typeof this.define !== 'function') this.define = require('amdefine')(module);

  this.define(function (require) {
    var Astar, AstarManhattan, BFS, DFS, Edge, GBFS, GBFSManhattan, Graph, Node, Search, UCS, exports, graph_from_grid, manhattanDistance, nameNode;
    Edge = function (from, to, cost) {
      if (from == null) from = null;
      if (to == null) to = null;
      if (cost == null) cost = 1;
      this.from = from;
      this.to = to;
      return this;
    };
    Node = function (name, cost, x, y) {
      if (name == null) name = '';
      if (cost == null) cost = 1;
      if (x == null) x = NaN;
      if (y == null) y = NaN;
      this.name = name;
      this.visited = false;
      this.x = x;
      this.y = y;
      this.cost = cost;
      return this;
    };
    Node.prototype.visit = function () {
      return this.visited = true;
    };
    Graph = function () {
      this._nid = 0;
      this.nodes = {};
      this.edges = {};
      return this;
    };
    Graph.prototype.numNodes = function () {
      var k, n, v, _len, _ref;
      n = 0;
      _ref = this.nodes;
      for (v = 0, _len = _ref.length; v < _len; v++) {
        k = _ref[v];
        ++n;
      }
      return n;
    };
    Graph.prototype.addNode = function (node) {
      node['_nid'] = '' + (this._nid++);
      this.nodes[node.name] = node;
      return node;
    };
    Graph.prototype.addNodes = function (nodes) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        _results.push(this.addNode(node));
      }
      return _results;
    };
    Graph.prototype.getNode = function (name) {
      if (name in this.nodes) {
        return this.nodes[name];
      } else {
        return null;
      }
    };
    Graph.prototype.getNodes = function () {
      return this.nodes;
    };
    Graph.prototype.addEdge = function (edge) {
      var key;
      key = edge.from['_nid'];
      if (!(key in this.edges)) this.edges[key] = [];
      return this.edges[key].push(edge);
    };
    Graph.prototype.addEdges = function (edges) {
      var edge, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = edges.length; _i < _len; _i++) {
        edge = edges[_i];
        _results.push(this.addEdge(edge));
      }
      return _results;
    };
    Graph.prototype.getEdges = function (node) {
      if (node == null) node = null;
      if (node === null) {
        return this.edges;
      } else {
        return this.edges[node['_nid']];
      }
    };
    nameNode = function (i, j) {
      return i + ',' + j;
    };
    graph_from_grid = function (grid) {
      var adj, cell, edge, fromName, fromNode, graph, i, i2, j, j2, row, toName, toNode, _i, _len, _len2, _len3, _ref;
      graph = new Graph();
      for (i = 0, _len = grid.length; i < _len; i++) {
        row = grid[i];
        for (j = 0, _len2 = row.length; j < _len2; j++) {
          cell = row[j];
          if (cell !== -1) {
            fromName = nameNode(i, j);
            fromNode = graph.getNode(fromName);
            if (fromNode === null) {
              fromNode = new Node(fromName, cell, j, i);
              graph.addNode(fromNode);
            }
            _ref = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]];
            for (_i = 0, _len3 = _ref.length; _i < _len3; _i++) {
              adj = _ref[_i];
              i2 = adj[0];
              j2 = adj[1];
              if (i2 < 0 || i2 > grid.length - 1 || j2 < 0 || j2 > row.length - 1) {
                continue;
              }
              if (grid[i2][j2] < 0) continue;
              toName = nameNode(i2, j2);
              toNode = graph.getNode(toName);
              if (toNode === null) {
                toNode = new Node(toName, cell, j2, i2);
                graph.addNode(toNode);
              }
              edge = new Edge(fromNode, toNode);
              graph.addEdge(edge);
            }
          }
        }
      }
      return graph;
    };
    Search = (function () {

      function Search(graph, start, goal, callbacks) {
        if (callbacks == null) callbacks = {};
        this.graph = graph;
        this.start = start;
        this.goal = goal;
        this.callbacks = callbacks;
      }

      return Search;

    })();
    DFS = (function (_super) {

      __extends(DFS, _super);

      function DFS() {
        DFS.__super__.constructor.apply(this, arguments);
      }

      DFS.prototype.run = function () {
        var current, edge, edges, node, path, stack, visited, _i, _len;
        visited = {};
        stack = [[this.start]];
        while (stack.length > 0) {
          path = stack.pop();
          current = path[path.length - 1];
          if (visited[current.name] === true) continue;
          if (this.callbacks.visit && visited[current.name] !== true) {
            this.callbacks.visit({
              'name': current.name
            });
          }
          visited[current.name] = true;
          if (current.name === this.goal.name) {
            return (function () {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = path.length; _i < _len; _i++) {
                node = path[_i];
                _results.push(node.name);
              }
              return _results;
            })();
          }
          edges = this.graph.getEdges(current);
          if (!edges) continue;
          for (_i = 0, _len = edges.length; _i < _len; _i++) {
            edge = edges[_i];
            if (visited[edge.to.name] !== true) stack.push(path.concat([edge.to]));
          }
        }
        return null;
      };

      return DFS;

    })(Search);
    BFS = (function (_super) {

      __extends(BFS, _super);

      function BFS() {
        BFS.__super__.constructor.apply(this, arguments);
      }

      BFS.prototype.run = function () {
        var current, edge, edges, node, path, queue, visited, _i, _len;
        visited = {};
        queue = [[this.start]];
        while (queue.length > 0) {
          path = queue.shift();
          current = path[path.length - 1];
          if (visited[current.name] === true) continue;
          if (this.callbacks.visit && visited[current.name] !== true) {
            this.callbacks.visit({
              'name': current.name
            });
          }
          visited[current.name] = true;
          if (current.name === this.goal.name) {
            return (function () {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = path.length; _i < _len; _i++) {
                node = path[_i];
                _results.push(node.name);
              }
              return _results;
            })();
          }
          edges = this.graph.getEdges(current);
          if (!edges) continue;
          for (_i = 0, _len = edges.length; _i < _len; _i++) {
            edge = edges[_i];
            if (visited[edge.to.name] !== true) queue.push(path.concat([edge.to]));
          }
        }
        return null;
      };

      return BFS;

    })(Search);
    manhattanDistance = function (node1, node2) {
      return Math.abs(node2.y - node1.y) + Math.abs(node2.x - node1.x);
    };
    Astar = (function (_super) {

      __extends(Astar, _super);

      function Astar() {
        var args, heuristic, _i;
        args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), heuristic = arguments[_i++];
        Astar.__super__.constructor.apply(this, args);
        this.heuristic = heuristic;
      }

      Astar.prototype.run = function () {
        var candF, candidate, closed, current, currentName, edge, edges, f, from, g, h, i, inOpen, minF, minFnode, o, open, path, temp_better, temp_g, _i, _j, _len, _len2, _len3, _len4;
        closed = {};
        open = [this.start];
        from = {};
        g = {};
        g[this.start.name] = 0;
        h = {};
        h[this.start.name] = this.heuristic(this.start, this.goal);
        f = {};
        f[this.start.name] = g[this.start.name] + h[this.start.name];
        while (open.length > 0) {
          minF = Infinity;
          minFnode = null;
          for (_i = 0, _len = open.length; _i < _len; _i++) {
            candidate = open[_i];
            if (!(candidate.name in f)) continue;
            candF = candidate.name in f ? f[candidate.name] : -Infinity;
            if (candF < minF) {
              minF = candF;
              minFnode = candidate;
            }
          }
          if (minFnode === null) return null;
          current = minFnode;
          if (this.callbacks.visit) {
            this.callbacks.visit({
              'name': current.name,
              'score': h[current.name]
            });
          }
          if (current.name === this.goal.name) {
            path = [];
            currentName = this.goal.name;
            while (currentName in from) {
              path.unshift(currentName);
              currentName = from[currentName];
            }
            path.unshift(this.start.name);
            return path;
          }
          for (i = 0, _len2 = open.length; i < _len2; i++) {
            o = open[i];
            if (o.name === current.name) {
              open.splice(i, 1);
              break;
            }
          }
          closed[current.name] = current;
          edges = this.graph.getEdges(current);
          if (!edges) continue;
          for (_j = 0, _len3 = edges.length; _j < _len3; _j++) {
            edge = edges[_j];
            if (edge.to.name in closed) continue;
            temp_g = g[current.name] + edge.to.cost;
            inOpen = false;
            for (i = 0, _len4 = open.length; i < _len4; i++) {
              o = open[i];
              if (o.name === edge.to.name) {
                inOpen = true;
                break;
              }
            }
            if (!inOpen) {
              open.push(edge.to);
              h[edge.to.name] = this.heuristic(edge.to, this.goal);
              temp_better = true;
            } else if (temp_g < g[edge.to.name]) {
              temp_better = true;
            } else {
              temp_better = false;
            }
            if (temp_better) {
              from[edge.to.name] = current.name;
              g[edge.to.name] = temp_g;
              f[edge.to.name] = g[edge.to.name] + h[edge.to.name];
            }
          }
        }
        return null;
      };

      return Astar;

    })(Search);
    AstarManhattan = (function (_super) {

      __extends(AstarManhattan, _super);

      function AstarManhattan() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.push(manhattanDistance);
        AstarManhattan.__super__.constructor.apply(this, args);
      }

      return AstarManhattan;

    })(Astar);
    GBFS = (function (_super) {

      __extends(GBFS, _super);

      function GBFS() {
        var args, heuristic, _i;
        args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), heuristic = arguments[_i++];
        GBFS.__super__.constructor.apply(this, args);
        this.heuristic = heuristic;
      }

      GBFS.prototype.run = function () {
        var candF, candidate, closed, current, currentName, edge, edges, f, from, g, h, i, inOpen, minF, minFnode, o, open, path, temp_better, temp_g, _i, _j, _len, _len2, _len3, _len4;
        closed = {};
        open = [this.start];
        from = {};
        g = {};
        g[this.start.name] = 0;
        h = {};
        h[this.start.name] = this.heuristic(this.start, this.goal);
        f = {};
        f[this.start.name] = g[this.start.name] + h[this.start.name];
        while (open.length > 0) {
          minF = Infinity;
          minFnode = null;
          for (_i = 0, _len = open.length; _i < _len; _i++) {
            candidate = open[_i];
            if (!(candidate.name in f)) continue;
            candF = candidate.name in f ? f[candidate.name] : -Infinity;
            if (candF < minF) {
              minF = candF;
              minFnode = candidate;
            }
          }
          if (minFnode === null) return null;
          current = minFnode;
          if (this.callbacks.visit) {
            this.callbacks.visit({
              'name': current.name,
              'score': h[current.name]
            });
          }
          if (current.name === this.goal.name) {
            path = [];
            currentName = this.goal.name;
            while (currentName in from) {
              path.unshift(currentName);
              currentName = from[currentName];
            }
            path.unshift(this.start.name);
            return path;
          }
          for (i = 0, _len2 = open.length; i < _len2; i++) {
            o = open[i];
            if (o.name === current.name) {
              open.splice(i, 1);
              break;
            }
          }
          closed[current.name] = current;
          edges = this.graph.getEdges(current);
          if (!edges) continue;
          for (_j = 0, _len3 = edges.length; _j < _len3; _j++) {
            edge = edges[_j];
            if (edge.to.name in closed) continue;
            temp_g = g[current.name] + edge.to.cost;
            inOpen = false;
            for (i = 0, _len4 = open.length; i < _len4; i++) {
              o = open[i];
              if (o.name === edge.to.name) {
                inOpen = true;
                break;
              }
            }
            if (!inOpen) {
              open.push(edge.to);
              h[edge.to.name] = this.heuristic(edge.to, this.goal);
              temp_better = true;
            } else if (temp_g < g[edge.to.name]) {
              temp_better = true;
            } else {
              temp_better = false;
            }
            if (temp_better) {
              from[edge.to.name] = current.name;
              g[edge.to.name] = temp_g;
              f[edge.to.name] = h[edge.to.name];
            }
          }
        }
        return null;
      };

      return GBFS;

    })(Search);
    GBFSManhattan = (function (_super) {

      __extends(GBFSManhattan, _super);

      function GBFSManhattan() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.push(manhattanDistance);
        GBFSManhattan.__super__.constructor.apply(this, args);
      }

      return GBFSManhattan;

    })(GBFS);
    AstarManhattan = (function (_super) {

      __extends(AstarManhattan, _super);

      function AstarManhattan() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.push(manhattanDistance);
        AstarManhattan.__super__.constructor.apply(this, args);
      }

      return AstarManhattan;

    })(Astar);
    UCS = (function (_super) {

      __extends(UCS, _super);

      function UCS() {
        UCS.__super__.constructor.apply(this, arguments);
      }

      UCS.prototype.run = function () {
        var candF, candidate, closed, current, currentName, edge, edges, f, from, g, i, inOpen, minF, minFnode, o, open, path, temp_better, temp_g, _i, _j, _len, _len2, _len3, _len4;
        closed = {};
        open = [this.start];
        from = {};
        g = {};
        g[this.start.name] = 0;
        f = {};
        f[this.start.name] = g[this.start.name];
        while (open.length > 0) {
          minF = Infinity;
          minFnode = null;
          for (_i = 0, _len = open.length; _i < _len; _i++) {
            candidate = open[_i];
            if (!(candidate.name in f)) continue;
            candF = candidate.name in f ? f[candidate.name] : -Infinity;
            if (candF < minF) {
              minF = candF;
              minFnode = candidate;
            }
          }
          if (minFnode === null) return null;
          current = minFnode;
          if (this.callbacks.visit) {
            this.callbacks.visit({
              'name': current.name
            });
          }
          if (current.name === this.goal.name) {
            path = [];
            currentName = this.goal.name;
            while (currentName in from) {
              path.unshift(currentName);
              currentName = from[currentName];
            }
            path.unshift(this.start.name);
            return path;
          }
          for (i = 0, _len2 = open.length; i < _len2; i++) {
            o = open[i];
            if (o.name === current.name) {
              open.splice(i, 1);
              break;
            }
          }
          closed[current.name] = current;
          edges = this.graph.getEdges(current);
          if (!edges) continue;
          for (_j = 0, _len3 = edges.length; _j < _len3; _j++) {
            edge = edges[_j];
            if (edge.to.name in closed) continue;
            temp_g = g[current.name] + edge.to.cost;
            inOpen = false;
            for (i = 0, _len4 = open.length; i < _len4; i++) {
              o = open[i];
              if (o.name === edge.to.name) {
                inOpen = true;
                break;
              }
            }
            if (!inOpen) {
              open.push(edge.to);
              temp_better = true;
            } else if (temp_g < g[edge.to.name]) {
              temp_better = true;
            } else {
              temp_better = false;
            }
            if (temp_better) {
              from[edge.to.name] = current.name;
              g[edge.to.name] = temp_g;
              f[edge.to.name] = g[edge.to.name];
            }
          }
        }
        return null;
      };

      return UCS;

    })(Search);
    exports = {
      'Node': Node,
      'Edge': Edge,
      'Graph': Graph,
      'graph_from_grid': graph_from_grid,
      'DFS': DFS,
      'BFS': BFS,
      'UCS': UCS,
      'AstarManhattan': AstarManhattan,
      'GBFSManhattan': GBFSManhattan,
      'nameNode': nameNode
    };
    return exports;
  });

}).call(this);
