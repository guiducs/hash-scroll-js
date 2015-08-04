// Todo:
// resizeTargets; 
// coloca o tamanho dos targets com 100% da tela caso eles sejam menores.
// se as páginas se moverem na horizontal tem que ser 100% e redimensionar de acordo se for a opção. Vertical redimensionar so se for menor que 100%
// mode: dizer se o movimento e horizontal ou vertical
// html5: dizer se usa a hash ou pushState
// manter a hash inteira na url se o target for o que estiver lá
// só ativar a pagina depois da animacao ou scrolls, até lá é só o target?
// Chamar um method um metodo pra disparar um evento antes de chegar na pagina (onBeforePageActive, offsetBefore), stopOnOffset ta funcionando assim mas o nome e jeito estão estnhos
// http://stackoverflow.com/questions/1034306/public-functions-from-within-a-jquery-plugin methodos publicos
;(function($){

  function hashScroll(wrapper, options) {
    this.defaults = $.extend({
      selector: '.page',
      speed: 300,
      easing: 'easeInOutQuad',
      offset: 0,
      stopOnOffset: true,
      beforeMove: function() {},
      afterMove: function() {},
      onPageActive: function() {},
      onReachOffset: function() {}
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
      this.activeByHash();
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

      return this.getActive();
    },
    getNext: function() {
      var $next = this.getActive().nextAll(this.defaults.selector).first();
      
      if($next.length) {
        return $next;
      }

      return this.getActive();
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
      this.move();
    },
    activeByHash: function() {
      var hash = this.getHash();
      if( hash ) {
        if(this.belongsToTargets(hash)) {  // É uma das páginas?
          this.active($(hash)); // Ativa
        }
      }
    },
    updateHash: function() {
      if(this.isCurrentTargetEqualsActive()) {
        return;
      }

      if(this.getTarget() != null) {
        this.active(this.getTarget());
        this.defaults.onPageActive(this.$active);

        if(this.watchHash) {
          window.location.hash = "!" + this.$active.attr('id');
        }
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
      self.defaults.beforeMove( self.getActive() );

      // Move
      var distance = (self.defaults.stopOnOffset) ? self.getActive().offset().top - self.defaults.offset : self.getActive().offset().top;

      $('html,body').stop().animate({ 
        scrollTop: distance
      }, self.defaults.speed, self.defaults.easing, function() {
        // O callback do animate estava sendo executado antes da animação terminar, por isso o setTimeout
        setTimeout(function(){ 
          self.watchHash = true; // A hash volta a poder ser atualizada no scroll
          self.defaults.afterMove( self.getActive() );
        }, 300);

      });
    },
    movePrev: function() {
      this.active(this.getPrev());
    },
    moveNext: function() {
      this.active(this.getNext());
    },
    bindUI: function() {
        
      var self = this;

      $(window).hashchange(function() {
        self.activeByHash();
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
