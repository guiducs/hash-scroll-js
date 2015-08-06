;(function($){

  function hashScroll(wrapper, options) {
    this.defaults = $.extend({
      selector: '.page',
      speed: 1000,
      easing: 'easeInOutQuad',
      offset: 0,
      stopOnOffset: true,
      beforeMove: function() {},
      afterMove: function() {},
      onPageActive: function() {}
    }, options);

    this.wrapper   = wrapper;
    this.$targets  = null;
    this.$target   = null;
    this.$active   = null;
    this.watchHash = true;
    this.run();
  };

  hashScroll.prototype = {
    run: function(options) {
      this.getTargets();
      this.bindUI();
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
    getPrev: function() {
      if(this.$active == null) {
        return this.getTargets()[0].prevAll(this.defaults.selector).first();
      }
      return this.$active.prevAll(this.defaults.selector).first();  
    },
    getNext: function() {
      if(this.$active == null) {
        return this.getTargets()[0].nextAll(this.defaults.selector).first();
      }
      return this.$active.nextAll(this.defaults.selector).first();  
    },
    getHash: function() {
      var hash = window.location.hash;
      if( hash ) {
        hash = hash.replace('!', '').split('/')[0]; 
      }
      return hash;
    },
    isTarget: function(hash) {   
      if( $(hash).length ) {
        return $(hash).hasClass(this.defaults.selector.replace('.', ''));
      }  
      return false;
    },
    isTargetActive: function() {
      if(this.$active == null) {
        return false;
      }
      return this.$active.is(this.$target);
    },
    activeByHash: function() {
      var hash = this.getHash();
      if( hash ) {
        if(this.isTarget(hash)) {  // É uma das páginas?
          this.$target = $(hash);
          this.move(this.$target); 
        }
      }
    },
    move: function($target) {
      // A página já está ativa
      if(this.isTargetActive()) {
        return;
      }

      var self = this;
      
      // Desabilita a atualizacao da hash no scroll ate a animacao terminar
      self.watchHash = false; 

      // Chama o callback que antecede o move()
      self.defaults.beforeMove( $target );

      // Calcula a distancia
      var distance = (self.defaults.stopOnOffset) ? $target.offset().top - self.defaults.offset : $target.offset().top;

      // Move
      $('html,body').stop().animate({ 
        scrollTop: distance
      }, self.defaults.speed, self.defaults.easing, function() {
        // O callback do animate estava sendo executado antes da animação terminar, por isso o setTimeout
        setTimeout(function(){ 
          self.watchHash = true; // A hash volta a poder ser atualizada no scroll
          self.defaults.afterMove( $target );
        }, 300);

      });
    },
    movePrev: function() {
      this.$target = this.getPrev();
      this.move(this.$target);
    },
    moveNext: function() {
      this.$target = this.getNext();
      this.move(this.$target);
    },
    updateHash: function() {
      //Não está em nenhuma página
      if(this.getTarget() == null) {
        return;
      }

      //
      this.$target = this.getTarget();

      // A página já está ativa?
      if(this.isTargetActive()) {
        return;
      }

      this.$active = this.getTarget();
      
      this.defaults.onPageActive(this.$active);

      // Só muda a url quando a animação parar
      if(this.watchHash) {
        window.location.hash = "!" + this.$active.attr('id');
      }
    },
    bindUI: function() {
        
      var self = this;

      $(window).hashchange(function() {
        self.activeByHash();
      }).scroll(function() {	
        self.updateHash();
      }).load(function(){
        self.activeByHash();
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
