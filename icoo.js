var PARS = (function(){
	var r = {};
	if (location.search) {
	    var parts = location.search.substring(1).split('&');
	    for (var i = 0; i < parts.length; i++) {
	        var nv = parts[i].split('=');
	        if (!nv[0]) continue;
	        r[nv[0]] = nv[1] || true;
	    }
	}
	return r;
})();

var getTemplate = window.getTemplate || function ($id,$info) {
	var tpl,key;
	tpl = document.getElementById($id).innerHTML;
	if( tpl == null ) throw "not find popup template";
	for (key in $info) {
		tpl = tpl.replace(new RegExp("##"+key+"##","g"), $info[key]);
	}
	return tpl;
}

function trace(){
	window['console'] && console.log['apply'] && console.log.apply(console,arguments);
}

function trim(str) {
	return str.replace( /(^\s*)|(\s*$)/g, "" );
}

function viewport() {
    var e = document.documentElement || document.body, a = 'client';
   
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

function requireJS(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,
        success: function () {},
        error: function () { throw new Error("Could not load script " + script); }
    });
};

function openWin($url,$name,$opt){
	var o, opt={}, arr=[];
	
	$opt = $opt || {};
	
	opt.width = $opt.width || viewport().width;
	opt.height = $opt.height || viewport().height;
	opt.left = $opt.left || (screen.availWidth-opt.width)>>1;
	opt.top = $opt.top || (screen.availHeight-opt.height)>>1;
	
	opt = $.extend({
		scrollbars	: $opt.scrollbars || 1,
		location 	: 0,
		menubar		: 0,
		titlebar	: 0,
		toolbak		: 0
	}, opt);
	
	for ( o in opt ) arr.push(o+"="+opt[o]);
	
	window.open( $url, $name, arr.join(','));
}

function imagePopup($src,$wh,$ht,$iw,$ih){
	var t = (screen.availHeight-$ht)/2;
	var l = (screen.availWidth-$wh)/2;
	var look='menubar=0,titlebar=0,toolbak=0,location=no,scrollbars=yes,status=no,width='+$wh+',height='+$ht+',left='+l+',top='+t;
	var r ;
	if ($iw && $ih) {
		r = Math.min($wh / $iw, $ht / $ih);
		if ( r > 1 ) r = 1;
	} else {
		r = 1;
	}
	
	$wh = r * $iw;
	$ht = r * $ih;

	popwin=window.open(" ","",look);
	popwin.document.open();
	popwin.document.write('<head><title>Image Window</title><style>*{padding:0;margin:0;border:0;}</style></head><body><table style="width:100%;height:100%"><tr><td style="width:100%;height:100%;vertical-align:middle;text-align:center"><img style="width:'+$wh+';height:'+$ht+';cursor:hand;" onclick="self.close()" src="'+$src+'"></td></tr></table></body>');
	popwin.document.close();
}

function getCookie( name ){ 
        var nameOfCookie = name + "="; 
        var x = 0; 
        while ( x != document.cookie.length ) 
        { 
                var y = (x+nameOfCookie.length); 
                if ( document.cookie.substring( x, y ) == nameOfCookie ) { 
                        if ( (endOfCookie=document.cookie.indexOf( ";", y )) == -1 ) 
                                endOfCookie = document.cookie.length; 
                        return unescape( document.cookie.substring( y, endOfCookie ) ); 
                } 
                x = document.cookie.indexOf( " ", x ) + 1; 
                if ( x == 0 ) break; 
        }
        return ""; 
}

function setCookie(name, value, expiredays){ 
	var todayDate = new Date(); 
	todayDate.setDate(todayDate.getDate() + expiredays); 
	document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";" 
} 

function checkForm(form) {
	var i, j, t, q = [], arr=[], name;
	for (i=0,j=form.elements.length;i<j;++i) {
		t = form.elements[i];
		
		if ( t.name == "f" || t.name === "" || t.getAttribute('optional') == 1) continue;
		
		switch (t.nodeName) {
			case "INPUT":
			case "TEXTAREA":
				if ( !trim(t.value).length ) return t.name;
			break;
			case "SELECT":
			break;
		}
	}
	
	if( !$('.agree').is(':checked')) return 'AGREE';
	
	return 0;
}


/* jqeury flugins */
(function($){
	if ( $.fn.radio ) return;
	
	$.fn.radio = function( idx ){
		var img, o, n, f;
		
		img = this.is('img')? this: $('img', this);
		img.attr('src',function(i,value){
			f = value.split('/').reverse()[0];
			o = f.split('.')[0];
			if( idx == i ){
				n = o.indexOf('_on')>-1? value : value.replace(o, o+'_on');
			} else {
				n = value.replace(/_on/,'');
			}
			
			return n;
		});
		
		return this;
	}
	
	$.fn.hoverBtn = function( $click ){
		var img, o, f;
		
		this.hover(function(){
			img = $(this).is('img')? $(this): $('img', this);
			img.attr('src', function(i,value){
				f = value.split('/').reverse()[0];
				o = f.split('.')[0];
				return o.indexOf('_on')>-1? value : value.replace(o, o+'_on');
			});
		},function(){
			img = $(this).is('img')? $(this): $('img', this);
			img.attr('src', function(i,value){
				return value.replace(/_on/,'');
			});
		}).click($click);
		
		return this;
	}
	
	$.fn.autoFitImg = function( $opt ){
		if( !this.length ) return;
		
		var self, img, option, pwh, pht, wh, ht, style, fit, scale;
		
		self = this[0];
		img = $(this).is('img')? $(this)[0]: $('img', this)[0];
		
		option = $.extend({
			mode : 'outside',
			align: 'center center'
		}, $opt);
		
		pw = parseFloat(self.offsetWidth);
		ph = parseFloat(self.offsetHeight);
		self.style.overflow='hidden';
		img.style.visibility = 'hidden';
		img.style.position = 'absolute';
		if( self.style.position != 'relative' && self.style.position != 'absolute' ) self.style.position='relative';
		
		function fit($t){
			wd = $t.width;
			ht = $t.height;
			style = $t.style;
			scale = pw*100/wd;
			fit = ht*scale < ph? 'w':'h'
			
			switch( option.mode ){
				case 'outside':
					if ( fit == 'w' ) {
						style.width = 'auto';
						style.height = '100%';
						style.marginLeft = ((100 - $t.offsetWidth*100/pw) >> 1)+'%';
					} else {
						style.width= '100%';
						style.height = 'auto';
						style.marginTop = ((100 - $t.offsetHeight*100/ph) >> 1)+'%';
					}
					break;
				
				case 'inside':
					if ( fit == 'w' ) {
						style.width= '100%';
						style.height = 'auto';							
						style.marginTop = ((100 - $t.offsetHeight*100/ph) >> 1)+'%';
					} else {
						style.width = 'auto';
						style.height = '100%';
						style.marginLeft = (( 100 - $t.offsetWidth*100/pw ) >> 1) +'%';
					}
					break;
			}
			style.visibility = 'visible';
		}
		setTimeout(function(){
			$(img).isLoaded() ? fit(img) : $(img).load(function(){ fit(this); });
		}, 1000);
	
		return this;
	}
	
	$.fn.isLoaded = function() {
	    return this.filter("img").filter(function() { return this.complete; }).length > 0;
	};
})(jQuery);




$(function(){
	$('table').attr({'cellpadding':'0', 'cellspacing':'0'});
});




/* fix ie8 substr */
if ('ab'.substr(-1) != 'b')
{
    /**
     *  Get the substring of a string
     *  @param  {integer}  start   where to start the substring
     *  @param  {integer}  length  how many characters to return
     *  @return {string}
     */
    String.prototype.substr = function(substr) {
        return function(start, length) {
            if (start < 0) start = this.length + start;
            return substr.call(this, start, length);
        }
    }(String.prototype.substr);
}

/* naturalSize plugin */
(function($){
	var
	props = ['Width', 'Height'],
	prop;
	
	while (prop = props.pop()) {
	(function (natural, prop) {
	  $.fn[natural] = (natural in new Image()) ? 
	  function () {
	  return this[0][natural];
	  } : 
	  function () {
	  var 
	  node = this[0],
	  img,
	  value;
	
	  if (node.tagName.toLowerCase() === 'img') {
	    img = new Image();
	    img.src = node.src,
	    value = img[prop];
	  }
	  return value;
	  };
	}('natural' + prop, prop.toLowerCase()));
	}
}(jQuery));



