;
(function($, window, document, undefined) {

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
			this.circles = [];
			this.currentCircle = null;
			this.title = null;
			this.text = null;

			this.middleX = this.options.width/2;
			this.middleY = this.options.height/2;
			this.radius = (this.middleX > this.middleY ? this.middleY : this.middleX) - this.options.radius * this.options.magnification;
			this.radiusOver = this.options.radius * this.options.magnification;

			this.setContainerStyles();			
			this.drawMandala();
		},

		setContainerStyles: function() {
			this.container.setStyles({
				width: this.options.width,
				height: this.options.height,
				background : 'url('+this.options.background+') 50% 50% no-repeat'
			}).addEvent('mouseleave', this.resetMandala.bind(this));
		},

		drawMandala: function() {
			for(var i = 0; i < this.options.items.length; i++) {

				// Get this
				var $this = this;

				// Determine element pos
				var angle = 360/this.options.items.length * i,
					pos = this._coordForAngle(angle, this.options.radius);

				// Create a new circle on stage
				var circle = new Element('div.circle', {
					styles : {
						width : pos.diameter,
						height : pos.diameter,
						left : pos.cx,
						top : pos.cy,
						background : 'url('+this.options.items[i].url+') 50% 50% no-repeat'
					}
				}).set('morph', {
					duration: 'short',
					transition: 'back:out'
				}).store('angle', angle).store('pos', i).inject(this.container);

				// Add to set
				this.circles.push(circle);

				// Mouse over
				circle.addEvents({
					mouseenter : function(e) {
						if($this.currentCircle == this) return;

						$this.currentCircle = this;
						
						// Get element
						var element = this,
							pos = $this._coordForAngle(element.retrieve('angle'), $this.radiusOver);

						// Zoom element in place and compensate transform (used to center image)
						element.morph({
							width : pos.diameter,
							height : pos.diameter,
							left : pos.cx,
							top : pos.cy,
							opacity : 1,
						});

						// Create all title and text
						$this.createTitle($this.options.items[element.retrieve('pos')]);
						$this.createText($this.options.items[element.retrieve('pos')]);


						// Push away items around element
						$this.circles.forEach(function(el){
							if(element != el){
								// get element pos and sign (-/+)
								var pos = el.retrieve('pos') - element.retrieve('pos'),
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

								var newAngle = el.retrieve('angle') + delta * ($this.options.items.length/2) * $this.options.displacement,
									newPos = $this._coordForAngle(newAngle, $this.options.radius * $this.options.mignification);

								// Animate to new pos
								el.morph({
									left : newPos.cx,
									top : newPos.cy,
									width : newPos.diameter,
									height : newPos.diameter,
									opacity : $this.options.opacity
								});
							}
						});
					}
				});
			}
		},

		resetMandala : function(){
			this.title && this.title.destroy();
			this.text && this.text.destroy();
			
			// Pull items around it
			this.circles.each(function(el){
				var newPos = this._coordForAngle(el.retrieve('angle'), this.options.radius);

				// Animate to original pos
				el.morph({
					left : newPos.cx,
					top : newPos.cy,
					width : newPos.diameter,
					height : newPos.diameter,
					opacity : 1,
				});
			}, this);

			this.currentCircle = null;
		},

		createTitle : function(element){
			this.title && this.title.destroy();
			
			// New element title
			this.title = new Element('div.title', {
				html : element.title.toUpperCase(),
				styles : {
					opacity : 0
				}
			}).inject(this.container).tween('opacity', 1);
		},

		createText : function(element, previousBox){
			this.text && this.text.destroy();
			
			var titleCoord = this.title.getCoordinates(this.container);
			this.text = new Element('div.text', {
				styles : {
					opacity : 0,
					left : titleCoord.left - 1,
					top : titleCoord.bottom
				}
			}).inject(this.container);

			if(element.links) {
				element.links.forEach(function(link){
					// New text
					new Element('a', {
						href : link.url,
						html : link.text
					}).inject(this.text);
				}, this);
			} else if(element.text) {
				new Element('span', {
					html : element.text
				}).inject(this.text);
			} else {
				return false;
			}

			this.text.tween('opacity', 1);
		},

		_degreeToRad : function(value){
			return value * Math.PI / 180;
		},

		_coordForAngle : function(angle, radius){
			angle = this._degreeToRad(angle);
			return {
				cx : this.middleX + (Math.cos(angle) * this.radius) - radius, 
				cy : this.middleY + (Math.sin(angle) * this.radius) - radius,
				diameter : radius * 2
			}
		}
	});

	$(window).addEvent('domready', function() {
		new Mandala();
	});

})(document.id, window, document);