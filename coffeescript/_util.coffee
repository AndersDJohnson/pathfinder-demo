###
Anders D. Johnson
joh07557@umn.edu
UMN ID: 3955359
###

if typeof @define isnt 'function'
	@define = require('amdefine')(module)

@define( (require) ->
	
	getName = (thing) ->
		if typeof this.name isnt 'undefined'
	    	return this.name
		else
			funcNameRegex = /function (.{1,})\(/
			results = (funcNameRegex).exec(thing.constructor.toString())
			return (if (results && results.length > 1) then results[1] else "")
	
	isInt = (n) ->
		return !!((getName(n) is 'Number') and (parseFloat(n) is parseInt(n)) and (not isNaN(n)))
	
	array_random = ( array ) ->
		return Math.round( (Math.random() * array.length) )
	
	object_clone = ( src ) ->
		if typeof src isnt 'object' or src is null
			return src
		neu = new src.constructor()
		if src instanceof Object
			for own k,v of src
				neu[k] = object_clone(v)
		else if src instanceof Array
			neu = []
			for v in src
				neu.push object_clone(v)
		return neu
	
	
	object_merge = ( original, merging, clone = false, join_arrays = false ) ->
		recursive = ( original, merging, clone ) ->
			if original is null or typeof original isnt "object"
				return merging
			obj = if clone then module.exports.object_clone original else original
			if join_arrays and obj instanceof Array and merging instanceof Array
				obj = obj.concat( merging )
			else
				for own key, value of merging
					if key of obj
						if obj instanceof Object
							if value instanceof Object
								obj[key] = recursive( obj[key], value, clone, join_arrays )
							else
								obj[key] = value
					else
						obj[key] = value
			obj
		recursive( original, merging, clone, join_arrays )
	
	exports =
		'getName': getName
		'isInt': isInt
		'array_random': array_random
		'object_clone': object_clone
		'object_merge': object_merge
	
	return exports
)
