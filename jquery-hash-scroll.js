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
    this.$pages    = null;
    this.$active   = null;
    this.watchHash = true;
    this.run();
  };

  hashScroll.prototype = {
    run: function(options) {
      this.getPages();
      this.bindUI();
    }, 
    getPages: function() {
      if(this.$pages == null) {
        var pages = [];
      
        $(this.wrapper).find(this.defaults.selector).each(function(){
          pages.push($('#' + $(this).attr('id')));
        });

        this.$pages = pages;
      }

      return this.$pages;
    },
    getCurrent: function() {
      var pages     = this.getPages();
      var scrollTop = $(window).scrollTop() +  this.defaults.offset;

      pages = $(pages).map(function(){
        if ($(this).offset().top <= scrollTop) {
          return this;
        }
      });

      if(pages.length > 0) {
        return pages[pages.length - 1];
      }

      return null;
    },
    getActive: function() {
      if(this.$active == null) {
        this.$active = this.getPages()[0];
      }
      return this.$active;
    },
    getPrev: function() {
      return this.getActive().prevAll(this.defaults.selector).first();  
    },
    getNext: function() {
      return this.getActive().nextAll(this.defaults.selector).first();  
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
    activeByHash: function() {
      var hash = this.getHash();
      if( hash ) {
        if(this.isTarget(hash)) {  // É uma das páginas?
          this.move( $(hash) ); 
        }
      }
    },
    move: function($target) {
      // A página já está ativa
      if(this.getActive().is($target)) {
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
          self.watchHash       = true; // A hash volta a poder ser atualizada no scroll
          self.$active         = $target; // Atualiza a pagina ativa
          window.location.hash = "!" + self.$active.attr('id'); // Atualiza a hash
          self.defaults.afterMove( $target );
        }, 100);
      });
    },
    movePrev: function() {
      this.move(this.getPrev());
    },
    moveNext: function() {
      this.move(this.getNext());
    },
    updateHash: function() {
      //Não está em nenhuma página ou já está na página
      var current = this.getCurrent();
      if(current == null || this.getActive().is(current)) {
        return;
      }

      this.$active = this.getCurrent();
      
      this.defaults.onPageActive(this.$active);

      // Só muda a url quando a animação parar
      if(this.watchHash) {
        window.location.hash = "!" + this.$active.attr('id');
      }
    },
    bindUI: function() {
        
      var self = this;

      $(window).bind('hashchange load', function(){
        self.activeByHash();
      }).bind('scroll', function() {
        self.updateHash();
      })

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
