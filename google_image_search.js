
/*
	@description
		Google image search script

	@usage
		When applying the script to the current page,
		you can get a tooltip while your mouse overing an image,
		with key ctrl holding.
		Then you can simpliy click the image to perform the google image search.
*/



$(document).ready(function() {
// start



var EventSystem = {
	init: function() {
		this.count = 0;
		this.event = {};
	},
	register: function(name, callback) {
		if (!this.event[name]) {
			this.event[name] = [];
		}
		this.event[name].push(callback);
	},
	trigger: function(name, data) {
		if (!this.event[name]) {
			// throw new Error("event not exist.");
			return;
		}

		var callbacks = this.event[name],
			len = this.event[name].length;
		for (var i = 0; i < len; i++) {
			callbacks[i](data);
		}
	}
};

var Klass = {
	"new": function(cls /*, args*/) {
		function fn() {}
		fn.prototype = cls;
		fn.prototype.contructor = cls;

		var o = new fn();
		if (typeof cls["init"] === "function") {
			cls.init.apply(o, [].slice.call(arguments, 1));
		}
		return o;
	},
	"inherit": function(pt, obj) {
		var o = {};
		this.extend(o, pt);
		this.extend(o, obj);
		return this.new(o);
	},
	"extend": function(tar, src) {
		for (var k in src) {
			if (!src.hasOwnProperty(k)) continue;
			tar[k] = src[k];
		}
	}
};



// Ui class
// need jQuery framework
var Ui = {
	content: null,
	attribute: null,
	style: null,
	selector: null,
	class: null,
	id: null,
	node: null,
	parent: null,
	position: null,
	dimention: null,
	animation: null,
	canAnimate: false,

	setContent: function(content) {
		this.node.text(content);
	},
	getContent: function() {
		return this.node.text();
	},
	setAttribute: function(/*args*/) {
		this.node.attr.apply(this.node, arguments);
	},
	getAttribute: function(key) {
		return this.node.attr(key);
	},
	delAttribute: function(key) {
		this.node.removeAttr(key);
	},
	setClass: function(class) {
		this.node.addClass(class);
	},
	delClass: function(class) {
		this.node.removeClass(class);
	},
	setId: function(id) {
		this.node.attr("id", id);
	},
	delId: function() {
		this.node.removeAttr("id");
	},
	setPosition: function(posObject) {
		this.node.css({
			"left": posObject.x,
			"top": posObject.y
		});
	},
	getPosition: function() {
		var offset = this.node.offset();
		return {
			"x": offset.left,
			"y": offset.top
		};
	},
	setStyle: function(/*args*/) {
		this.node.css.apply(this.node, arguments);
	},
	getStyle: function(key) {
		return 	this.node.css(key);
	},
	setDimention: function(w, h) {
		this.node.css({
			"width": w,
			"height": h
		});
	},
	getDimention: function(type) {
		var w, h;
		if (type === "inner") {
			w = this.node.innerWidth();
			h = this.node.innerHeight();
		}
		else if (type === "outer") {
			w = this.node.outerWidth();
			h = this.node.outerHeight();
		}
		else {
			w = this.node.width();
			h = this.node.height();
		}

		return {
			"width": w,
			"height": h
		};
	},
	show: function() {
		if (this.canAnimate) {
			if (this.animation.type === "fade") {
				this.node.fadeIn(this.animation.time);
			} else {
				this.node.animate(this.animation.properties, this.animation.options);
			}
		} else {
			this.node.css("display", "block");
		}
	},
	hide: function() {
		if (this.canAnimate) {
			if (this.animation.type === "fade") {
				this.node.fadeOut(this.animation.time);
			} else {
				this.node.animate(this.animation.properties, this.animation.options);
			}
		} else {
			this.node.css("display", "none");
		}
	},
	delete: function() {
		this.node.remove();
	},

	__initNode: function() {
		if (!this.selector) {
			this.selector = "<div>";
		}

		this.node = this.node || $(this.selector);

		if (this.id) this.setId(this.id);
		if (this.class) this.setClass(this.class);
		if (this.content) this.setContent(this.content);
		if (this.attribute) this.setAttribute(this.attribute);
		if (this.style) this.setStyle(this.style);
		if (this.dimention) this.setDimention(this.dimention);
		if (this.position) this.setPosition(this.position);

		this.node.appendTo(this.parent);
	},
	__initEvent: function() {
		var eventName,
			that = this;
		for (var k in that) {
			if (typeof that[k] === "function" && k.indexOf("on_") === 0) {
				eventName = k.substr(3).toLowerCase();
				that.node.bind(eventName, (function() {
					var key = k;
					return function(evt) {
						that[key].call(that, evt);
					}
				})());
			}
		}
	},
	super_init: function() {
		this.__initNode();
		this.__initEvent();
	},
	extendStill: function(obj) {
		var newObj = $.extend({}, this, obj);
		return newObj;
	},
	extend: function(obj) {
		var newObj = $.extend({}, this, obj);

		newObj.__initNode();
		newObj.__initEvent();
		return newObj;
	},
};

Uis = $.extend({}, Ui, {

});



var Ui_tooltip = Ui.extendStill({
	init: function(params) {
		// node is jquery object
		this.class = params.class;
		this.parent = params.parent;
		this.content = params.content;
		this.position = params.position;
		this.style = params.style;
		this.animation = params.animation;
		this.canAnimate = typeof params.canAnimate === "undefined"
			? false
			: params.canAnimate;

		this.super_init();
	},
	updatePosition: function() {
		var top = $(document.body).scrollTop();
		this.setPosition({
			"y": top
		});
	},
	flash: function(time) {
		if (typeof time !== "number") {
			throw new Error("flash function need a param time.");
		}
		var that = this;

		this.updatePosition();
		this.show();
		setTimeout(function() {
			that.hide();
		}, time);
	},
	perform: function(datas) {
		var type = datas.type,
			data = datas.data;

		if (type === "flash") {
			this.flash(data);
		}
	}
});


var SchemeA = Uis.extendStill({
	init: function(params) {
		// images is jquery object
		// node is list of DOM object
		this.images = null;
		this.node = null;
		
		this.style = params.style;
		this.hoverStyle = params.hoverStyle;
		this.class = params.class;
		this.parent = params.parent;
		// this.hoverClass = this.class + "_hover";
		
		this.initNode();
		this.hide();
		this.super_init();
		this.applyMaskChange();
		this.show();
	},
	initNode: function() {
		var wrapper = this.createImageMaskWrapper();
		this.parent = wrapper.appendTo(this.parent);
		
		this.images = this.findImages();
		this.node = this.createNodes(this.images);
	},
	createImageMaskWrapper: function() {
		var node = $("<div>")
			.css({
				"position": "absolute",
				"left": 0,
				"top": 0,
				"width": 0,
				"height": 0
			})
			.attr({
				"class": this.class
			});

		return node;
	},
	createNodes: function(imageNodes) {
		var that = this,
			nodes = [];
		$(imageNodes).each(function() {
			nodes.push(document.createElement("div"));
		});
		return $(nodes);
	},
	// find the image nodes
	findImages: function() {
		return $("img");
	},
	// deal with the mask nodes
	applyMaskChange: function(imageNodes) {
		var that = this,
			imagesNodes = imageNodes || this.images;
			nodes = this.node;

		$(imagesNodes).each(function(n, v) {
			$image = $(this);
			
			$(nodes[n])
				.attr({
					"url": $image.attr("src")
				})
				.css({
					"width": $image.outerWidth(),
					"height": $image.outerHeight(),
					"left": $image.offset().left,
					"top": $image.offset().top
				});
		});
	},
	/*
		deal with the events of the mask nodes
	*/
	on_Mouseenter: function(evt) {
		this.performHover(evt, true);
		SYS_eventSystem.trigger("scheme/onmouseenter", evt);
	},
	on_Mouseleave: function(evt) {
		this.performHover(evt, false);
		SYS_eventSystem.trigger("scheme/onmouseleave", evt);
	},
	on_Click: function(evt) {
		this.performClick(evt);
		SYS_eventSystem.trigger("scheme/onclick", evt);
	},
	performHover: function(evt, flag) {
		if (flag) {
			$(evt.target).css(this.hoverStyle);
		} else {
			$(evt.target).css(this.style);
		}
	},
	performClick: function(evt) {
		// noop
	},
	perform: function() {
		// noop
	}
});

var Action_GoogleImage = {
	init: function(params) {
		this.googleImageUrlPattern = params.googleImageUrlPattern;

		this.initEvent();
	},
	initEvent: function() {
		var that = this;
		SYS_eventSystem.register("scheme/onclick", function(evt) {
			that.googleImageSearch(evt);
		});
	},
	googleImageSearch: function(evt) {
		// perform google image serach
		var url = evt.target.getAttribute("url"),
			finalUrl = this.googleImageUrlPattern.replace("<url>", url);

		window.open(finalUrl);
	},
	run: function() {
		// noop
	}
};

var Main = {
	init: function(dicts) {
		this.options = dicts.options;
		this.scheme = dicts.scheme;
		this.tooltip = dicts.tooltip;
		this.action_googleImage = dicts.action_googleImage;

		this.splashData = dicts.splash;
		this.initCancelStyle(dicts);
		this.initEventLink();
	},
	initEventLink: function() {
		var that = this;
		
		$(document).bind("keyup", function(evt) {
			that.cancelStyle(evt);
		});
		SYS_eventSystem.register("cancelStyle", function(data) {
			if (data.type) {
				that.splashTooltip(false);
			} else {
				that.splashTooltip(true);
			}
		});
	},
	initCancelStyle: function(dicts) {
		this.cancelKey = dicts.cancelKey;
		this.cancelStyleClass = dicts.cancelStyleClass;
		this.$cancelNodes = $("." + this.cancelStyleClass);
		this.cancelToggle = false;
	},
	cancelStyle: function(evt) {
		if (this.cancelKey !== evt.which) return;
		
		if (!this.cancelToggle) {
			this.cancelToggle = true;
			this.$cancelNodes.css("display", "none");
			SYS_eventSystem.trigger("cancelStyle", {
				"type": true
			});
		} else {
			this.cancelToggle = false;
			this.$cancelNodes.css("display", "block");
			SYS_eventSystem.trigger("cancelStyle", {
				"type": false
			});
		}
	},
	performSplashTooltip: function(data) {
		// data.content, data.time
		this.tooltip.setContent(data.content);
		this.tooltip.setStyle(data.style);
		this.tooltip.perform({
			"type": "flash",
			"data": data.time
		});
	},
	splashTooltip: function(flag) {
		var data;
		if (flag) {
			data = {
				"content": this.splashData.content_on,
				"style": this.splashData.style_on,
				"time": this.splashData.time
			};
		} else {
			data = {
				"content": this.splashData.content_off,
				"style": this.splashData.style_off,
				"time": this.splashData.time
			};
		}
		this.performSplashTooltip(data);
	},
	run: function() {
		this.scheme.perform();
		this.splashTooltip(true);
	}
};


var StyleClass = {
	init: function(params) {
		this.class = params.class;
		this.style = params.style;
		this.parent = params.parent;
	},
	formatClass:function() {
		var result = [],
			classFormat = ".%className% {%content%}",
			style = this.style;
		for (var k in style) {
			if (!style.hasOwnProperty(k)) continue;

			result.push(k, ":", style[k], ";\n");
		}
		
		classFormat = classFormat.replace("%className%", this.class);
		classFormat = classFormat.replace("%content%", result.join(""));
		return classFormat;
	},
	appendClassStringTo: function(classString, parent) {
		if (!parent) {
			parent = this.parent ? this.parent : document.body;
		}
		var styleNode = document.createElement("style");
			classStringNode = document.createTextNode(classString);

		styleNode.appendChild(classStringNode);
		parent.appendChild(styleNode);
	},
	appendClass: function(parent) {
		var classString = this.formatClass();
		this.appendClassStringTo(classString, parent);
	}
};



var resetStyleClass = "google_image_search_reset_20140118";
var options = {
	"main": {
		"cancelKey": 32,
		"cancelStyleClass": resetStyleClass,
		"splash": {
			"content_on": "Google Image Search ON",
			"content_off": "Google Image Search OFF",
			"style_on": {
				"background": "#3E86FB"
			},
			"style_off": {
				"background": "#FF6148"
			},
			"time": 3000
		}
	},
	"tooltip": {
		"content": "Google Image Search",
		"parent": document.body,
		"position": {
			"x": 0,
			"y": 0
		},
		"canAnimate": true,
		"animation": {
			"type": "fade",
			"time": 400
		},
		"class": resetStyleClass,
		"style": {
			"position": "absolute",
			"display": "none",
			"width": "auto",
			"height": "auto",
			"padding": "16px 30px",
			"opacity": "0.9",
			"border": "1px solid #555",
			"backgroundColor": "#222",
			"color": "#fff",
			"font": "bold 12px/1.2 arial"
		}
	},
	"scheme": {
		"class": "imageSerach_schemeA " + resetStyleClass,
		"parent": document.body,
		"style": {
			"position": "absolute",
			"display": "block",
			"opacity": "0.2",
			"border": 0,
			"backgroundColor": "",
		},
		"hoverStyle": {
			"position": "absolute",
			"display": "block",
			"opacity": "0.5",
			"border": 0,
			"backgroundColor": "#333",
		}
	},
	"styleClass": {
		"style_reset": {
			"class": resetStyleClass,
			"parent": "",
			"style": {
				"display": "block",
				"left": 0,
				"top": 0,
				"width": 0,
				"height": 0,
				"min-width": 0,
				"min-height": 0,
				"margin": 0,
				"padding": 0,
				"border": 0,
				"outline": 0,
				"background": 0
			}
		}
	},
	"action_googleImage": {
		"googleImageUrlPattern": "http://www.google.com.hk/searchbyimage?image_url=<url>"
	}
};

var SYS_eventSystem = Klass.new(EventSystem);

var styleClass_reset = Klass.new(StyleClass, $.extend({}, options.styleClass.style_reset));

var tooltip = Klass.new(Ui_tooltip, $.extend({}, options.tooltip));
var scheme = Klass.new(SchemeA, $.extend({}, options.scheme));
var action_googleImage = Klass.new(Action_GoogleImage, $.extend({}, options.action_googleImage));
var main = Klass.new(Main, $.extend({
	"options": options,
	"scheme": scheme,
	"tooltip": tooltip,
	"action_googleImage": action_googleImage
}, options.main));

styleClass_reset.appendClass();
main.run();


// end
});