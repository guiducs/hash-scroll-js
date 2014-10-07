function SiteNav() {
    
  this.active = null;
  this.updUrl = true;
  this.config = {
    selector: {
			page : '.page'
    },
    offset: 0,
    speed: 1000,
    easing: 'easeOutCubic'
  }

};

SiteNav.prototype = {
  init: function(options) {
    $.extend(this.config, options);
    this.bindEvents();
  }, 
  getTargets: function() {
      
    var targets = [];
    
    $(this.config.selector.page).each(function(){
			targets.push( $('#' + $(this).attr('id')) );
    });

    return targets;

  },
  getCurrentTarget: function() {

    var targets   = this.getTargets();
    var scrollTop = $(window).scrollTop() +  this.config.offset;

    targets = $(targets).map(function(){
      if ($(this).offset().top <= scrollTop) {
				return this;
      }
    });

    if(targets.length > 0) {
			return targets[targets.length - 1];
    }

    return null;

  },
  getActive: function() {

  	if(this.active == null) {
  		return this.getTargets()[0];
  	}

  	return this.active;

  },
  setPrev: function() {
      
    var prev = this.getActive().prev();
    
    if(prev.length) {
			window.location.hash = "!" + prev.attr('id');
    }

  },
  setNext: function() {

    var next = this.getActive().next();

    if(next.length) {
			window.location.hash = "!" + next.attr('id');
    }

  },
  move: function(callback) {

    var self = this;

    $('body, html').stop().animate({ 
			scrollTop: self.active.offset().top - self.config.offset
    }, self.config.speed, self.config.easing , function() {
      if( typeof callback === "function" ) {
				callback.call();
      }
    });

  },
  moveTo: function(direction) {

    if(direction == "prev") {
      this.setPrev();
    } else if(direction == "next" || direction == undefined) {
      this.setNext();
    }

  },
  updateUrl: function() {

    var currentTarget = this.getCurrentTarget();
    
    if(this.active && this.active.get(0) === currentTarget.get(0)) {
			return;
    } 
    
    this.active = currentTarget;

    if(this.updUrl) {
			window.location.hash = "!" + this.active.attr('id');
    } 

    $.event.trigger('pageActived');
      
  },
  bindEvents: function() {
      
    var self = this;
      
    var $window = $(window);
    $window.hashchange(function(){

      var location = window.location.hash;
      if(location) {
        
				location = location.split('/')[0];
				var tmp  = $(location.replace('!', ''));
					
				if(tmp.hasClass(self.config.selector.page.replace('.', ''))) { // É uma das páginas?

					self.active = tmp; // ativa
					
	        var currentTarget = self.getCurrentTarget();

	        if(self.active && self.active.get(0) !== currentTarget.get(0)) { 

	          self.updUrl = false;
	          
	          self.move(function() { 
	            setTimeout(function() { // setTimout is used because callback animated function has been called before animation has ended changing url hash unecessary
								self.updUrl = true; 
	            }, 100);
	          });

	          // when you get one element that is at the limit to another on the scroll it acts like than were the same than the hash does not changed
	          self.active = null; 

					} 

        } 

      } else {    
				self.active = $(self.config.selector.page).first();
      }
        
    }).scroll(function() {	
    	self.updateUrl();
    }).load(function(){
			$(this).hashchange();
    });

    // Enable keyboard navigation up/down
		$(document).keydown(function(e){
			var charCode = e.which ? e.which : event.keyCode
			if(charCode == 40 || charCode == 38) {
				e.preventDefault();
				if(charCode == 40) {
		      self.moveTo("next");
		    } else if(charCode == 38) {
		    	self.moveTo("prev");
		    }
			}
		});

  }
};
