(function($){
	"use strict";

	var bigslam_display = 'desktop';
	if( typeof(window.matchMedia) == 'function' ){
		$(window).on('resize bigslam-set-display', function(){
			if( window.matchMedia('(max-width: 419px)').matches ){
				bigslam_display = 'mobile-portrait';
			}else if( window.matchMedia('(max-width: 767px)').matches ){
				bigslam_display = 'mobile-landscape'
			}else if( window.matchMedia('(max-width: 959px)').matches ){
				bigslam_display = 'tablet'
			}else{
				bigslam_display = 'desktop';
			}
		});
		$(window).trigger('bigslam-set-display');
	}else{
		$(window).on('resize bigslam-set-display', function(){
			if( $(window).innerWidth() <= 419 ){
				bigslam_display = 'mobile-portrait';
			}else if( $(window).innerWidth() <= 767 ){
				bigslam_display = 'mobile-landscape'
			}else if( $(window).innerWidth() <= 959 ){
				bigslam_display = 'tablet'
			}else{
				bigslam_display = 'desktop';
			}
		});
		$(window).trigger('bigslam-set-display');
	}

	// ref : http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	// ensure 1 is fired
	var bigslam_debounce = function(func, threshold, execAsap){
		
		var timeout;

		return function debounced(){
			
			var obj = this, args = arguments;
			
			function delayed(){
				if( !execAsap ){
					func.apply(obj, args);
				}
				timeout = null;
			};

			if( timeout ){
				clearTimeout(timeout);
			}else if( execAsap ){
				func.apply(obj, args);
			}
			timeout = setTimeout(delayed, threshold);
		};
	}	
	
	// reduce the event occurance
	var bigslam_throttling = function(func, threshold){
		
		var timeout;

		return function throttled(){
			var obj = this, args = arguments;
			
			function delayed(){
				func.apply(obj, args);
				timeout = null;
			};

			if( !timeout ){
				timeout = setTimeout(delayed, threshold);
			}
		};
	}	

	/////////////////////////
	// menu handle function
	/////////////////////////
	var bigslam_sf_menu = function( menu ){

		if( menu.length == 0 ) return;

		this.main_menu = menu;

		this.slide_bar = this.main_menu.children('.bigslam-navigation-slide-bar');
		this.slide_bar_small = this.slide_bar.siblings('.bigslam-navigation-slide-bar-small');
		this.slide_bar_long = this.main_menu.closest('.bigslam-header-container').siblings('.bigslam-navigation-slide-bar-long');
		this.slide_bar_val = { width: 0, left: 0 };
		
		this.current_menu = this.main_menu.children('.sf-menu').children('.current-menu-item, .current-menu-ancestor').children('a');
		this.slide_bar_offset = parseInt(this.main_menu.children('.sf-menu').children('li:first-child').css('padding-right'));

		this.init();
		
	} // bigslam_sf_menu

	bigslam_sf_menu.prototype = {
		
		init: function(){
			
			var t = this;
			
			// sf menu mod
			t.sf_menu_mod();
			
			// init superfish menu
			if(typeof($.fn.superfish) == 'function'){
				t.main_menu.superfish({ delay: 400, speed: 'fast' });	
				
				t.sf_menu_position();
				$(window).resize(bigslam_debounce(function(){
					t.sf_menu_position();
				}, 300));
			}
			
			// init the slidebar
			if( t.slide_bar.length > 0 ){
				t.init_slidebar();
			}
			
		}, // init
		
		sf_menu_mod: function(){
			
			// create the mega menu script
			this.main_menu.find('.sf-mega > ul').each(function(){	
				var mega_content = $('<div></div>');
				var mega_row = $('<div class="sf-mega-section-wrap" ></div>');
				var mega_column_size = 0;
				
				$(this).children('li').each(function(){
					var column_size = parseInt($(this).attr('data-size'));
					if( mega_column_size + column_size  <= 60 ){
						mega_column_size += column_size;
					}else{	
						mega_column_size = column_size;
						mega_content.append(mega_row);
						mega_row = $('<div class="sf-mega-section-wrap" ></div>');
					}
					
					mega_row.append( $('<div class="sf-mega-section" ></div>')
						.addClass('bigslam-column-' + column_size)
						.html( $('<div class="sf-mega-section-inner" ></div>')
							.addClass($(this).attr('class'))
							.attr('id', $(this).attr('id'))
							.html($(this).html())
						)
					);
				});
				
				mega_content.append(mega_row);
				$(this).replaceWith(mega_content.html());
			});
			
		}, // sf_menu_mod
		
		sf_menu_position: function(){

			if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;

			// submenu of normal menu
			var sub_normal_menu = this.main_menu.find('.sf-menu > li.bigslam-normal-menu .sub-menu');
			
			sub_normal_menu.css({display: 'block'}).removeClass('sub-menu-right');
			sub_normal_menu.each(function(){
				if( $(this).offset().left + $(this).width() > $(window).width() ){
					$(this).addClass('sub-menu-right');
				}
			});
			sub_normal_menu.css({display: 'none'});
			
			// submenu of mega menu
			this.main_menu.find('.sf-menu > li.bigslam-mega-menu .sf-mega').each(function(){
				if( !$(this).hasClass('sf-mega-full') ){
					
					$(this).css({ display: 'block' });
					
					// set the position
					$(this).css({ right: '', 'margin-left': -(($(this).width() - $(this).parent().outerWidth()) / 2) });
					
					// if exceed the screen
					if( $(this).offset().left + $(this).width() > $(window).width() ){
						$(this).css({ right: 0, 'margin-left': '' });
					}
					
					$(this).css({ display: 'none' });
				}
				
			});
			
		}, // sf_menu_position
		
		init_slidebar: function(){
			
			var t = this;
			
			t.init_slidebar_pos();
			$(window).load(function(){ t.init_slidebar_pos(); });
			
			// animate slidebar 
			t.main_menu.children('.sf-menu').children('li').hover(function(){
				var nav_element = $(this).children('a');

				if( nav_element.length > 0 ){
					var slide_bar_width = nav_element.outerWidth() + (2 * t.slide_bar_offset);
					var slide_bar_left = nav_element.position().left - t.slide_bar_offset;
					
					t.slide_bar.animate({ width: slide_bar_width, left: slide_bar_left }, { queue: false, duration: 250 });

					if( t.slide_bar_small.length ){
						t.slide_bar_small.animate({ width: slide_bar_width, left: slide_bar_left }, { queue: false, duration: 250 });
					}
					if( t.slide_bar_long.length ){
						t.slide_bar_long.animate({ left: nav_element.offset().left }, { queue: false, duration: 250 });
					}
				}
			}, function(){
				t.slide_bar.animate({ width: t.slide_bar_val.width, left: t.slide_bar_val.left }, { queue: false, duration: 250 });

				if( t.slide_bar_small.length ){
					t.slide_bar_small.animate({ width: t.slide_bar_val.width, left: t.slide_bar_val.left }, { queue: false, duration: 250 });
				}
				if( t.slide_bar_long.length ){
					t.slide_bar_long.animate({ left: t.slide_bar_val.left_offset }, { queue: false, duration: 250 });
				}
			});
			
			// window resize event
			$(window).on('resize', function(){ t.init_slidebar_pos(); });
			$(window).on('bigslam-navigation-slider-bar-init', function(){ 
				t.current_menu = t.main_menu.children('.sf-menu').children('.current-menu-item, .current-menu-ancestor').children('a');
				t.animate_slidebar_pos(); 
			});
			$(window).on('bigslam-navigation-slider-bar-animate', function(){ t.animate_slidebar_pos(); });
			
		}, // init_slidebar
		
		init_slidebar_pos: function(){

			if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;

			var t = this;
			t.slide_bar_offset = parseInt(t.main_menu.children('.sf-menu').children('li:first-child').css('padding-right'));

			if( t.current_menu.length > 0 ){
				t.slide_bar_val = { width: t.current_menu.outerWidth() + (2 * t.slide_bar_offset), left: t.current_menu.position().left - t.slide_bar_offset, left_offset: t.current_menu.offset().left };
			}else{
				t.slide_bar_val = { width: 0, left: t.main_menu.children('ul').children('li:first-child').position().left, left_offset: t.main_menu.offset().left };
			}
			t.slide_bar.css({ width: t.slide_bar_val.width, left: t.slide_bar_val.left, display: 'block' });

			if( t.slide_bar_small.length ){
				t.slide_bar_small.css({ width: t.slide_bar_val.width, left: t.slide_bar_val.left, display: 'block', top: t.main_menu.position().top });
			}
			if( t.slide_bar_long.length ){
				t.slide_bar_long.css({ left: t.slide_bar_val.left_offset, display: 'block' });
			}

		}, // set_slidebar_pos	
		animate_slidebar_pos: function(){

			if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;

			var t = this;
			
			if( t.current_menu.length > 0 ){
				t.slide_bar_val = { width: t.current_menu.outerWidth() + (2 * t.slide_bar_offset), left: t.current_menu.position().left - t.slide_bar_offset, left_offset: t.current_menu.offset().left };
			}else{
				t.slide_bar_val = { width: 0, left: t.main_menu.children('ul').children('li:first-child').position().left, left_offset: t.main_menu.offset().left };
			}
			t.slide_bar.animate({ width: t.slide_bar_val.width, left: t.slide_bar_val.left }, { queue: false, duration: 250 });

			if( t.slide_bar_small.length ){
				t.slide_bar_small.animate({ width: t.slide_bar_val.width, left: t.slide_bar_val.left, top: t.main_menu.position().top }, { queue: false, duration: 250 });
			}
			if( t.slide_bar_long.length ){
				t.slide_bar_long.animate({ left: t.slide_bar_val.left_offset }, { queue: false, duration: 250 });
			}

		} // set_slidebar_pos
		
	}; // bigslam_sf_menu.prototype
	
	/////////////////////////
	// mobile menu
	/////////////////////////
	$.fn.bigslam_mobile_menu = function( args ){
		
		var menu_button = $(this).siblings('.bigslam-mm-menu-button');
		var options = {
			navbar: { title: '<span class="mmenu-custom-close" ></span>' },
			extensions: [ 'pagedim-black' ],

		};
		var extensions = { 
			offCanvas: { pageNodetype: '.bigslam-body-outer-wrapper' } 
		};

		// remove the wrap for submenu
		$(this).find('a[href="#"]').each(function(){
			var content = $(this).html();
			$('<span class="bigslam-mm-menu-blank" ></span>').html(content).insertBefore($(this));
			$(this).remove();
		});
		
		if( $(this).attr('data-slide') ){
			var html_class = 'bigslam-mmenu-' + $(this).attr('data-slide');
			$('html').addClass(html_class);

			options.offCanvas = { position : $(this).attr('data-slide') };
		}		
		
		$(this).mmenu(options, extensions);

		var menu_api = $(this).data('mmenu');
		$(this).find('a').not('.mm-next, .mm-prev').click(function(){
			menu_api.close();
		});
		$(this).find('.mmenu-custom-close').click(function(){
			menu_api.close();
		});

		// add class active to button
		menu_api.bind('open', function($panel){
			menu_button.addClass('bigslam-active');
		});
		menu_api.bind('close', function($panel){
			menu_button.removeClass('bigslam-active');
		});

	}	

	/////////////////////////
	// overlay menu
	/////////////////////////
	var bigslam_overlay_menu = function( menu ){

		this.menu = menu;
		this.menu_button = menu.children('.bigslam-overlay-menu-icon');
		this.menu_content = menu.children('.bigslam-overlay-menu-content');
		this.menu_close = this.menu_content.children('.bigslam-overlay-menu-close');

		this.init();
	}
	bigslam_overlay_menu.prototype = {
		
		init: function(){

			var t = this;

			// add transition delay for each menu
			var delay_count = 0;
			t.menu_content.appendTo('body');
			t.menu_content.find('ul.menu > li').each(function(){
				$(this).css('transition-delay', (delay_count * 150) + 'ms');

				delay_count++;
			});

			// bind the menu button
			t.menu_button.click(function(){
				$(this).addClass('bigslam-active');

				t.menu_content.fadeIn(200, function(){
					$(this).addClass('bigslam-active');
				});

				return false;
			});

			// bind the menu close button
			t.menu_close.click(function(){
				t.menu_button.removeClass('bigslam-active');

				t.menu_content.fadeOut(400, function(){
					$(this).removeClass('bigslam-active');
				});
				t.menu_content.find('.sub-menu').slideUp(200).removeClass('bigslam-active');

				return false;
			});

			// menu item click
			t.menu_content.find('a').click(function(e){ 
				var sub_menu = $(this).siblings('.sub-menu');
				if( sub_menu.length > 0 ){
					if( !sub_menu.hasClass('bigslam-active') ){
						var prev_active = sub_menu.closest('li').siblings().find('.sub-menu.bigslam-active');
						if( prev_active.length > 0 ){
							prev_active.removeClass('bigslam-active').slideUp(150);
							sub_menu.delay(150).slideDown(400, 'easeOutQuart').addClass('bigslam-active');
						}else{
							sub_menu.slideDown(400, 'easeOutQuart').addClass('bigslam-active');
						}

						$(this).addClass('bigslam-no-preload');
						return false;
					}else{
						$(this).removeClass('bigslam-no-preload');
					}
				}else{
					t.menu_close.trigger('click');
				}
			});

		}

	}; // bigslam_overlay_menu.prototype

	/////////////////////////
	// header side navigation
	/////////////////////////
	var bigslam_header_side_nav = function( side_nav ){

		if( side_nav.length == 0 ) return;

		this.prev_scroll = 0;

		this.side_nav = side_nav;
		this.side_nav_content = side_nav.children();

		this.init();

	} // bigslam_header_side_nav

	bigslam_header_side_nav.prototype = {

		init: function(){

			var t = this;

			t.init_nav_bar_element();

			$(window).resize(function(){ 
				t.init_nav_bar_element();
			});
			
			$(window).scroll(function(){

				if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;

				// if content longer than screen height
				if( t.side_nav.hasClass('bigslam-allow-slide') ){

					var admin_bar_height = parseInt($('html').css('margin-top'));
					var scroll_down = ($(window).scrollTop() > t.prev_scroll);
					t.prev_scroll = $(window).scrollTop();

					// if scroll down
					if( scroll_down ){

						if( !t.side_nav.hasClass('bigslam-fix-bottom') ){
							if( t.side_nav.hasClass('bigslam-fix-top') ){
								t.side_nav.css('top', t.side_nav.offset().top);
								t.side_nav.removeClass('bigslam-fix-top');

							}else if( $(window).height() + $(window).scrollTop() > t.side_nav_content.offset().top + t.side_nav_content.outerHeight() ){ 
								if( !t.side_nav.hasClass('bigslam-fix-bottom') ){
									t.side_nav.addClass('bigslam-fix-bottom');
									t.side_nav.css('top', '');
								}
							}
						}

					// if scroll up
					}else{

						if( !t.side_nav.hasClass('bigslam-fix-top') ){
							if( t.side_nav.hasClass('bigslam-fix-bottom') ){
								var top_pos = $(window).scrollTop() + ($(window).height() - admin_bar_height) - t.side_nav_content.outerHeight();
								t.side_nav.css('top', top_pos);
								t.side_nav.removeClass('bigslam-fix-bottom');

							}else if( $(window).scrollTop() + admin_bar_height < t.side_nav_content.offset().top ){ 
								if( !t.side_nav.hasClass('bigslam-fix-top') ){
									t.side_nav.addClass('bigslam-fix-top');
									t.side_nav.css('top', '');
								}
							}
						}
					
					}

				}
			});

		},

		init_nav_bar_element: function(){

			if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;

			var t = this;
			var middle_pos = t.side_nav_content.children('.bigslam-pos-middle').addClass('bigslam-active');
			var bottom_pos = t.side_nav_content.children('.bigslam-pos-bottom').addClass('bigslam-active');

			// remove all additional space
			t.side_nav_content.children('.bigslam-pre-spaces').remove();

			// add class depends on the screen size/content
			if( $(window).height() < t.side_nav_content.height() ){
				t.side_nav.addClass('bigslam-allow-slide');
			}else{
				t.side_nav.removeClass('bigslam-allow-slide bigslam-fix-top bigslam-fix-bottom').css('top', '');

				// set the middle position
				if( t.side_nav.hasClass('bigslam-style-middle') ){
					middle_pos.each(function(){
						var top_padding = parseInt($(this).css('padding-top'));
						var prespace = ((t.side_nav.height() - (t.side_nav_content.height() - top_padding)) / 2) - top_padding;

						if( prespace > 0 ){
							$('<div class="bigslam-pre-spaces" ></div>').css('height', prespace).insertBefore($(this));
						}
					});
				}

				// set the bottom position
				bottom_pos.each(function(){
					var prespace = t.side_nav.height() - t.side_nav_content.height();

					if( prespace > 0 ){
						$('<div class="bigslam-pre-spaces" ></div>').css('height', prespace).insertBefore($(this));
					}
				});

			}
		}

	}; // bigslam_sf_menu.prototype

	/////////////////////////
	// anchoring
	/////////////////////////	

	var bigslam_anchor = function(){

		this.anchor_link = $('a[href*="#"]').not('[href="#"]').filter(function(){

			// for mm-menu plugin
			if( $(this).is('.bigslam-mm-menu-button, .mm-next, .mm-prev, .mm-title') ){
				return false;
			}

			// for additional plugins
			if( $(this).is('.fbx-btn-transition') ){
				return false;
			}

			// for woocommerce
			if( $(this).parent('.description_tab, .reviews_tab').length || $(this).closest('.woocommerce').length ){
				return false;
			}

			return true;
		});

		if( this.anchor_link.length ){
			this.menu_anchor = $('#bigslam-main-menu, #bigslam-bullet-anchor');
			this.home_anchor = this.menu_anchor.find('ul.sf-menu > li.current-menu-item > a, ul.sf-menu > li.current-menu-ancestor > a, .bigslam-bullet-anchor-link.current-menu-item');

			this.init();
		}
	}
	bigslam_anchor.prototype = {

		init: function(){

			var t = this;

			t.animate_anchor();
			t.scroll_section();

			// init bullet anchor height
			t.menu_anchor.filter('#bigslam-bullet-anchor').each(function(){
				$(this).css('margin-top', - t.menu_anchor.height() / 2).addClass('bigslam-init');
			});

			// initialize if the page hash exists
			// wait for all element to initialize ( eg. flexslider )
			var url_hash = window.location.hash;
			if( url_hash ){
				setTimeout(function(){

					var current_menu = t.menu_anchor.find('a[href*="' + url_hash + '"]');
					if( !current_menu.is('.current-menu-item, .current-menu-ancestor') ){
						current_menu.addClass('current-menu-item').siblings().removeClass('current-menu-item current-menu-ancestor');

						$(window).trigger('bigslam-navigation-slider-bar-init');
					}

					t.scroll_to(url_hash, false, 300);
				}, 500);
			}
	
		},

		animate_anchor: function(){

			var t = this;

			// home anchor
			t.home_anchor.click(function(){

				if( window.location.href == this.href ){
					$('html, body').animate({ scrollTop: 0 }, { duration: 1500, easing: 'easeOutQuart' });
					return false;
				}
				
			});

			// normal anchor
			t.anchor_link.click(function() {
				if( location.hostname == this.hostname && location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') ){
					return t.scroll_to(this.hash, true);
				}
			});

		}, // animate anchor

		scroll_to: function( hash, redirect, duration ){

			// start scrolling
			if( hash == '#bigslam-top-anchor' ){
				var scroll_position = 0;
			}else{
				
				var target = $(hash);

				if( target.length ){
					var scroll_position = target.offset().top;
				}
			}

			if( typeof(scroll_position) != 'undefined' ){

				// offset for wordpress admin bar
				scroll_position = scroll_position - parseInt($('html').css('margin-top'));

				// offset for fixed nav bar
				if( typeof(window.bigslam_anchor_offset) != 'undefined' ){
					scroll_position = scroll_position - parseInt(window.bigslam_anchor_offset);
				}

				if( scroll_position < 0 ) scroll_position = 0;

				$('html, body').animate({ scrollTop: scroll_position }, { duration: 1500, easing: 'easeOutQuart', queue: false });

				return false;

			}else if( redirect ){

				window.location.href = bigslam_script_core.home_url + hash;

				return false;
			}

		}, // scroll to

		scroll_section: function(){

			var t = this;

			// have anchor in anchor menu
			var menu_link_anchor = this.menu_anchor.find('a[href*="#"]').not('[href="#"]');
			if( !menu_link_anchor.length ){ return; }

			// get anchor section
			var home_anchor_section = $('#bigslam-page-wrapper');
			var anchor_section = home_anchor_section.find('div[id], section[id]');
			if( !anchor_section.length ){ return; }

			// add data for faster query
			menu_link_anchor.each(function(){
				if( $(this).closest('.sub-menu').length == 0 && $(this.hash).length ){
					$(this).attr('data-anchor', this.hash);
				}
			});

			// check section on scroll event
			$(window).scroll(function(){

				if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;
				
				if( t.home_anchor.length && $(window).scrollTop() < home_anchor_section.offset().top ){

					t.home_anchor.each(function(){
						if( $(this).hasClass('bigslam-bullet-anchor-link') ){
							$(this).addClass('current-menu-item').siblings().removeClass('current-menu-item');
							$(this).parent('.bigslam-bullet-anchor').attr('data-anchor-section', 'bigslam-home');
						}else if( !$(this).parent('.current-menu-item, .current-menu-ancestor').length ){
							$(this).parent().addClass('current-menu-item').siblings().removeClass('current-menu-item current-menu-ancestor');
							$(window).trigger('bigslam-navigation-slider-bar-init');
						}			
					});

				}else{
					var section_position = $(window).scrollTop() + ($(window).height() / 2);

					anchor_section.each(function(){
						if( $(this).css('display') == 'none' ) return;
						
						var top_offset_pos = $(this).offset().top;

						if( (section_position > top_offset_pos) && (section_position <  top_offset_pos + $(this).outerHeight()) ){
							var section_id = $(this).attr('id');
							menu_link_anchor.filter('[data-anchor="#' +  section_id + '"]').each(function(){
								if( $(this).hasClass('bigslam-bullet-anchor-link') ){
									$(this).addClass('current-menu-item').siblings().removeClass('current-menu-item');
									$(this).parent('.bigslam-bullet-anchor').attr('data-anchor-section', section_id);
								}else if( $(this).parent('li.menu-item').length && !$(this).parent('li.menu-item').is('.current-menu-item, .current-menu-ancestor') ){
									$(this).parent('li.menu-item').addClass('current-menu-item').siblings().removeClass('current-menu-item current-menu-ancestor');
									$(window).trigger('bigslam-navigation-slider-bar-init');
								}
							});
							
							return false;
						}

					});
				}

			});

		} // scroll section

	};

	var bigslam_sticky_navigation = function(){

		this.sticky_nav = $('.bigslam-with-sticky-navigation .bigslam-sticky-navigation');
		this.sticky_nav_logo = this.sticky_nav.find('.bigslam-logo-inner img');
		this.logo_height = 35;
		
		if( this.sticky_nav.length ){
			this.mobile_menu = $('#bigslam-mobile-header');

			this.init(); 
		}

	}
	bigslam_sticky_navigation.prototype = {
		
		init: function(){

			var t = this;

			if( t.sticky_nav.hasClass('bigslam-style-fixed') ){
				t.style_fixed();
			}else if( t.sticky_nav.hasClass('bigslam-style-slide') ){
				t.style_slide();
			}
			t.style_mobile_slide();

			if( t.sticky_nav.hasClass('bigslam-sticky-navigation-height') ){
				window.bigslam_anchor_offset = t.sticky_nav.outerHeight();
				$(window).resize(function(){
					window.bigslam_anchor_offset = t.sticky_nav.outerHeight();
				});
			}else{
				window.bigslam_anchor_offset = 75;
			}

			$(window).trigger('bigslam-set-sticky-navigation'); 
			$(window).trigger('bigslam-set-sticky-mobile-navigation'); 
		},

		style_fixed: function(){

			var t = this;
			var placeholder = $('<div class="bigslam-sticky-menu-placeholder" ></div>');

			$(window).on('scroll bigslam-set-sticky-navigation', function(){

				if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ) return;

				var page_offset = parseInt($('html').css('margin-top'));

				if( !t.sticky_nav.hasClass('bigslam-fixed-navigation') ){

					if( $(window).scrollTop() + page_offset > t.sticky_nav.offset().top ){
						if( !t.sticky_nav.hasClass('bigslam-without-placeholder') ){
							placeholder.height(t.sticky_nav.outerHeight());
						}
						placeholder.insertAfter(t.sticky_nav);
						$('body').append(t.sticky_nav);
						t.sticky_nav.addClass('bigslam-fixed-navigation');

						var logo_padding = (t.logo_height - t.sticky_nav_logo.height()) / 2;
						if( logo_padding > 0 ){
							t.sticky_nav_logo.css({'padding-top': logo_padding, 'padding-bottom': logo_padding});
						}else{
							t.sticky_nav_logo.css({'height': t.sticky_nav_logo.height(), 'width': 'auto'}); // set for css animation
							t.sticky_nav.addClass('bigslam-animate-logo-height');
						}
						
						setTimeout(function(){ t.sticky_nav.addClass('bigslam-animate-fixed-navigation'); }, 10);	
						setTimeout(function(){ 
							t.sticky_nav.css('height', ''); 
							$(window).trigger('bigslam-navigation-slider-bar-animate');
						}, 200);
					}
				}else{

					if( $(window).scrollTop() + page_offset <= placeholder.offset().top ){
						if( !t.sticky_nav.hasClass('bigslam-without-placeholder') ){
							t.sticky_nav.height(placeholder.height());
						}
						t.sticky_nav.insertBefore(placeholder);
						t.sticky_nav.removeClass('bigslam-fixed-navigation');
						placeholder.remove();

						t.sticky_nav_logo.css({'padding-top': '', 'padding-bottom': ''});
						setTimeout(function(){ t.sticky_nav.removeClass('bigslam-animate-fixed-navigation bigslam-animate-logo-height'); }, 10);	
						setTimeout(function(){ 
							t.sticky_nav.css('height', ''); 
							t.sticky_nav_logo.css({'height': '', 'width': ''});
							$(window).trigger('bigslam-navigation-slider-bar-animate');
						}, 200);
					}
				}
			});

		}, // style_fixed

		style_slide: function(){

			var t = this;
			var placeholder = $('<div class="bigslam-sticky-menu-placeholder" ></div>');

			$(window).on('scroll bigslam-set-sticky-navigation', function(){

				if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ){ return; }

				var page_offset = parseInt($('html').css('margin-top'));

				if( !t.sticky_nav.hasClass('bigslam-fixed-navigation') ){

					if( $(window).scrollTop() + page_offset > t.sticky_nav.offset().top + t.sticky_nav.outerHeight() + 200 ){
						
						var logo_padding = (t.logo_height - t.sticky_nav_logo.height()) / 2;

						if( !t.sticky_nav.hasClass('bigslam-without-placeholder') ){
							placeholder.height(t.sticky_nav.outerHeight());
						}
						placeholder.insertAfter(t.sticky_nav);
						t.sticky_nav.css('display', 'none');

						if( logo_padding > 0 ){
							t.sticky_nav_logo.css({'padding-top': logo_padding, 'padding-bottom': logo_padding});
						}

						$('body').append(t.sticky_nav);
						t.sticky_nav.addClass('bigslam-fixed-navigation bigslam-animate-fixed-navigation');
						t.sticky_nav.slideDown(200);
						$(window).trigger('bigslam-navigation-slider-bar-animate');
					}
				}else{

					if( $(window).scrollTop() + page_offset <= placeholder.offset().top + placeholder.height() + 200 ){
						var clone = t.sticky_nav.clone();
						clone.insertAfter(t.sticky_nav);
						clone.slideUp(200, function(){ $(this).remove(); });

						t.sticky_nav.insertBefore(placeholder);
						t.sticky_nav_logo.css({'padding-top': '', 'padding-bottom': ''});
						placeholder.remove();
						t.sticky_nav.removeClass('bigslam-fixed-navigation bigslam-animate-fixed-navigation');
						t.sticky_nav.css('display', 'block');

						$(window).trigger('bigslam-navigation-slider-bar-animate');
					}
				}
			});

		}, // style_slide		

		style_mobile_slide: function(){

			var t = this;
			var placeholder = $('<div class="bigslam-sticky-mobile-placeholder" ></div>');

			$(window).on('scroll bigslam-set-sticky-mobile-navigation', function(){

				if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' || bigslam_display == 'tablet' ){

					var page_offset = parseInt($('html').css('margin-top'));

					if( !t.mobile_menu.hasClass('bigslam-fixed-navigation') ){
						if( $(window).scrollTop() + page_offset > t.mobile_menu.offset().top + t.mobile_menu.outerHeight() + 200 ){
							placeholder.height(t.mobile_menu.outerHeight()).insertAfter(t.mobile_menu);
							$('body').append(t.mobile_menu);
							t.mobile_menu.addClass('bigslam-fixed-navigation');
							t.mobile_menu.css('display', 'none').slideDown(200);
						}
					}else{
						if( $(window).scrollTop() + page_offset <= placeholder.offset().top + placeholder.height() + 200 ){
							var clone = t.mobile_menu.clone();
							clone.insertAfter(t.mobile_menu);
							clone.slideUp(200, function(){ $(this).remove(); });

							t.mobile_menu.insertBefore(placeholder);
							placeholder.remove();
							t.mobile_menu.removeClass('bigslam-fixed-navigation');
							t.mobile_menu.css('display', 'block');
						}
					}
				}

			});

		}, // style_slide

	};

	var bigslam_font_resize = function(){

		this.heading_font = $('h1, h2, h3, h4, h5, h6');

		this.init();

	}
	bigslam_font_resize.prototype = {

		init: function(){

			var t = this;

			t.resize();
			$(window).on('resize', bigslam_throttling(function(){
				t.resize();
			}, 100));

		},

		resize: function(){
			
			var t = this;

			if( bigslam_display == 'mobile-landscape' || bigslam_display == 'mobile-portrait' ){

				t.heading_font.each(function(){
					if( parseInt($(this).css('font-size')) > 40 ){
						if( !$(this).attr('data-orig-font') ){
							$(this).attr('data-orig-font', $(this).css('font-size')); 
						}

						$(this).css('font-size', '40px');
					}
				});

			// return font to normal
			}else{

				t.heading_font.filter('[data-orig-font]').each(function(){
					$(this).css('font-size', $(this).attr('data-orig-font'));
				});

			}
		}

	};


	////////////////////////////////
	// starting running the script
	////////////////////////////////
	$(document).ready(function(){
	
		// resize font on mobile
		new bigslam_font_resize();

		// init main navigation menu
		$('#bigslam-main-menu, #bigslam-right-menu, #bigslam-mobile-menu').each(function(){
			if( $(this).hasClass('bigslam-overlay-menu') ){
				new bigslam_overlay_menu( $(this) );
			}else if( $(this).hasClass('bigslam-mm-menu-wrap') ){
				$(this).bigslam_mobile_menu();
			}else{
				new bigslam_sf_menu( $(this) );
			}
		});

		$('#bigslam-top-search, #bigslam-mobile-top-search').each(function(){

			var search_wrap = $(this).siblings('.bigslam-top-search-wrap');
			search_wrap.appendTo('body');

			// bind click button
			$(this).click(function(){
				search_wrap.fadeIn(200, function(){
					$(this).addClass('bigslam-active');
				});
			});

			// bind close button
			search_wrap.find('.bigslam-top-search-close').click(function(){
				search_wrap.fadeOut(200, function(){
					$(this).addClass('bigslam-active');
				});
			});

			// bind search button
			search_wrap.find('.search-submit').click(function(){
				if( search_wrap.find('.search-field').val().length == 0 ){
					return false;
				}
			});
		});

		$('#bigslam-main-menu-cart, #bigslam-mobile-menu-cart').each(function(){
			
			$(this).hover(function(){
				$(this).addClass('bigslam-active bigslam-animating');
			}, function(){
				var menu_cart = $(this);
				menu_cart.removeClass('bigslam-active');
				setTimeout(function(){
					menu_cart.removeClass('bigslam-animating');
				}, 400)
			});
		});

		// additional space for header transparent
		$('.bigslam-header-boxed-wrap, .bigslam-header-background-transparent, .bigslam-navigation-bar-wrap.bigslam-style-transparent').each(function(){
			var header_transparent = $(this);
			var header_transparent_sub = $('.bigslam-header-transparent-substitute');

			header_transparent_sub.height(header_transparent.outerHeight());
			$(window).on('load resize', function(){
				header_transparent_sub.height(header_transparent.outerHeight());
			});
		});

		// full screen for 404 not found
		$('body.error404, body.search-no-results').each(function(){

			var wrap = $(this).find('#bigslam-full-no-header-wrap');
			var body_wrap_offset = parseInt($(this).children('.bigslam-body-outer-wrapper').children('.bigslam-body-wrapper').css('margin-bottom'));
			
			var padding = ($(window).height() - wrap.offset().top - wrap.outerHeight() - body_wrap_offset) / 2;
			if( padding > 0 ){
				wrap.css({ 'padding-top': padding, 'padding-bottom': padding });
			}

			$(window).on('load resize', function(){
				wrap.css({ 'padding-top': 0, 'padding-bottom': 0 });
				padding = ($(window).height() - wrap.offset().top - wrap.outerHeight() - body_wrap_offset) / 2;
				if( padding > 0 ){
					wrap.css({ 'padding-top': padding, 'padding-bottom': padding });
				}
			});
		});

		// back to top button
		var back_to_top = $('#bigslam-footer-back-to-top-button');
		if( back_to_top.length ){ 
			$(window).on('scroll', function(){
				if( $(window).scrollTop() > 300 ){
					back_to_top.addClass('bigslam-scrolled');
				}else{
					back_to_top.removeClass('bigslam-scrolled');
				}
			});
		}

		// page preload
		$('body').children('#bigslam-page-preload').each(function(){
			var page_preload = $(this);
			var animation_time = parseInt(page_preload.attr('data-animation-time'));
			
			$('a[href]').not('[href^="#"], [target="_blank"], .gdlr-core-js, .strip, .sf-with-ul, .remove, .ajax_add_to_cart').click(function(e){
				if( e.which != 1 || $(this).hasClass('infinite-no-preload') || e.ctrlKey ) return;
				
				if( window.location.href != this.href ){
					page_preload.addClass('bigslam-out').fadeIn(animation_time);
				}
			});
			
			$(window).load(function(){
				page_preload.fadeOut(animation_time);
			});
		});
		
	});

	// fix back button for preload
	$(window).bind('pageshow', function(event) {
	    if( event.originalEvent.persisted ){
	        $('body').children('#bigslam-page-preload').each(function(){
				$(this).fadeOut(400);
			});
	    }
	});
	$(window).on('beforeunload', function(){
		$('body').children('#bigslam-page-preload').each(function(){
			$(this).fadeOut(400);
		});
	});

	$(window).load(function(){

		// fixed footer
		$('#bigslam-fixed-footer').each(function(){
			var fixed_footer = $(this);
			var placeholder = $('<div class="bigslam-fixed-footer-placeholder" ></div>');

			placeholder.insertBefore(fixed_footer);
			placeholder.height(fixed_footer.outerHeight());
			$('body').css('min-height', $(window).height() - parseInt($('html').css('margin-top'))); // for safari
			$(window).resize(function(){ 
				placeholder.height(fixed_footer.outerHeight()); 
				$('body').css('min-height', $(window).height() - parseInt($('html').css('margin-top')));
			});
		});

		// side navigation bar
		new bigslam_header_side_nav( $('#bigslam-header-side-nav') );

		// sticky navigation
		new bigslam_sticky_navigation();

		// anchoring
		new bigslam_anchor();

	});

})(jQuery);

/***********/
/* Plugins */
/***********/

/*
 * jQuery mmenu v5.6.1
 */
!function(e){function t(){e[n].glbl||(r={$wndw:e(window),$docu:e(document),$html:e("html"),$body:e("body")},i={},a={},o={},e.each([i,a,o],function(e,t){t.add=function(e){e=e.split(" ");for(var n=0,s=e.length;s>n;n++)t[e[n]]=t.mm(e[n])}}),i.mm=function(e){return"mm-"+e},i.add("wrapper menu panels panel nopanel current highest opened subopened navbar hasnavbar title btn prev next listview nolistview inset vertical selected divider spacer hidden fullsubopen"),i.umm=function(e){return"mm-"==e.slice(0,3)&&(e=e.slice(3)),e},a.mm=function(e){return"mm-"+e},a.add("parent sub"),o.mm=function(e){return e+".mm"},o.add("transitionend webkitTransitionEnd click scroll keydown mousedown mouseup touchstart touchmove touchend orientationchange"),e[n]._c=i,e[n]._d=a,e[n]._e=o,e[n].glbl=r)}var n="mmenu",s="5.6.1";if(!(e[n]&&e[n].version>s)){e[n]=function(e,t,n){this.$menu=e,this._api=["bind","init","update","setSelected","getInstance","openPanel","closePanel","closeAllPanels"],this.opts=t,this.conf=n,this.vars={},this.cbck={},"function"==typeof this.___deprecated&&this.___deprecated(),this._initMenu(),this._initAnchors();var s=this.$pnls.children();return this._initAddons(),this.init(s),"function"==typeof this.___debug&&this.___debug(),this},e[n].version=s,e[n].addons={},e[n].uniqueId=0,e[n].defaults={extensions:[],navbar:{add:!0,title:"Menu",titleLink:"panel"},onClick:{setSelected:!0},slidingSubmenus:!0},e[n].configuration={classNames:{divider:"Divider",inset:"Inset",panel:"Panel",selected:"Selected",spacer:"Spacer",vertical:"Vertical"},clone:!1,openingInterval:25,panelNodetype:"ul, ol, div",transitionDuration:400},e[n].prototype={init:function(e){e=e.not("."+i.nopanel),e=this._initPanels(e),this.trigger("init",e),this.trigger("update")},update:function(){this.trigger("update")},setSelected:function(e){this.$menu.find("."+i.listview).children().removeClass(i.selected),e.addClass(i.selected),this.trigger("setSelected",e)},openPanel:function(t){var s=t.parent(),a=this;if(s.hasClass(i.vertical)){var o=s.parents("."+i.subopened);if(o.length)return void this.openPanel(o.first());s.addClass(i.opened),this.trigger("openPanel",t),this.trigger("openingPanel",t),this.trigger("openedPanel",t)}else{if(t.hasClass(i.current))return;var r=this.$pnls.children("."+i.panel),l=r.filter("."+i.current);r.removeClass(i.highest).removeClass(i.current).not(t).not(l).not("."+i.vertical).addClass(i.hidden),e[n].support.csstransitions||l.addClass(i.hidden),t.hasClass(i.opened)?t.nextAll("."+i.opened).addClass(i.highest).removeClass(i.opened).removeClass(i.subopened):(t.addClass(i.highest),l.addClass(i.subopened)),t.removeClass(i.hidden).addClass(i.current),a.trigger("openPanel",t),setTimeout(function(){t.removeClass(i.subopened).addClass(i.opened),a.trigger("openingPanel",t),a.__transitionend(t,function(){a.trigger("openedPanel",t)},a.conf.transitionDuration)},this.conf.openingInterval)}},closePanel:function(e){var t=e.parent();t.hasClass(i.vertical)&&(t.removeClass(i.opened),this.trigger("closePanel",e),this.trigger("closingPanel",e),this.trigger("closedPanel",e))},closeAllPanels:function(){this.$menu.find("."+i.listview).children().removeClass(i.selected).filter("."+i.vertical).removeClass(i.opened);var e=this.$pnls.children("."+i.panel),t=e.first();this.$pnls.children("."+i.panel).not(t).removeClass(i.subopened).removeClass(i.opened).removeClass(i.current).removeClass(i.highest).addClass(i.hidden),this.openPanel(t)},togglePanel:function(e){var t=e.parent();t.hasClass(i.vertical)&&this[t.hasClass(i.opened)?"closePanel":"openPanel"](e)},getInstance:function(){return this},bind:function(e,t){this.cbck[e]=this.cbck[e]||[],this.cbck[e].push(t)},trigger:function(){var e=this,t=Array.prototype.slice.call(arguments),n=t.shift();if(this.cbck[n])for(var s=0,i=this.cbck[n].length;i>s;s++)this.cbck[n][s].apply(e,t)},_initMenu:function(){this.$menu.attr("id",this.$menu.attr("id")||this.__getUniqueId()),this.conf.clone&&(this.$menu=this.$menu.clone(!0),this.$menu.add(this.$menu.find("[id]")).filter("[id]").each(function(){e(this).attr("id",i.mm(e(this).attr("id")))})),this.$menu.contents().each(function(){3==e(this)[0].nodeType&&e(this).remove()}),this.$pnls=e('<div class="'+i.panels+'" />').append(this.$menu.children(this.conf.panelNodetype)).prependTo(this.$menu),this.$menu.parent().addClass(i.wrapper);var t=[i.menu];this.opts.slidingSubmenus||t.push(i.vertical),this.opts.extensions=this.opts.extensions.length?"mm-"+this.opts.extensions.join(" mm-"):"",this.opts.extensions&&t.push(this.opts.extensions),this.$menu.addClass(t.join(" "))},_initPanels:function(t){var n=this,s=this.__findAddBack(t,"ul, ol");this.__refactorClass(s,this.conf.classNames.inset,"inset").addClass(i.nolistview+" "+i.nopanel),s.not("."+i.nolistview).addClass(i.listview);var o=this.__findAddBack(t,"."+i.listview).children();this.__refactorClass(o,this.conf.classNames.selected,"selected"),this.__refactorClass(o,this.conf.classNames.divider,"divider"),this.__refactorClass(o,this.conf.classNames.spacer,"spacer"),this.__refactorClass(this.__findAddBack(t,"."+this.conf.classNames.panel),this.conf.classNames.panel,"panel");var r=e(),l=t.add(t.find("."+i.panel)).add(this.__findAddBack(t,"."+i.listview).children().children(this.conf.panelNodetype)).not("."+i.nopanel);this.__refactorClass(l,this.conf.classNames.vertical,"vertical"),this.opts.slidingSubmenus||l.addClass(i.vertical),l.each(function(){var t=e(this),s=t;t.is("ul, ol")?(t.wrap('<div class="'+i.panel+'" />'),s=t.parent()):s.addClass(i.panel);var a=t.attr("id");t.removeAttr("id"),s.attr("id",a||n.__getUniqueId()),t.hasClass(i.vertical)&&(t.removeClass(n.conf.classNames.vertical),s.add(s.parent()).addClass(i.vertical)),r=r.add(s)});var d=e("."+i.panel,this.$menu);r.each(function(t){var s,o,r=e(this),l=r.parent(),d=l.children("a, span").first();if(l.is("."+i.panels)||(l.data(a.sub,r),r.data(a.parent,l)),l.children("."+i.next).length||l.parent().is("."+i.listview)&&(s=r.attr("id"),o=e('<a class="'+i.next+'" href="#'+s+'" data-target="#'+s+'" />').insertBefore(d),d.is("span")&&o.addClass(i.fullsubopen)),!r.children("."+i.navbar).length&&!l.hasClass(i.vertical)){l.parent().is("."+i.listview)?l=l.closest("."+i.panel):(d=l.closest("."+i.panel).find('a[href="#'+r.attr("id")+'"]').first(),l=d.closest("."+i.panel));var c=e('<div class="'+i.navbar+'" />');if(l.length){switch(s=l.attr("id"),n.opts.navbar.titleLink){case"anchor":_url=d.attr("href");break;case"panel":case"parent":_url="#"+s;break;default:_url=!1}c.append('<a class="'+i.btn+" "+i.prev+'" href="#'+s+'" data-target="#'+s+'" />').append(e('<a class="'+i.title+'"'+(_url?' href="'+_url+'"':"")+" />").text(d.text())).prependTo(r),n.opts.navbar.add&&r.addClass(i.hasnavbar)}else n.opts.navbar.title&&(c.append('<a class="'+i.title+'">'+n.opts.navbar.title+"</a>").prependTo(r),n.opts.navbar.add&&r.addClass(i.hasnavbar))}});var c=this.__findAddBack(t,"."+i.listview).children("."+i.selected).removeClass(i.selected).last().addClass(i.selected);c.add(c.parentsUntil("."+i.menu,"li")).filter("."+i.vertical).addClass(i.opened).end().each(function(){e(this).parentsUntil("."+i.menu,"."+i.panel).not("."+i.vertical).first().addClass(i.opened).parentsUntil("."+i.menu,"."+i.panel).not("."+i.vertical).first().addClass(i.opened).addClass(i.subopened)}),c.children("."+i.panel).not("."+i.vertical).addClass(i.opened).parentsUntil("."+i.menu,"."+i.panel).not("."+i.vertical).first().addClass(i.opened).addClass(i.subopened);var p=d.filter("."+i.opened);return p.length||(p=r.first()),p.addClass(i.opened).last().addClass(i.current),r.not("."+i.vertical).not(p.last()).addClass(i.hidden).end().filter(function(){return!e(this).parent().hasClass(i.panels)}).appendTo(this.$pnls),r},_initAnchors:function(){var t=this;r.$body.on(o.click+"-oncanvas","a[href]",function(s){var a=e(this),o=!1,r=t.$menu.find(a).length;for(var l in e[n].addons)if(e[n].addons[l].clickAnchor.call(t,a,r)){o=!0;break}var d=a.attr("href");if(!o&&r&&d.length>1&&"#"==d.slice(0,1))try{var c=e(d,t.$menu);c.is("."+i.panel)&&(o=!0,t[a.parent().hasClass(i.vertical)?"togglePanel":"openPanel"](c))}catch(p){}if(o&&s.preventDefault(),!o&&r&&a.is("."+i.listview+" > li > a")&&!a.is('[rel="external"]')&&!a.is('[target="_blank"]')){t.__valueOrFn(t.opts.onClick.setSelected,a)&&t.setSelected(e(s.target).parent());var h=t.__valueOrFn(t.opts.onClick.preventDefault,a,"#"==d.slice(0,1));h&&s.preventDefault(),t.__valueOrFn(t.opts.onClick.close,a,h)&&t.close()}})},_initAddons:function(){var t;for(t in e[n].addons)e[n].addons[t].add.call(this),e[n].addons[t].add=function(){};for(t in e[n].addons)e[n].addons[t].setup.call(this)},_getOriginalMenuId:function(){var e=this.$menu.attr("id");return e&&e.length&&this.conf.clone&&(e=i.umm(e)),e},__api:function(){var t=this,n={};return e.each(this._api,function(e){var s=this;n[s]=function(){var e=t[s].apply(t,arguments);return"undefined"==typeof e?n:e}}),n},__valueOrFn:function(e,t,n){return"function"==typeof e?e.call(t[0]):"undefined"==typeof e&&"undefined"!=typeof n?n:e},__refactorClass:function(e,t,n){return e.filter("."+t).removeClass(t).addClass(i[n])},__findAddBack:function(e,t){return e.find(t).add(e.filter(t))},__filterListItems:function(e){return e.not("."+i.divider).not("."+i.hidden)},__transitionend:function(e,t,n){var s=!1,i=function(){s||t.call(e[0]),s=!0};e.one(o.transitionend,i),e.one(o.webkitTransitionEnd,i),setTimeout(i,1.1*n)},__getUniqueId:function(){return i.mm(e[n].uniqueId++)}},e.fn[n]=function(s,i){return t(),s=e.extend(!0,{},e[n].defaults,s),i=e.extend(!0,{},e[n].configuration,i),this.each(function(){var t=e(this);if(!t.data(n)){var a=new e[n](t,s,i);a.$menu.data(n,a.__api())}})},e[n].support={touch:"ontouchstart"in window||navigator.msMaxTouchPoints||!1,csstransitions:function(){if("undefined"!=typeof Modernizr&&"undefined"!=typeof Modernizr.csstransitions)return Modernizr.csstransitions;var e=document.body||document.documentElement,t=e.style,n="transition";if("string"==typeof t[n])return!0;var s=["Moz","webkit","Webkit","Khtml","O","ms"];n=n.charAt(0).toUpperCase()+n.substr(1);for(var i=0;i<s.length;i++)if("string"==typeof t[s[i]+n])return!0;return!1}()};var i,a,o,r}}(jQuery),/*	
 * jQuery mmenu offCanvas addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="offCanvas";e[t].addons[n]={setup:function(){if(this.opts[n]){var i=this.opts[n],a=this.conf[n];o=e[t].glbl,this._api=e.merge(this._api,["open","close","setPage"]),("top"==i.position||"bottom"==i.position)&&(i.zposition="front"),"string"!=typeof a.pageSelector&&(a.pageSelector="> "+a.pageNodetype),o.$allMenus=(o.$allMenus||e()).add(this.$menu),this.vars.opened=!1;var r=[s.offcanvas];"left"!=i.position&&r.push(s.mm(i.position)),"back"!=i.zposition&&r.push(s.mm(i.zposition)),this.$menu.addClass(r.join(" ")).parent().removeClass(s.wrapper),this.setPage(o.$page),this._initBlocker(),this["_initWindow_"+n](),this.$menu[a.menuInjectMethod+"To"](a.menuWrapperSelector);var l=window.location.hash;if(l){var d=this._getOriginalMenuId();d&&d==l.slice(1)&&this.open()}}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("offcanvas slideout blocking modal background opening blocker page"),i.add("style"),a.add("resize")},clickAnchor:function(e,t){if(!this.opts[n])return!1;var s=this._getOriginalMenuId();if(s&&e.is('[href="#'+s+'"]'))return this.open(),!0;if(o.$page)return s=o.$page.first().attr("id"),s&&e.is('[href="#'+s+'"]')?(this.close(),!0):!1}},e[t].defaults[n]={position:"left",zposition:"back",blockUI:!0,moveBackground:!0},e[t].configuration[n]={pageNodetype:"div",pageSelector:null,noPageSelector:[],wrapPageIfNeeded:!0,menuWrapperSelector:"body",menuInjectMethod:"prepend"},e[t].prototype.open=function(){if(!this.vars.opened){var e=this;this._openSetup(),setTimeout(function(){e._openFinish()},this.conf.openingInterval),this.trigger("open")}},e[t].prototype._openSetup=function(){var t=this,r=this.opts[n];this.closeAllOthers(),o.$page.each(function(){e(this).data(i.style,e(this).attr("style")||"")}),o.$wndw.trigger(a.resize+"-"+n,[!0]);var l=[s.opened];r.blockUI&&l.push(s.blocking),"modal"==r.blockUI&&l.push(s.modal),r.moveBackground&&l.push(s.background),"left"!=r.position&&l.push(s.mm(this.opts[n].position)),"back"!=r.zposition&&l.push(s.mm(this.opts[n].zposition)),this.opts.extensions&&l.push(this.opts.extensions),o.$html.addClass(l.join(" ")),setTimeout(function(){t.vars.opened=!0},this.conf.openingInterval),this.$menu.addClass(s.current+" "+s.opened)},e[t].prototype._openFinish=function(){var e=this;this.__transitionend(o.$page.first(),function(){e.trigger("opened")},this.conf.transitionDuration),o.$html.addClass(s.opening),this.trigger("opening")},e[t].prototype.close=function(){if(this.vars.opened){var t=this;this.__transitionend(o.$page.first(),function(){t.$menu.removeClass(s.current).removeClass(s.opened),o.$html.removeClass(s.opened).removeClass(s.blocking).removeClass(s.modal).removeClass(s.background).removeClass(s.mm(t.opts[n].position)).removeClass(s.mm(t.opts[n].zposition)),t.opts.extensions&&o.$html.removeClass(t.opts.extensions),o.$page.each(function(){e(this).attr("style",e(this).data(i.style))}),t.vars.opened=!1,t.trigger("closed")},this.conf.transitionDuration),o.$html.removeClass(s.opening),this.trigger("close"),this.trigger("closing")}},e[t].prototype.closeAllOthers=function(){o.$allMenus.not(this.$menu).each(function(){var n=e(this).data(t);n&&n.close&&n.close()})},e[t].prototype.setPage=function(t){var i=this,a=this.conf[n];t&&t.length||(t=o.$body.find(a.pageSelector),a.noPageSelector.length&&(t=t.not(a.noPageSelector.join(", "))),t.length>1&&a.wrapPageIfNeeded&&(t=t.wrapAll("<"+this.conf[n].pageNodetype+" />").parent())),t.each(function(){e(this).attr("id",e(this).attr("id")||i.__getUniqueId())}),t.addClass(s.page+" "+s.slideout),o.$page=t,this.trigger("setPage",t)},e[t].prototype["_initWindow_"+n]=function(){o.$wndw.off(a.keydown+"-"+n).on(a.keydown+"-"+n,function(e){return o.$html.hasClass(s.opened)&&9==e.keyCode?(e.preventDefault(),!1):void 0});var e=0;o.$wndw.off(a.resize+"-"+n).on(a.resize+"-"+n,function(t,n){if(1==o.$page.length&&(n||o.$html.hasClass(s.opened))){var i=o.$wndw.height();(n||i!=e)&&(e=i,o.$page.css("minHeight",i))}})},e[t].prototype._initBlocker=function(){var t=this;this.opts[n].blockUI&&(o.$blck||(o.$blck=e('<div id="'+s.blocker+'" class="'+s.slideout+'" />')),o.$blck.appendTo(o.$body).off(a.touchstart+"-"+n+" "+a.touchmove+"-"+n).on(a.touchstart+"-"+n+" "+a.touchmove+"-"+n,function(e){e.preventDefault(),e.stopPropagation(),o.$blck.trigger(a.mousedown+"-"+n)}).off(a.mousedown+"-"+n).on(a.mousedown+"-"+n,function(e){e.preventDefault(),o.$html.hasClass(s.modal)||(t.closeAllOthers(),t.close())}))};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu scrollBugFix addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="scrollBugFix";e[t].addons[n]={setup:function(){var i=this,r=this.opts[n];this.conf[n];if(o=e[t].glbl,e[t].support.touch&&this.opts.offCanvas&&this.opts.offCanvas.modal&&("boolean"==typeof r&&(r={fix:r}),"object"!=typeof r&&(r={}),r=this.opts[n]=e.extend(!0,{},e[t].defaults[n],r),r.fix)){var l=this.$menu.attr("id"),d=!1;this.bind("opening",function(){this.$pnls.children("."+s.current).scrollTop(0)}),o.$docu.on(a.touchmove,function(e){i.vars.opened&&e.preventDefault()}),o.$body.on(a.touchstart,"#"+l+"> ."+s.panels+"> ."+s.current,function(e){i.vars.opened&&(d||(d=!0,0===e.currentTarget.scrollTop?e.currentTarget.scrollTop=1:e.currentTarget.scrollHeight===e.currentTarget.scrollTop+e.currentTarget.offsetHeight&&(e.currentTarget.scrollTop-=1),d=!1))}).on(a.touchmove,"#"+l+"> ."+s.panels+"> ."+s.current,function(t){i.vars.opened&&e(this)[0].scrollHeight>e(this).innerHeight()&&t.stopPropagation()}),o.$wndw.on(a.orientationchange,function(){i.$pnls.children("."+s.current).scrollTop(0).css({"-webkit-overflow-scrolling":"auto"}).css({"-webkit-overflow-scrolling":"touch"})})}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e},clickAnchor:function(e,t){}},e[t].defaults[n]={fix:!0};var s,i,a,o}(jQuery);
/*
 * jQuery Superfish Menu Plugin
 * Copyright (c) 2013 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *	http://www.opensource.org/licenses/mit-license.php
 *	http://www.gnu.org/licenses/gpl.html
 */
!function(e,s){"use strict";var o=function(){var o={bcClass:"sf-breadcrumb",menuClass:"sf-js-enabled",anchorClass:"sf-with-ul",menuArrowClass:"sf-arrows"},t=function(){var s=/^(?![\w\W]*Windows Phone)[\w\W]*(iPhone|iPad|iPod)/i.test(navigator.userAgent);return s&&e("html").css("cursor","pointer").on("click",e.noop),s}(),n=function(){var e=document.documentElement.style;return"behavior"in e&&"fill"in e&&/iemobile/i.test(navigator.userAgent)}(),i=function(){return!!s.PointerEvent}(),r=function(e,s){var t=o.menuClass;s.cssArrows&&(t+=" "+o.menuArrowClass),e.toggleClass(t)},a=function(s,t){return s.find("li."+t.pathClass).slice(0,t.pathLevels).addClass(t.hoverClass+" "+o.bcClass).filter(function(){return e(this).children(t.popUpSelector).hide().show().length}).removeClass(t.pathClass)},l=function(e){e.children("a").toggleClass(o.anchorClass)},h=function(e){var s=e.css("ms-touch-action"),o=e.css("touch-action");o=o||s,o="pan-y"===o?"auto":"pan-y",e.css({"ms-touch-action":o,"touch-action":o})},u=function(s,o){var r="li:has("+o.popUpSelector+")";e.fn.hoverIntent&&!o.disableHI?s.hoverIntent(c,f,r):s.on("mouseenter.superfish",r,c).on("mouseleave.superfish",r,f);var a="MSPointerDown.superfish";i&&(a="pointerdown.superfish"),t||(a+=" touchend.superfish"),n&&(a+=" mousedown.superfish"),s.on("focusin.superfish","li",c).on("focusout.superfish","li",f).on(a,"a",o,p)},p=function(s){var o=e(this),t=m(o),n=o.siblings(s.data.popUpSelector);return t.onHandleTouch.call(n)===!1?this:void(n.length>0&&n.is(":hidden")&&(o.one("click.superfish",!1),"MSPointerDown"===s.type||"pointerdown"===s.type?o.trigger("focus"):e.proxy(c,o.parent("li"))()))},c=function(){var s=e(this),o=m(s);clearTimeout(o.sfTimer),s.siblings().superfish("hide").end().superfish("show")},f=function(){var s=e(this),o=m(s);t?e.proxy(d,s,o)():(clearTimeout(o.sfTimer),o.sfTimer=setTimeout(e.proxy(d,s,o),o.delay))},d=function(s){s.retainPath=e.inArray(this[0],s.$path)>-1,this.superfish("hide"),this.parents("."+s.hoverClass).length||(s.onIdle.call(v(this)),s.$path.length&&e.proxy(c,s.$path)())},v=function(e){return e.closest("."+o.menuClass)},m=function(e){return v(e).data("sf-options")};return{hide:function(s){if(this.length){var o=this,t=m(o);if(!t)return this;var n=t.retainPath===!0?t.$path:"",i=o.find("li."+t.hoverClass).add(this).not(n).removeClass(t.hoverClass).children(t.popUpSelector),r=t.speedOut;if(s&&(i.show(),r=0),t.retainPath=!1,t.onBeforeHide.call(i)===!1)return this;i.stop(!0,!0).animate(t.animationOut,r,"easeOutQuad",function(){var s=e(this);t.onHide.call(s)})}return this},show:function(){var e=m(this);if(!e)return this;var s=this.addClass(e.hoverClass),o=s.children(e.popUpSelector);return e.onBeforeShow.call(o)===!1?this:(o.stop(!0,!0).animate(e.animation,e.speed,"easeOutQuad",function(){e.onShow.call(o)}),this)},destroy:function(){return this.each(function(){var s,t=e(this),n=t.data("sf-options");return n?(s=t.find(n.popUpSelector).parent("li"),clearTimeout(n.sfTimer),r(t,n),l(s),h(t),t.off(".superfish").off(".hoverIntent"),s.children(n.popUpSelector).attr("style",function(e,s){return s.replace(/display[^;]+;?/g,"")}),n.$path.removeClass(n.hoverClass+" "+o.bcClass).addClass(n.pathClass),t.find("."+n.hoverClass).removeClass(n.hoverClass),n.onDestroy.call(t),void t.removeData("sf-options")):!1})},init:function(s){return this.each(function(){var t=e(this);if(t.data("sf-options"))return!1;var n=e.extend({},e.fn.superfish.defaults,s),i=t.find(n.popUpSelector).parent("li");n.$path=a(t,n),t.data("sf-options",n),r(t,n),l(i),h(t),u(t,n),i.not("."+o.bcClass).superfish("hide",!0),n.onInit.call(this)})}}}();e.fn.superfish=function(s,t){return o[s]?o[s].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof s&&s?e.error("Method "+s+" does not exist on jQuery.fn.superfish"):o.init.apply(this,arguments)},e.fn.superfish.defaults={popUpSelector:"ul,.sf-mega",hoverClass:"sfHover",pathClass:"overrideThisToUse",pathLevels:1,delay:800,animation:{opacity:"show"},animationOut:{opacity:"hide"},speed:"normal",speedOut:"fast",cssArrows:!0,disableHI:!1,onInit:e.noop,onBeforeShow:e.noop,onShow:e.noop,onBeforeHide:e.noop,onHide:e.noop,onIdle:e.noop,onDestroy:e.noop,onHandleTouch:e.noop}}(jQuery,window);