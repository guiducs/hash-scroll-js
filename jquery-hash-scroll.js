// Todo:
// resizeTargets; 
// coloca o tamanho dos targets com 100% da tela caso eles sejam menores.
// se as páginas se moverem na horizontal tem que ser 100% e redimensionar de acordo se for a opção. Vertical redimensionar so se for menor que 100%
// mode: dizer se o movimento e horizontal ou vertical
// html5: dizer se usa a hash ou pushState
// manter a hash inteira na url se o target for o que estiver lá
// só ativar a pagina depois da animacao ou scrolls, até lá é só o target?
;(function($){

  function hashScroll(wrapper, options) {
    this.defaults = $.extend({
      selector: '.page',
      offset: 0,
      speed: 1000,
      easing: 'easeOutCubic',
      beforeMove: function() {},
      afterMove: function() {},
      onPageActive: function() {}
    }, options);

		this.wrapper   = wrapper;
		this.$targets  = null;
		this.$active   = null;
		this.watchHash = true;
    this.run();
  };

  hashScroll.prototype = {
    run: function(options) {
      this.getTargets();
      this.bindUI();

      if(this.getHash() == "") {
        this.active(this.getTargets()[0]);
      } else {
        this.activeByHash();
      }
      
      this.move();
    }, 
    getTargets: function() {
      if(this.$targets == null) {
        var targets = [];
      
        $(this.wrapper).find(this.defaults.selector).each(function(){
          targets.push( $('#' + $(this).attr('id')) );
        });

        this.$targets = targets;
      }

      return this.$targets;
    },
    getTarget: function() {
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
    getActive: function() {
      if(this.$active == null) {
        return this.getTargets()[0];
      }
      return this.$active;
    },
    getPrev: function() {
      var $prev = this.getActive().prevAll(this.defaults.selector).first();
      
      if($prev.length) {
        return $prev;
      }

      return this.$active;
    },
    getNext: function() {
      var $next = this.getActive().nextAll(this.defaults.selector).first();
      
      if($next.length) {
        return $next;
      }

      return this.$active;
    },
    getHash: function() {
      var hash = window.location.hash;
      
      if(hash) {
        hash = hash.replace('!', '').split('/')[0]; 
      }

      return hash;
    },
    belongsToTargets: function(hash) {   
      return (typeof $(hash) !== "undefined" && $(hash).hasClass(this.defaults.selector.replace('.', '')));
    },
    isCurrentTargetEqualsActive: function() {
      return this.getActive().is(this.getTarget());
    },
    active: function($target) {
      this.$active = $target;
      this.defaults.onPageActive(this.$active);
    },
    activeByHash: function() {
      var hash = this.getHash();
      if(hash) {
        if(this.belongsToTargets(hash)) {  // É uma das páginas?
          this.active($(hash)); // Ativa
        }
      }
    },
    updateHash: function() {
      if(this.isCurrentTargetEqualsActive()) {
        return;
      }

      this.active(this.getTarget());

      if(this.watchHash) {
        window.location.hash = "!" + this.$active.attr('id');
      }
    },
    move: function() {
      if(this.isCurrentTargetEqualsActive()) {
        return;
      }

      var self = this;
      
      // Desabilita a atualizacao da hash no scroll
      self.watchHash = false; 

      // Chama o callback que antecede o move()
      self.defaults.beforeMove();

      // Move
      var distance = self.getActive().offset().top - self.defaults.offset;
      $('html,body').stop().animate({ 
        scrollTop: distance
      }, self.defaults.speed, self.defaults.easing, function() {
        // O callback do animate estava sendo executado antes da animação terminar, por isso o setTimeout
        setTimeout(function(){ 
          self.watchHash = true; // A hash volta a poder ser atualizada no scroll
        }, 300);
      });

      self.defaults.afterMove();
    },
    movePrev: function() {
      this.active(this.getPrev());
      this.move();
    },
    moveNext: function() {
      this.active(this.getNext());
      this.move();
    },
    bindUI: function() {
        
      var self = this;

      $(window).hashchange(function() {
        self.activeByHash();
        self.move();
      }).scroll(function() {	
        self.updateHash();
      });

        // Habilita navegação pelo teclado
  		$(document).keydown(function(e){
  			var charCode = e.which ? e.which : event.keyCode
  			if(charCode == 40 || charCode == 38) {
  				e.preventDefault();
  				if(charCode == 40) {
  		      self.moveNext();
  		    } else if(charCode == 38) {
  		    	self.movePrev();
  		    }
  			}
  		});

    }
  };

  $.fn.hashScroll = function(options) {
    return this.each(function() {
      $(this).data('hashScroll', new hashScroll(this, options));
    });
  }

})(jQuery);
