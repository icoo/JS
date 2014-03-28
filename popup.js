(function( window, undefined ){

var getTemplate = window.getTemplate || function ($id,$info) {
	var tpl,key;
	tpl = document.getElementById($id).innerHTML;
	if( tpl == null ) throw "not find popup template";
	for (key in $info) {
		tpl = tpl.replace(new RegExp("##"+key+"##","g"), $info[key]);
	}
	return tpl;
}

var viewport = window.viewport || function() {
    var e = document.documentElement || document.body, a = 'client';
   
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

var sheet = (function() {
	var sheet;
	
	sheet = document.createElement( 'style' );
	document.getElementsByTagName( 'head' )[0].appendChild( sheet );
	sheet = sheet.styleSheet || sheet.sheet;

	return sheet;
})();

function addCSSRule(sheet, selector, rules, index) {
	sheet['insertRule']?
		sheet.insertRule(selector + "{" + rules + "}", index) :
		sheet.addRule(selector, rules, index);
}

addCSSRule(sheet, ".popup", "display:none; position:absolute; top:0; left:0; width:100%; height:100%; z-index:9999;");
addCSSRule(sheet, ".popup .bg", "position:absolute; width:100%; background:black; opacity:.5; filter:alpha(opacity=50); ");
addCSSRule(sheet, ".popup .container", "position:relative; margin:0 auto;");
addCSSRule(sheet, ".popup .close", "position:absolute; top:0; right:0; cursor:pointer;");
addCSSRule(sheet, ".popup .close img", "display:block");

var POPUP_DOM = 
'<div class="popup">'+
	'<div class="bg"></div>'+
	'<div class="container"></div>'
'</div>';


window.Popup = function Popup( $option ){
	var self = this;
	this.opt = $option;
	
	this.stack = [];
	this.owner = $(POPUP_DOM).prependTo('body');
	this.container = $('.container', this.owner);
	if( this.opt.closeBtn ){
		this.closeBtn = $('<div class="close"></div>');
		this.opt.closeBtn.src && this.closeBtn.append('<img src="'+this.opt.closeBtn.src+'" />');
		this.opt.closeBtn.css && this.closeBtn.css(this.opt.closeBtn.css);
		this.closeBtn.click(function(){self.close()});
	}
	
	if( this.opt.isResponse ){
		RPS.add(function(){
			//Popup.prototype.restore.apply(self);
			self.restore();
		});
	}
	
	if( this.opt.bgColor ){
		$('.bg', this.owner).css('opacity',this.opt.bgColor);
	}
	
	if( this.opt.top ){
		$(this.owner).css('top',this.opt.top);
	}
	
	$('.bg', this.owner).click(function(){self.close()});
}

window.Popup.prototype.restore = function(){
		if( this.container.children().length == 0 ) return;
		
		var wh = parseFloat(this.content.css('width'));
		var ht = parseFloat(this.content.css('height'));
		
		this.container.css({ width: wh, height: ht });
		if( this.opt.top ) return;
		var scrollTop = (window.document.documentElement && window.document.documentElement.scrollTop) || window.document.body.scrollTop;
		var top = (viewport().height-ht)>>1;
		if( top < 0 ) top = 0;
		this.owner.css('top', scrollTop + top + 'px');
		var bg = $('.bg', this.owner).css("height",viewport().height+"px").css("top",parseFloat($(this.owner).css('top'))*-1);
		if ($(".wrapper .bg").length) bg.css("height",$(".wrapper .bg").css("height"));
};
	
window.Popup.prototype.open = function(){
		if( !arguments.length ) throw "popup arguments empty";
		
		
		if( this.container.children().length ) {
			this.stack.push( this.container.children()[0] );
			this.container[0].removeChild(this.container.children()[0]);
		}
		
		var i, type, callback, opt = {};
	
		for( i=0 ; i <arguments.length ; ++i ){
			switch( typeof arguments[i] ){
				case "string":
					type = arguments[i];
					break;
				
				case "object":
					opt = $.extend(arguments[i],opt);
					break;
				
				case "function":
					callback = arguments[i];
					break;
			}
		}
		
		this.content = this.container.html(getTemplate(type,opt)).children();
		this.closeBtn && this.content.append(this.closeBtn);
		callback && callback();
		this.restore();
		
		this.owner.stop().hide().fadeIn();
};
	
window.Popup.prototype.close = function(){
		this.closeBtn && this.content[0].removeChild(this.closeBtn[0]);
		this.container.empty();
		if( this.stack.length ){
			var last = this.stack.pop();
			this.container.append(last);
			if( this.shareObj ){
/*
				if( last.className == "info" ){
					var code = POPUP.shareObj.CODE.split('-');
					$(last).find('.address1').val(code[0]);
					$(last).find('.address2').val(code[1]);
					$(last).find('.address3').val(POPUP.shareObj.ADDR);
				}
*/
			}
			restore();
		} else {
			this.shareObj = null;
			this.owner.stop().fadeOut();
		}
}



})(window);

//헤헤헤헤헤


