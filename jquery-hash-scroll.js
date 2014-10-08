// Todo:
// resizeTargets; 
// coloca o tamanho dos targets com 100% da tela caso eles sejam menores.
// se as páginas se moverem na horizontal tem que ser 100% e redimensionar de acordo se for a opção. Vertical redimensionar so se for menor que 100%
// mode: dizer se o movimento e horizontal ou vertical
// html5: dizer se usa a hash ou pushState
;(function($){

  function hashScroll(wrapper, options) {
    this.defaults = $.extend({
      selector: '.page',
      offset: 0,
      speed: 1000,
      easing: 'easeOutCubic',
      onPageActive: function() {}
    }, options);
    this.$targets = null;
    this.$active = null;
    this.watchHash = true;
  };

  hashScroll.prototype = {
    init: function(options) {
        this.getTargets();
        this.bindUI();
        this.activeByHash();
        this.move();
    }, 
    getTargets: function() {
      if(this.$targets == null) {
        var targets = [];
      
        $(wrapper).find(this.defaults.selector).each(function(){
          targets.push( $('#' + $(this).attr('id')) );
        });

        this.$targets = targets;
      }

      return this.$targets;
    },
    getActive: function() {
        if(this.$active == null) {
            this.$active = this.getTargets()[0];
        }
        return this.$active;
    },
    getPrev: function() {
        var $prev = this.getActive().prev();
        if($prev.length) {
            return $prev;
        }
        return $this.active;
    },
    getNext: function() {
      var $next = this.getActive().next();
      if($next.length) {
        return $next;
      }
      return this.$active;
    },
    getCurrentTarget: function() {
        var targets   = this.getTargets();
        var scrollTop = $(window).scrollTop() +  this.defaults.offset;

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
    belongsToTargets: function($target) {   
        return this.$targets.filter($target).length;
    },
    isCurrentTargetEqualsActive: function() {
        return this.$active.is(this.getCurrentTarget());
    },
    getHash: function() {
      var hash = window.location.hash;
      
      if(hash) {
        hash = hash.replace('!', '').split('/')[0]; // Pega o segmento da hash
      }

      return hash;
    },
    activeByHash: function() {
        var hash = this.getHash();
        if(hash) {
            if(this.belongsToTargets($(hash)) {  // É uma das páginas?
                this.$active = $target; // Ativa
            }
        }
    },
    updateHash: function() {
        if(this.isCurrentTargetEqualsActive()) {
            return;
        }

        this.$active = this.getCurrentTarget();

        if(this.watchHash) {
  			window.location.hash = "!" + this.$active.attr('id');
        } 
      
        this.onPageActive(this.$active);
    },
    move: function(callback) {
        if(this.isCurrentTargetEqualsActive()) {
            return;
        }

        var self = this;
        
        // Não muda a hash até o final da animação
        self.watchHash = false; 

        $('body, html').stop().animate({ 
            scrollTop: self.getActive().offset().top - self.defaults.offset
        }, self.defaults.speed, self.defaults.easing , function() {
            // setTimeout é utilizado pq a whatchHahs estava sendo mudado antes do final da animação mudando a hash sem necessidade
            setTimeout(function() { 
                self.watchHash = true; 
                window.location.hash = "!" + this.$active.attr('id');
            }, 100);

        });
    },
    movePrev: function() {
        this.$active = this.getPrev();
        this.move();
    },
    moveNext: function() {
        this.$active = this.getNext();
        this.move();
    },
    bindUI: function() {
        
        var self = this;
        $(window).hashchange(function() {
            self.activeByHash();
            self.move();
            // when you get one element that is at the limit to another on the scroll it acts like than were the same than the hash does not changed
            self.active = null; 
        }).scroll(function() {	
            self.updateHash();
        });

        // Habilita navegação pelo teclado
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

  $.fn.hashScroll = function(options) {
    return this.each(function() {
        new hashScroll(this, options).init();
    });
  }

})(jQuery);
