###
Anders D. Johnson
joh07557@umn.edu
UMN ID: 3955359
###

if typeof @define isnt 'function'
	@define = require('amdefine')(module)

@define( (require) ->
	
	Edge = ( from = null, to = null, cost = 1 ) ->
		@from = from
		@to = to
		#@cost = cost
		@
	
	Node = ( name = '', cost = 1, x = NaN, y = NaN ) ->
		@name = name
		@visited = false
		@x = x
		@y = y
		@cost = cost
		@
	
	Node.prototype.visit = () ->
		@visited = true
	
	Graph = () ->
		@_nid = 0
		@nodes = {}
		@edges = {}
		@
	
	Graph.prototype.numNodes = () ->
		n = 0
		for own k,v in @nodes
			++n
		return n

	Graph.prototype.addNode = ( node ) ->
		node['_nid'] = ''+(@_nid++)
		@nodes[node.name] = node
		node
	
	Graph.prototype.addNodes = ( nodes ) ->
		for node in nodes
			@addNode node
	
	Graph.prototype.getNode = ( name ) ->
		if name of @nodes
			return @nodes[name]
		else return null
	
	Graph.prototype.getNodes = () ->
		@nodes
	
	Graph.prototype.addEdge = ( edge ) ->
		key = edge.from['_nid']
		unless key of @edges
			@edges[key] = []
		@edges[key].push edge
	
	Graph.prototype.addEdges = ( edges ) ->
		for edge in edges
			@addEdge edge
	
	Graph.prototype.getEdges = ( node = null ) ->
		if node is null
			return @edges
		else
			return @edges[node['_nid']]
	
	nameNode = (i,j) ->
		return i + ',' + j
	
	graph_from_grid = ( grid ) ->
		graph = new Graph()
		for row, i in grid
			for cell, j in row
				if cell isnt -1
					fromName = nameNode(i,j)
					fromNode = graph.getNode fromName
					if fromNode is null
						fromNode = new Node fromName, cell, j, i
						graph.addNode fromNode
					for adj in [[i-1, j], [i+1, j], [i, j-1], [i, j+1]]
						i2 = adj[0]
						j2 = adj[1]
						continue if i2 < 0 or i2 > grid.length - 1 or j2 < 0 or j2 > row.length - 1
						continue if grid[i2][j2] < 0
						toName = nameNode(i2,j2)
						toNode = graph.getNode toName
						if toNode is null
							toNode = new Node toName, cell, j2, i2
							graph.addNode toNode
						edge = new Edge fromNode, toNode
						graph.addEdge edge
		return graph
	
	class Search
		constructor: ( graph, start, goal, callbacks = {} ) ->
			@graph = graph
			@start = start
			@goal = goal
			@callbacks = callbacks
	
	class DFS extends Search
		constructor: ->
			super
		
		run: () ->
			visited = {}
			stack = [[@start]]
			while stack.length > 0
				path = stack.pop()
				current = path[path.length-1]
				continue unless visited[current.name] isnt true
				if @callbacks.visit and visited[current.name] isnt true
					@callbacks.visit {'name': current.name}
				visited[current.name] = true
				if current.name is @goal.name
					return (node.name for node in path)
				edges = @graph.getEdges current
				continue unless edges
				for edge in edges
					if visited[edge.to.name] isnt true
						stack.push path.concat([edge.to])
			return null
	
	class BFS extends Search
		constructor: ->
			super
		
		run: () ->
			visited = {}
			queue = [[@start]]
			while queue.length > 0
				path = queue.shift()
				current = path[path.length-1]
				continue unless visited[current.name] isnt true
				if @callbacks.visit and visited[current.name] isnt true
					@callbacks.visit {'name': current.name}
				visited[current.name] = true
				if current.name is @goal.name
					return (node.name for node in path)
				edges = @graph.getEdges current
				continue unless edges
				for edge in edges
					if visited[edge.to.name] isnt true
						queue.push path.concat([edge.to])
			return null
			
	
	manhattanDistance = ( node1, node2 ) ->
		return Math.abs( node2.y - node1.y ) + Math.abs( node2.x - node1.x )
	
	
	class Astar extends Search
		constructor: (args..., heuristic ) ->
			Astar.__super__.constructor.apply @, args
			@heuristic = heuristic
		
		run: () ->
			closed = {}
			open = [@start]
			from = {}

			g = {}
			g[@start.name] = 0
			h = {}
			h[@start.name] = @heuristic @start, @goal
			f = {}
			f[@start.name] = g[@start.name] + h[@start.name]
		
			while open.length > 0
				minF = Infinity
				minFnode = null
				for candidate in open
					continue unless candidate.name of f
					candF = if candidate.name of f then f[candidate.name] else -Infinity
					if candF < minF
						minF = candF
						minFnode = candidate
				return null if minFnode is null
				current = minFnode
			
				if @callbacks.visit then @callbacks.visit({
					'name': current.name
					'score': h[current.name]
				})
			
				if current.name is @goal.name
					path = []
					currentName = @goal.name
					while currentName of from
						path.unshift currentName
						currentName = from[currentName]
					path.unshift @start.name
					return path
			
				for o, i in open
					if o.name is current.name
						open.splice i, 1
						break
				closed[current.name] = current
			
				edges = @graph.getEdges current
				continue unless edges
				for edge in edges
					continue if edge.to.name of closed
					#temp_g = g[current.name] + edge.cost
					temp_g = g[current.name] + edge.to.cost
				
					inOpen = false
					for o, i in open
						if o.name is edge.to.name
							inOpen = true
							break
					if not inOpen
						open.push edge.to
						h[edge.to.name] = @heuristic edge.to, @goal
						temp_better = true
					else if temp_g < g[edge.to.name]
						temp_better = true
					else
						temp_better = false

					if temp_better
						from[edge.to.name] = current.name
						g[edge.to.name] = temp_g
						f[edge.to.name] = g[edge.to.name] + h[edge.to.name]

			return null
	
	
	class AstarManhattan extends Astar
		constructor: (args...) ->
			args.push(manhattanDistance)
			AstarManhattan.__super__.constructor.apply @, args
	
	
	class GBFS extends Search
		constructor: (args..., heuristic ) ->
			GBFS.__super__.constructor.apply @, args
			@heuristic = heuristic
		
		run: () ->
			closed = {}
			open = [@start]
			from = {}

			g = {}
			g[@start.name] = 0
			h = {}
			h[@start.name] = @heuristic @start, @goal
			f = {}
			f[@start.name] = g[@start.name] + h[@start.name]
		
			while open.length > 0
				minF = Infinity
				minFnode = null
				for candidate in open
					continue unless candidate.name of f
					candF = if candidate.name of f then f[candidate.name] else -Infinity
					if candF < minF
						minF = candF
						minFnode = candidate
				return null if minFnode is null
				current = minFnode
			
				if @callbacks.visit then @callbacks.visit({
					'name': current.name
					'score': h[current.name]
				})
			
				if current.name is @goal.name
					path = []
					currentName = @goal.name
					while currentName of from
						path.unshift currentName
						currentName = from[currentName]
					path.unshift @start.name
					return path
			
				for o, i in open
					if o.name is current.name
						open.splice i, 1
						break
				closed[current.name] = current
			
				edges = @graph.getEdges current
				continue unless edges
				for edge in edges
					continue if edge.to.name of closed
					temp_g = g[current.name] + edge.to.cost
				
					inOpen = false
					for o, i in open
						if o.name is edge.to.name
							inOpen = true
							break
					if not inOpen
						open.push edge.to
						h[edge.to.name] = @heuristic edge.to, @goal
						temp_better = true
					else if temp_g < g[edge.to.name]
						temp_better = true
					else
						temp_better = false

					if temp_better
						from[edge.to.name] = current.name
						g[edge.to.name] = temp_g
						f[edge.to.name] = h[edge.to.name]

			return null
	
	class GBFSManhattan extends GBFS
		constructor: (args...) ->
			args.push(manhattanDistance)
			GBFSManhattan.__super__.constructor.apply @, args
	
	
	class AstarManhattan extends Astar
		constructor: (args...) ->
			args.push(manhattanDistance)
			AstarManhattan.__super__.constructor.apply @, args
	
	
	class UCS extends Search
		
		run: () ->
			closed = {}
			open = [@start]
			from = {}

			g = {}
			g[@start.name] = 0
			f = {}
			f[@start.name] = g[@start.name]
		
			while open.length > 0
				minF = Infinity
				minFnode = null
				for candidate in open
					continue unless candidate.name of f
					candF = if candidate.name of f then f[candidate.name] else -Infinity
					if candF < minF
						minF = candF
						minFnode = candidate
				return null if minFnode is null
				current = minFnode
			
				if @callbacks.visit then @callbacks.visit({
					'name': current.name
					#'score': h[current.name]
				})
			
				if current.name is @goal.name
					path = []
					currentName = @goal.name
					while currentName of from
						path.unshift currentName
						currentName = from[currentName]
					path.unshift @start.name
					return path
			
				for o, i in open
					if o.name is current.name
						open.splice i, 1
						break
				closed[current.name] = current
			
				edges = @graph.getEdges current
				continue unless edges
				for edge in edges
					continue if edge.to.name of closed
					#temp_g = g[current.name] + edge.cost
					temp_g = g[current.name] + edge.to.cost
				
					inOpen = false
					for o, i in open
						if o.name is edge.to.name
							inOpen = true
							break
					if not inOpen
						open.push edge.to
						temp_better = true
					else if temp_g < g[edge.to.name]
						temp_better = true
					else
						temp_better = false

					if temp_better
						from[edge.to.name] = current.name
						g[edge.to.name] = temp_g
						f[edge.to.name] = g[edge.to.name]

			return null
	
	
	exports =
		'Node': Node
		'Edge': Edge
		'Graph': Graph
		'graph_from_grid': graph_from_grid
		'DFS': DFS
		'BFS': BFS
		'UCS': UCS
		'AstarManhattan': AstarManhattan
		'GBFSManhattan': GBFSManhattan
		'nameNode': nameNode
	
	return exports
)
