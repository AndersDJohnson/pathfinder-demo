###
Anders D. Johnson
joh07557@umn.edu
UMN ID: 3955359
###

loaded = ( main, _util, Graphs, Grid ) ->
	mods =
		'_util': _util
		'Graphs': Graphs
		'Grid': Grid
	
	g = main.g
	s = main.s
	grids =
		'1':
			'map': [
				[ 1,-1, 1, 5, 9, 8, 9, 8, 9, 9, 8,-1, g],
				[ 1,-1, 1,-1,-1, 1, 3,-1, 1, 6, 7,-1, 1],
				[ 1, 1, 1, 2, 1, 3, 2, 3, 4, 5, 6, 8, 1],
				[ 1, 1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 1],
				[ 1,-1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[ s,-1, 1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1],
				[ 1,-1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[ 1, 1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 1],
				[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			]
		'a':
			'map': [
				[ 1,-1, 1, 5, 4, 4, 2, 1, g],
				[ 1,-1, 6,-1,-1, 1, 3,-1, 1],
				[ 1, 7, 8, 3,-1, 1,-1,-1, 3],
				[-1, 9, 1, 2,-1, 1, 7, 1, 1],
				[ 1, 1,-1, 1, 4, 1, 1,-1, 1],
				[ s, 1, 1, 2, 1, 1, 3,-1, 1],
			]
		'b':
			'map': [
				[ s,-1, 1, 1,-1, g],
				[ 1, 1,-1, 1, 1, 1],
				[ 1, 1,-1, 1, 1,-1],
				[ 1, 1, 1, 1,-1, 1],
				[ 1,-1, 1, 1, 1, 1]
			],
		'c':
			'map': [
				[ s,-1, 1, 1,-1, g],
				[ 1,-1, 1,-1, 1, 1],
				[ 1, 1, 1,-1, 1, 1],
				[ 1, 1,-1, 1,-1, 1],
				[ 1, 1, 1, 1, 1, 1]
			],
		'd':
			'map': [
				[ s,-1, 1,-1],
				[ 1, 1, 1, 1],
				[ 1, 1, 1, g]
			],
		'snake':
			'map': [[ s,-1, 1, 1, 1,-1, 1, 1, 1],
					[ 1,-1, 1,-1, 1,-1, 1,-1, 1],
					[ 1,-1, 1,-1, 1,-1, 1,-1, 1],
					[ 1,-1, 1,-1, 1,-1, 1,-1, 1],
					[ 1,-1, 1,-1, 1,-1, 1,-1, 1],
					[ 1, 1, 1,-1, 1, 1, 1,-1, g]]
	
	$( () ->
		main.domReady mods, grids
	)

require.config
	baseUrl: "javascript"
	paths: {
		"order": "lib/requirejs/order"
	}

require ['main', '_util', 'Graphs', 'Grid', 'lib/underscore', 'order!lib/jquery/jquery', 'order!lib/jquery/jquery.ba-dotimeout', 'order!lib/jquery/jquery.color', 'order!lib/jquery/jquery.jfontsize2', 'order!lib/jquery-ui/js/jquery-ui-1.8.18.custom.min', 'order!lib/jquery-ui/js/jquery.ui.selectmenu', 'order!lib/DataTables/js/jquery.dataTables.min'], loaded


