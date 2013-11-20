;
(function($, window, document, Raphael, undefined) {

	"use strict";

	var Mandala = new Class({

		options: {
			container: '.mandala',
			width: 442,
			height: 442,
			radius : 32,
			magnification : 3,
			mignification : 0.75,
			displacement: 1.3,
			opacity: 0.5,
			center : [64,64],

			items : [{
					url : 'img/001.jpg',
					title : 'Watersports'
				},{
					url : 'img/002.jpg',
					title : 'Tennis'
				},{
					url : 'img/003.jpg',
					title : 'Football'
				},{
					url : 'img/004.jpg',
					title : 'Aventure'
				},{
					url : 'img/005.jpg',
					title : 'Plongé'
				},{
					url : 'img/006.jpg',
					title : 'Equitation'
				},{
					url : 'img/007.jpg',
					title : 'Mode'
				},{
					url : 'img/008.png',
					title : 'Voile'
				},{
					url : 'img/009.jpg',
					title : 'Danse'
				},{
					url : 'img/010.jpg',
					title : 'Théathe'
				},{
					url : 'img/011.png',
					title : 'Art & Design'
			}]
		},

		Implements: [Options],

		initialize: function(options) {
			this.setOptions(options);

			this.container = $(document.body).getElement(this.options.container);
			this.paper = Raphael(this.container, this.options.width, this.options.height);
			this.circles = this.paper.set();

			this.setContainerStyles();

			this.drawMandala();
		},

		setContainerStyles: function() {
			this.container.setStyles({
				width: this.options.width,
				height: this.options.height
			});
		},

		drawMandala: function() {
			var middleX = this.options.width/2,
				middleY = this.options.height/2,
				itemSize = this.options.radius,
				radius = (middleX > middleY ? middleY : middleX) - itemSize * this.options.magnification,
				itemSizeOver = itemSize * this.options.magnification,
				title = this.paper.set();

			for(var i = 0; i < this.options.items.length; i++) {

				// Get a $this
				var $this = this;

				// Determine element pos
				var angle = 360/this.options.items.length * i,
					pos = this._posForAngle(angle, radius, middleX, middleY);

				// Create a new circle on stage
				var circle = this.paper.circle(pos.cx-$this.options.center[0], pos.cy-$this.options.center[1], itemSize).attr({
					transform : 't'+$this.options.center[0]+','+$this.options.center[1]
				}).data('angle', angle).data('pos', i);

				// Add to set
				this.circles.push(circle);

				circle.attr({
					stroke: '#DDD',
					fill: 'url('+$this.options.items[i].url+')',
				}).mouseover(function() {
					// Get element
					var element = this,
						pos = $this._posForAngle(element.data('angle'), radius, middleX, middleY);

					// Zoom element in place and compensate transform (used to center image)
					element.toFront().stop().animate({
						r : itemSizeOver,
						cx : pos.cx,
						cy : pos.cy,
						opacity : 1,
						transform : "t0,0"
					}, 350, 'backOut');

					// New element title
					var titleText = $this.paper.text('50%', '50%', $this.options.items[element.data('pos')].title.toUpperCase()).attr({
						opacity : 0,
						fill : '#FFF',
						'font-family': 'Georgia',
						'font-size' : 20,
						'font-style': 'italic',
						stroke : 'none'
					}).animate({
						opacity: 1
					}, 350);

					var boxBound = titleText.getBBox();

					var titleBox = $this.paper.rect(boxBound.x-10, boxBound.y-7, boxBound.width+20, boxBound.height+14).attr({
						fill: '#000',
						opacity: 0
					}).animate({
						opacity: 1
					}, 350);

					titleText.toFront();

					title.push(titleBox);
					title.push(titleText);

					// Push away items around it
					$this.circles.forEach(function(el){
						if(element != el){
							// get element pos and sign (-/+)
							var pos = el.data('pos') - element.data('pos'),
								sign = -1;

							// Correction for far elements and sign
							if(Math.abs(pos) > $this.options.items.length/2) {
								pos = pos-((pos%($this.options.items.length/2))*2);
								if(pos < 0) sign = 1;
							} else {
								if(pos > 0) sign = 1;
							}

							// Get delta distance from pos
							var delta = ($this.options.items.length/2 - Math.abs(pos)) * sign;

							var newAngle = el.data('angle') + delta * ($this.options.items.length/2) * $this.options.displacement,
								newPos = $this._posForAngle(newAngle, radius, middleX, middleY);

							// Animate to new pos
							el.stop().animate({
								cx : newPos.cx-$this.options.center[0],
								cy : newPos.cy-$this.options.center[1],
								r : $this.options.radius * $this.options.mignification,
								opacity : $this.options.opacity,
								transform : 't'+$this.options.center[0]+','+$this.options.center[1]
							}, 350, 'backOut');
						}
					});


				}).mouseout(function() {
					// Get elementand initial position
					var element = this,
						pos = $this._posForAngle(element.data('angle'), radius, middleX, middleY);;

					this.toBack().stop().animate({
						r : itemSize,
						cx : pos.cx-$this.options.center[0],
						cy : pos.cy-$this.options.center[1],
						opacity : 1,
						transform : 't'+$this.options.center[0]+','+$this.options.center[1]
					}, 350, 'backOut');

					// Remove title
					title.remove();

					// Pull items around it
					$this.circles.forEach(function(el){
						if(element != el){
							var newPos = $this._posForAngle(el.data('angle'), radius, middleX, middleY);

							// Animate to original pos
							el.stop().animate({
								cx : newPos.cx-$this.options.center[0],
								cy : newPos.cy-$this.options.center[1],
								r : 30,
								opacity : 1,
								transform : 't'+$this.options.center[0]+','+$this.options.center[1]
							}, 350, 'backOut');
						};
					});
				});
			}
			
		},

		_degreeToRad : function(value){
			return value * Math.PI / 180;
		},

		_posForAngle : function(angle, radius, x0, x1){
			angle = this._degreeToRad(angle);
			return {
				cx : x0 + (Math.cos(angle) * radius), 
				cy : x1 + (Math.sin(angle) * radius)
			}
		}
	});

	$(window).addEvent('domready', function() {
		new Mandala();
	});

})(document.id, window, document, Raphael);
