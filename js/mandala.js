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

			background : 'img/bg.png',

			items : [{
					url : 'img/001.jpg',
					title : 'Watersports',
					links : [{
						text : 'Valbonne s/Cannes',
						url : 'http://www.esl-schools.org/fr/centre-cours-francais-valbonne-s/cannes/esl-valbonne-s/cannes-13-17-ans-france.htm'
					}, {
						text : 'Zoug',
						url : 'http://www.esl-schools.org/fr/centre-cours-allemand-zoug/esl-zoug-13-17-ans-suisse.htm'
					}, {
						text : 'Berlin-Werbellinsee',
						url : 'http://www.esl-schools.org/fr/centre-cours-allemand-berlin/esl-berlin-wannsee-13-17-ans-allemagne.htm'
					}]
				},{
					url : 'img/002.jpg',
					title : 'Tennis',
					text : "Toutes destinations, \nà l’exception de \nWesterwald"
				},{
					url : 'img/003.jpg',
					title : 'Football',
					text : "Paris-Igny \nBerlin-Wannsee \nFreiburg"
				},{
					url : 'img/004.jpg',
					title : 'Aventure',
					text : "Westerwald"
				},{
					url : 'img/005.jpg',
					title : 'Plongé',
					links : [{
						text : "Valbonne s/Cannes",
						url : 'http://www.esl-schools.org/fr/centre-cours-francais-valbonne-s/cannes/esl-valbonne-s/cannes-13-17-ans-france.htm'
					}]
				},{
					url : 'img/006.jpg',
					title : 'Equitation',
					text : "Leysin-Juniors \nLeysin-Teens \nWesterwald"
				},{
					url : 'img/007.jpg',
					title : 'Mode',
					text : "Paris-Igny\nBerlin-Wannsee"
				},{
					url : 'img/008.jpg',
					title : 'Voile',
					text : "Montreux-Riviera\nAscona"
				},{
					url : 'img/009.jpg',
					title : 'Danse',
					text : "Leysin-Teens\nMontreux-Riviera\nValbonne s/Cannes\nFreiburg\nAscona"
				},{
					url : 'img/010.jpg',
					title : 'Théathe',
					text : "Leysin-Juniors\nLeysin-Teens\nZoug\nBerlin Werbellinsee\nWesterwald \nAscona"
				},{
					url : 'img/011.jpg',
					title : 'Art & Design',
					text : "Leysin-Juniors\nMontreux-Riviera\nParis-Igny\nValbonne s/Cannes\nZug\nBerlin-Wannsee\nBerlin-Werbellinsee\nFreiburg\nWesterwald"
			}]
		},

		Implements: [Options],

		initialize: function(options) {
			this.setOptions(options);

			this.container = $(document.body).getElement(this.options.container);
			this.paper = Raphael(this.container, this.options.width, this.options.height);
			this.circles = this.paper.set();
			this.currentCircle = null;
			this.titleSet = this.paper.set();
			this.textSet = this.paper.set();

			this.middleX = this.options.width/2;
			this.middleY = this.options.height/2;
			this.itemSize = this.options.radius;
			this.radius = (this.middleX > this.middleY ? this.middleY : this.middleX) - this.itemSize * this.options.magnification;
			this.itemSizeOver = this.itemSize * this.options.magnification;

			this.setContainerStyles();

			this.drawTrigger();
			this.drawBg();
			this.drawMandala();
		},

		setContainerStyles: function() {
			this.container.setStyles({
				width: this.options.width,
				height: this.options.height
			});
		},

		drawTrigger : function(){
			var $this = this;

			this.paper.rect(0, 0, this.options.width, this.options.height).attr({
				fill : 'white',
				stroke : 'none'
			}).mouseover(function(){
				$this.resetMandala();
			}).mouseout(function(){
				$this.resetMandala();
			});
		},

		drawBg : function(){
			this.bg = this.paper.image(this.options.background, 100, 100, 250, 250);
		},

		drawMandala: function() {
			for(var i = 0; i < this.options.items.length; i++) {

				// Get this
				var $this = this;

				// Determine element pos
				var angle = 360/this.options.items.length * i,
					pos = this._posForAngle(angle);

				// Create a new circle on stage
				var circle = this.paper.circle(pos.cx-$this.options.center[0], pos.cy-$this.options.center[1], $this.itemSize).attr({
					transform : 't'+$this.options.center[0]+','+$this.options.center[1]
				}).data('angle', angle).data('pos', i);

				// Add to set
				this.circles.push(circle);

				circle.attr({
					stroke: 'none',
					fill: 'url('+$this.options.items[i].url+')',
				});

				// Mouse over
				circle.mouseover(function() {
					if($this.currentCircle == this) return;

					$this.currentCircle = this;
					$this.reseted = false;

					// Get element
					var element = this,
						pos = $this._posForAngle(element.data('angle'));

					// Zoom element in place and compensate transform (used to center image)
					element.stop().animate({
						r : $this.itemSizeOver,
						cx : pos.cx,
						cy : pos.cy,
						opacity : 1,
						transform : "t0,0"
					}, 350, 'backOut');

					// Remove previous title element
					$this.titleSet.remove();
					$this.textSet.remove();

					// Create all title and text
					var boxBound = $this.createTitle($this.options.items[element.data('pos')]);
					$this.createText($this.options.items[element.data('pos')], boxBound);

					// Move title to front
					$this.titleSet.toFront();

					// Push away items around element
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
								newPos = $this._posForAngle(newAngle);

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
				});
			}
		},

		resetMandala : function(){
			if(this.reseted) return;

			this.titleSet.remove();
			this.textSet.remove();
			
			// Pull items around it
			this.circles.forEach(function(el){
				var newPos = this._posForAngle(el.data('angle'));

				// Animate to original pos
				el.stop().animate({
					cx : newPos.cx-this.options.center[0],
					cy : newPos.cy-this.options.center[1],
					r : this.itemSize,
					opacity : 1,
					transform : 't'+this.options.center[0]+','+this.options.center[1]
				}, 350, 'backOut');
			}, this);

			this.currentCircle = null;
			this.reseted = true;
		},

		createTitle : function(element){
			// New element title
			var titleText = this.paper.text('50%', '50%', element.title.toUpperCase()).attr({
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

			var titleBox = this.paper.rect(boxBound.x-10, boxBound.y-7, boxBound.width+20, boxBound.height+14).attr({
				fill: '#000',
				stroke : 'none',
				opacity: 0
			}).animate({
				opacity: 1
			}, 350);

			titleText.toFront();

			this.titleSet.push(titleBox);
			this.titleSet.push(titleText);

			return boxBound;
		},

		createText : function(element, previousBox){
			var bbox = previousBox,
				setText = this.paper.set();
			bbox.y2 += 10;

			if(element.links) {
				element.links.forEach(function(link){
					// New text
					var text = this.paper.text(bbox.x, bbox.y2+8, link.text).attr({
						'text-anchor' : 'start',
						cursor : 'pointer'
					}).click(function(){
						window.location.href = link.url;
					});

					bbox = text.getBBox();

					setText.push(text);
					this.textSet.push(text);
				}, this);
			} else if(element.text) {
				// New text element
				var text = this.paper.text(bbox.x, '56%', element.text).attr({
					'text-anchor' : 'start'
				});
				setText.push(text);
				this.textSet.push(text);
			} else {
				return false;
			}

			bbox = this.textSet.getBBox();

			var box = this.paper.rect(bbox.x-10, bbox.y-10, bbox.width+20, bbox.height+20, 5).attr({
				fill: '#FFF',
				stroke : 'none',
				opacity: 0,
				'text-anchor' : 'start'
			}).animate({
				opacity: 0.7
			}, 350);

			this.textSet.push(box);

			setText.toFront();
		},

		_degreeToRad : function(value){
			return value * Math.PI / 180;
		},

		_posForAngle : function(angle){
			angle = this._degreeToRad(angle);
			return {
				cx : this.middleX + (Math.cos(angle) * this.radius), 
				cy : this.middleY + (Math.sin(angle) * this.radius)
			}
		}
	});

	$(window).addEvent('domready', function() {
		new Mandala();
	});

})(document.id, window, document, Raphael);
