/*
 * jQuery jFontSize Plugin
 * Examples and documentation: http://jfontsize.com
 * Author: Frederico Soares Vanelli
 *         fredsvanelli@gmail.com
 *         http://twitter.com/fredvanelli
 *         http://facebook.com/fred.vanelli
 *
 * Copyright (c) 2011
 * Version: 1.0 (2011-07-13)
 * Dual licensed under the MIT and GPL licenses.
 * http://jfontsize.com/license
 * Requires: jQuery v1.2.6 or later
 */

(function($){
    $.fn.jfontsize = function(opts) {
    	
        var $this=$(this);
	    var defaults = {
		    btnMinus: null,
		    btnDefault: null,
		    btnPlus: null,
		    uiSlider: null,
            btnMinusMaxHits: 10,
            btnPlusMaxHits: 10,
            sizeChange: 1
	    };
		
	    if( ($.isPlainObject(opts)) || (!opts) ){
            opts = $.extend(defaults, opts);
	    } else {
            defaults.sizeChange = opts;
		    opts = defaults;
	    }
		
		var getFontSize = function () {
			size = $(this).css('font-size');
            size = size.replace('px', '');
            size = parseInt(size.replace('px', ''));
            return size;
		};
		
        var limit = [];
        var fontsizes = [];
		
        $(this).each(function(i){
            limit[i]=0;
            fontsizes[i] = getFontSize.call(this);
        })
		
		btns = [opts.btnMinus, opts.btnDefault, opts.btnPlus].join(', ')
		$btns = $(btns);
		
        $btns.css('cursor', 'pointer');
		
		var $uiSlider = null;
		
		var changeFontSize = function (i, dir) {
			currSize = getFontSize.call(this);
            newfontsize = currSize + dir * (opts.sizeChange);
            limit[i] += dir;
			console.log('i', i, 'dir', dir, 'limit', limit[i]);
            if ( $uiSlider !== null )  {
            	current = $uiSlider.slider('option', 'value');
            	change = dir * opts.sizeChange;
            	$uiSlider.slider('option', 'value', current + change);
            }
            $(this).css('font-size', newfontsize+'px');
		};
		
		if (opts.uiSlider !== null) {
			$uiSlider = $(opts.uiSlider)
			$uiSlider.slider({
				'max': opts.btnPlusMaxHits + opts.btnMinusMaxHits,
				'value': opts.btnMinusMaxHits,
				'step': 1
			}).bind('slidestart', function (event, ui) {
				$this.each(function(i){
					$(this).data('prevValue', ui.value);
				});
			}).bind('slidechange', function (event, ui) {
				if ( event.originalEvent == undefined ) {
					return;
				}
				$this.each(function(i){
					change = (ui.value - $(this).data('prevValue'));
					changeFontSize.call(this, i, change);
				});
			});
			
		}
		
        $(opts.btnMinus).click(function(e){
        	e.preventDefault();
            $this.each(function(i){
                if (limit[i] > (-(opts.btnMinusMaxHits))){
                    changeFontSize.call(this, i, -1);
                }
            })
        })
		
        $(opts.btnDefault).click(function(){
            $this.each(function(i){
                limit[i] = 0;
                $(this).css('font-size', fontsizes[i] + 'px');
            })
        })
		
        $(opts.btnPlus).click(function(){
            $this.each(function(i){
                if (limit[i] < (opts.btnPlusMaxHits)){
                    changeFontSize.call(this, i, 1);
                }
            })
        })
    };
})(jQuery);
