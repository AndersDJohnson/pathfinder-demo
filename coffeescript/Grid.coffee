###
Anders D. Johnson
joh07557@umn.edu
UMN ID: 3955359
###

baseWidth = 180

if typeof @define isnt 'function'
	@define = require('amdefine')(module)

@define( (require) ->
	Graphs = require 'Graphs'
	Grid = ( cssId, grid ) ->
		@cssId = cssId
		@$div = $(cssId + ' .map')
		@grid = grid
		@height = @grid.length
		@width = @grid[0].length
	
	Grid.prototype.draw = () ->
		@$div.html('')
		for row, i in @grid
			$row = $(document.createElement('div'))
			$row.addClass('row')
			for cell, j in row
				$cell = $(document.createElement('div'))
				$cell.addClass('cell')
				if cell isnt -1
					$cell.addClass("cost")
					$cell.addClass("cost-#{cell}")
					$cell.html("#{cell}")
				else
					$cell.addClass('wall')
				$cell.attr('data-name', Graphs.nameNode(i,j))
				$cell.attr('data-cost', cell)
				$row.append($cell)
			@$div.append($row)
		$cells = @$div.find('.cell')
		px = baseWidth / @width
		px = if px < 5 then 5 else px
		em = px / 10
		$cells.width ( em+'em' )
		$cells.height ( em+'em' )
		#$cells.width( (100 / @width)+'%' )
		#$cells.height( (100 / @height)+'%' )
	
	Grid.prototype.getCell = ( name ) ->
		@$div.find('[data-name="' + name + '"]')

	Grid.prototype.withCell = ( name, fn ) ->
		fn( @.getCell(name) )
	
	Grid.prototype.animatePath = ( opts ) ->
		path = opts.path
		opts.speed ?= 50
		speed = 1 - ((opts.speed + 1) / 101)
		callback = opts.callback || ->
		j = 1
		$cells = (@.getCell(name) for name in path)
		@$cells = $cells
		for $cell, i in @$cells
			$cell.doTimeout( 'animatePath', speed*300*i, ((i) ->
				return () ->
					$cell.addClass("path")
					color = if i+1 is $cells.length then '#0CF' else '#0f0'
					props =
						borderColor: color
						backgroundColor: color
					opts =
						duration: speed*500
						complete: () ->
							++j
					this.animate props, opts
			)(i) )
		@$div.doTimeout( 'animatePath', 50, () ->
			if j == path.length
				callback()
				return false
			return true
		)
	
	Grid.prototype.animateSearch = ( opts ) ->
		i = 0
		j = 0
		path = opts.path
		opts.speed ?= 50
		speed = 1 - ((opts.speed + 1) / 101)
		callback = opts.callback || ->
		discovery = opts.discovery
		@$discoveredCells = []
		that = @
		for data in discovery
			name = data['name']
			@withCell name, ( $cell ) ->
				$cell.data 'score', data['score']
				that.$discoveredCells.push $cell
		for $cell, i in @$discoveredCells
			$cell.doTimeout( 'animateSearch', speed*300*i, ((i) ->
				colors = ['red', 'orange', 'orange', 'orange', 'orange', 'yellow']
				return () ->
					$this = this
					$this.addClass('explored')
					score = $this.data('score')
					color = 'yellow'
					if score 
						index = Math.floor( (((score/2)*score) / discovery.length) * colors.length )
						if 0 <= index < colors.length
							color = colors[index]
					props =
						#backgroundColor: color
						borderColor: if i+1 is discovery.length then 'purple' else color
					opts =
						duration: speed*500
						complete: () ->
							++j
					$(this).animate props, opts
					return false
			)(i) )
		@$div.doTimeout( 'animateSearch', 50, () =>
			if j == i
				@animatePath ({
					'path': path
					'speed': opts.speed
					'callback': callback
				})
				return false
			return true
		)

	Grid.prototype.cancelAnimate = () ->
		@$div.doTimeout('animatePath')
		if @$cells
			for c in @$cells
				c.doTimeout('animatePath')
		@$div.doTimeout('animateSearch')
		if @discoveredCells
			for dc in @discoveredCells
				dc.doTimeout('animateSearch')
	
	exports =
		'Grid': Grid
	
	return exports
)
