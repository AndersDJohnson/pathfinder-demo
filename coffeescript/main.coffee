###
Anders D. Johnson
joh07557@umn.edu
UMN ID: 3955359
###

Timer = () ->
	@startTime = 0
	@endTime = 0

Timer.prototype.start = () ->
	@startTime = (new Date()).getTime()

Timer.prototype.stop = () ->
	@endTime = (new Date()).getTime()
	@endTime - @startTime

algorithms =
	'DFS':
		'id': '#dfs'
		'fn': 'DFS'
	'BFS':
		'id': '#bfs'
		'fn': 'BFS'
	'UCS':
		'id': '#ucs'
		'fn': 'UCS'
	'GBFS Manhattan':
		'id': '#gbfs'
		'fn': 'GBFSManhattan'
	'A* Manhattan':
		'id': '#astar-manhattan'
		'fn': 'AstarManhattan'

s = 's'
g = 'g'

# jQuery object store
$$ = {}

loadGridSearchFn = (mods) ->
	loadGridSearch = ( gridObj ) ->
		gridMap = mods._util.object_clone gridObj['map']
		for i, row of gridMap
			for j, cell of row
				if cell is 's'
					startName = i+','+j
					gridMap[i][j] = 1
				else if cell is 'g'
					goalName = i+','+j
					gridMap[i][j] = 1
		
		startName ?= gridObj['start']
		goalName ?= gridObj['goal']
		
		sharedGraph = mods.Graphs.graph_from_grid gridMap
		sharedStart = sharedGraph.getNode startName
		sharedGoal = sharedGraph.getNode goalName
	
		if sharedGoal is null or sharedStart is null
			console.log "invalid start '#{startName}' and/or goal '#{goalName}'"
	
		$$.editButton.unbind('click')
		$$.editButton.removeAttr('disabled')
		$$.editButton.on('click', (e) ->
			tempMap = mods._util.object_clone( gridObj['map'] )
			for row, i in tempMap
				for cell, j in row
					if i is sharedStart.y and j is sharedStart.x
						tempMap[i][j] = 2
					else if i is sharedGoal.y and j is sharedGoal.x
						tempMap[i][j] = 3
			toEdit = JSON.stringify(tempMap).replace(/\]\,/g, "],\n")
			$$.makeDialogInput.val( toEdit )
			$$.makeDialog.dialog('open')
		)
	
		runs = []
		grids = []
		pathLengths = {}
		discovered = {}
		times = {}
		
		statsArray = []
		for name, algo of algorithms
			grid = new mods.Grid.Grid algo.id, gridMap
			grids.push grid
			grid.draw()
			graph = mods._util.object_clone sharedGraph
			start = graph.getNode startName
			goal = graph.getNode goalName
			runs.push ((name, algo, grid, graph, start, goal) ->
				return () ->
					#$this_stats = $(algo.id + ' .stats')
					statObject = {}
					discovery = []
					callbacks =
						'visit': ( data ) ->
							discovery.push data
					timer = new Timer()
					timer.start()
					fn = new mods.Graphs[algo.fn]( graph, start, goal, callbacks )
					path = fn.run()
					time = timer.stop()
					if path is null
						$this_stats.html( '<span class="error">No path possible!</span>' )
						return
					console.log name + ':', path
					times[algo.id] = time
					pathLengths[algo.id] = path.length
					discovered[algo.id] = discovery.length
					statObject['name'] = name
					statObject['discovery'] = discovery.length
					statObject['pathlength'] = path.length
					statObject['time'] = time
					statsArray.push statObject
					#html = ''
					#html += '<span class="explored">Explored: ' + discovery.length + "</span>\n"
					#html += '<span class="path-length">Path length: ' + path.length + "</span>\n"
					#html += '<span class="time">Time: ' + time + " ms</span>\n"
					#$this_stats.html( html )
					if path isnt null
						sp = $$.animSpeedSlider.slider("option", "value") 
						grid.animateSearch({
							'speed': sp
							'path': path
							'discovery': discovery
							'callback': () ->
								#console.log 'done ' + name
						})
			)(name, algo, grid, graph, start, goal)
		
		$$.maps.unbind('run')
		$$.maps.on('run', (e) ->
			for run in runs
				run()
			
			console.log(statsArray)
			$table = $('<table>')
			$$.stats.append($table)
			$table.dataTable({
				"bJQueryUI": true
				"bDestroy": true
				"bProcessing": true
				"sPaginationType": "two_button"
				"aaData": statsArray
				"aoColumns": [
					{
						"mDataProp": "name",
						"sTitle": "Algorithm"
					},
					{
						"mDataProp": "pathlength",
						"sTitle": "Path Length"
					},
					{
						"mDataProp": "discovery",
						"sTitle": "Nodes Explored"
					},
					{
						"mDataProp": "time",
						"sTitle": "Time (ms)"
					}
				]
				"aaSorting": [[1,'asc'], [2,'asc'], [3,'asc']]
			})
			
			pathLengthsMap = {}
			min = Infinity
			for id, l of pathLengths
				min = if l < min then l else min
				if not (l of pathLengthsMap)
					pathLengthsMap[l] = []
				pathLengthsMap[l].push id
			cls = if pathLengthsMap[min].length > 1 then 'tie' else 'win'
			for id in pathLengthsMap[min]
				$(id + ' .stats .path-length').addClass(cls)
		
			discoveredMap = {}
			min = Infinity
			for id, n of discovered
				min = if n < min then n else min
				if not (n of discoveredMap)
					discoveredMap[n] = []
				discoveredMap[n].push id
			cls = if discoveredMap[min].length > 1 then 'tie' else 'win'
			for id in discoveredMap[min]
				$(id + ' .stats .explored').addClass(cls)
		)
	
		$$.maps.unbind('reset')
		$$.maps.on('reset', (e) ->
			for grid in grids
				grid.cancelAnimate()
			#$wins = $$.maps.find('.map-wrap .stats .win').removeClass('win')
			$$.stats.html('')
			loadGridSearch gridObj
		)
	
		$$.gridSelect = $('select#map-select')
		$$.gridSelect.selectmenu({
			'style': 'dropdown',
			'width': 100, 
			'menuWidth': 200, 
			'wrapperElement': '<div class="float-left" />'
		})
		#$$.gridSelect.closest('div').addClass('float-left')
		$$.gridSelect.on('change', (e) ->
			for grid in grids
				grid.cancelAnimate()
			#$wins = $$.maps.find('.map-wrap .stats .win').removeClass('win')
			$$.stats.html('')
		)
	return loadGridSearch

domReady = ( mods, gridObjects = {} ) ->
	
	addMap = ( obj ) ->
		name = obj.name
		gridObjects[name] = obj
		$opt = $(document.createElement('option'))
		$opt.attr('value', name)
		$opt.html(name)
		$$.gridSelect.append($opt)
	
	$("button, input[type=button], input[type=submit], button").button();
	
	$$.maps = $('#maps')
	$$.allMapWraps = $('#maps .map-wrap')
	$$.allMaps = $('#maps .map')
	
	$$.stats = $('#stats')
	$$.statsTable = $$.stats.find('table')
	
	$$.tools = $('#tools')
	$$.gridSelect = $$.tools.find('#map-select')
	$$.runButton = $$.tools.find('input[type=button]#run')
	$$.resetButton = $$.tools.find('input[type=button]#reset')
	$$.makeButton = $$.tools.find('input[type=button]#make')
	$$.loadButton = $$.tools.find('input[type=button]#load')
	$$.editButton = $$.tools.find('input[type=button]#edit')
	$$.editButton.button('option', 'disabled', true)
	
	$$.zoomInButton = $$.tools.find('input[type=button]#zoomin')
	$$.zoomOutButton = $$.tools.find('input[type=button]#zoomout')
	$$.zoomSlider = $$.tools.find('#zoom-slider')
	
	$$.zoomInButton.button({ icons: {primary:'ui-icon-zoomin',secondary:'ui-icon-triangle-1-s'} })
	
	$$.maps.jfontsize({
		btnMinus: $$.zoomOutButton.selector
		#btnDefaultClasseId: '#default-btn'
		uiSlider: $$.zoomSlider.selector
		btnPlus: $$.zoomInButton.selector
		btnMinusMaxHits: 10
		btnPlusMaxHits: 10
		sizeChange: 1
	})
	
	###
	$$.zoomInButton.on 'click', (e) ->
		fs = $$.maps.css('font-size')
		console.log fs
	###
	
	$$.animSpeedSlider = $$.tools.find('#anim-speed-slider')
	$$.animSpeedSlider.slider({
		'value': 50
		'step': 5
	})
	
	
	$$.dialogs = $('#dialogs')

	$$.makeDialog = $$.dialogs.find('.dialog#dialog-make')
	$$.makeDialogInput = $$.makeDialog.find('#make-map-input')
	$$.makeDialogTips = $$.makeDialog.find('#make-form-tips')

	$$.loadDialog = $$.dialogs.find('.dialog#dialog-load')
	$$.loadDialogInput = $$.loadDialog.find('#load-map-input')
	$$.loadDialogTips = $$.loadDialog.find('#load-form-tips')
	
	for name, ga of gridObjects
		ga['name'] = name
		addMap ga
	
	loadGridSearch = loadGridSearchFn mods
	
	loadDialogOptions =
		autoOpen: false
		modal: true
		close: ->
			$$.loadDialogInput.val( "" ).removeClass( "ui-state-error" )
		buttons: [{
			text: "Load"
			click: () ->
				if typeof window.File is "undefined" or typeof window.FileReader is "undefined"
					alert "No support for HTML5 File API!"
				filelist = $$.loadDialogInput.get(0).files
				if filelist.length < 1
					alert("No files selected!")
					return
				for file in filelist
					reader = new FileReader()
					reader.onload = ( e ) ->
						#console.log e.target.result
						s = 's'
						g = 'g'
						try
							eval(e.target.result)
						catch e
							alert "Error loading file "#{file}" as map"
					reader.readAsText file
				$(this).dialog "close"
				$$.runButton.button( "option", "disabled", false )
				$$.runButton.button("refresh")
			},{
			text: "Cancel"
			click: () ->
				$(this).dialog "close"
			}
		]
	$$.loadDialog.dialog loadDialogOptions

	$$.loadButton.on('click', (e) ->
		$$.loadDialogTips.html('')
		$$.loadDialog.dialog('open')
	)
	
	makeDialogOptions =
		autoOpen: false
		modal: true
		close: ->
			$$.makeDialogInput.val( "" ).removeClass( "ui-state-error" )
		buttons: [{
			text: "Make"
			click: () ->
				input = do ->
					return $$.makeDialogInput.val()
				console.log 'input:', input
				try
					grid = JSON.parse(input)
					console.log grid
					gridObject =
						'map': grid
					throw new Error('Map must be array.') unless _.isArray grid
					throw new Error('Map must have at least one row.') unless grid.length > 0
					for row, i in grid
						throw new Error('Rows must be arrays (nested)') unless _.isArray row
						throw new Error('Rows must have at least one cell.') unless row.length > 0
						for cell, j in row
							isInt = (typeof cell is 'number') and (parseFloat(cell) is parseInt(cell)) and (not isNaN(cell))
							throw new Error('Cells must be integers.') unless isInt
							if cell is 2
								if 'start' of gridObject
									throw new Error('Map has multiple start cells (2).')
								gridObject['start'] = mods.Graphs.nameNode(i,j)
								grid[i][j] = 0
							else if cell is 3
								if 'goal' of gridObject
									throw new Error('Map has multiple goal cells (3).')
								gridObject['goal'] = mods.Graphs.nameNode(i,j)
								grid[i][j] = 0
							else if (cell isnt 0) and (cell isnt 1)
								throw new Error('Number '+cell+' has no meaning for cells.')
					throw new Error('Map must indicate start cell with 2.') unless 'start' of gridObject
					throw new Error('Map must indicate goal cell with 3.') unless 'goal' of gridObject
				catch error
					console.log error.prototype
					$$.makeDialogTips.html( error.message )
					$$.makeDialogInput.addClass( "ui-state-error" )
					return
			
				$(this).dialog "close"
				console.log 'gridobj', gridObject
				loadGridSearch gridObject
				$$.maps.trigger('reset')
				$$.runButton.button( "option", "disabled", true )
				$$.runButton.button("refresh")
			},{
			text: "Cancel"
			click: () ->
				$(this).dialog "close"
			}
		]
	$$.makeDialog.dialog makeDialogOptions

	$$.makeButton.on('click', (e) ->
		$$.makeDialogTips.html('')
		$$.makeDialog.dialog('open')
	)
	
	$$.gridSelect.on('change', (e) ->
		$$.allMaps.html('')
		key = $$.gridSelect.val()
		if key of gridObjects
			loadGridSearch gridObjects[key]
		$$.runButton.button( "option", "disabled", false )
		$$.runButton.button("refresh")
	)

	$$.runButton.on('click', (e) ->
		$$.maps.trigger('run')
		$$.runButton.button( "option", "disabled", true )
		$$.runButton.button("refresh")
	)

	$$.resetButton.on('click', (e) ->
		$$.maps.trigger('reset')
		$$.runButton.button( "option", "disabled", false )
		$$.runButton.button("refresh")
	)

	#loadGridSearch gridObjects['a']
	loadGridSearch _.values(gridObjects)[0]
	
@define( (require) ->
	exports =
		'g': g
		's': s
		'domReady': domReady
	return exports
)
