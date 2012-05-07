
(function () {
    define({
		/*
        write: function (pluginName, name, write) {
            if (name in buildMap) {
                var text = buildMap[name];
                write.asModule(pluginName + "!" + name, text);
            }
        },
		*/
		
        load: function (name, req, load, config) {
			//originalScriptType = config.scriptType;
			//config.scriptType = "text/coffeescript";
			//name = config.baseLocal + name;
			context = {
				config: config
			};
			parentModuleMap = require.makeModuleMap(name);
			ext = '.coffee';
			url = require.nameToUrl(name, ext, parentModuleMap);
			require(context, name, url);
			//config.scriptType = originalScriptType;
        }
    });

}());
