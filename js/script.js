$(function() {

    "use strict";
	
    var wind = $(window);
	
	// Navbar Scrolling background
    wind.on("scroll",function () {
        var bodyScroll = wind.scrollTop(),
            Navbar = $(".navbar");

        if(bodyScroll > 0){
            Navbar.addClass("fixed");
        }else{
            Navbar.removeClass("fixed");
        }
    });

	// Change The Logo When Scrolling
    wind.on("scroll",function () {
        var bodyScroll = wind.scrollTop(),
            logo = $(".navbar-dark .navbar-brand > img");

        if(bodyScroll > 0){
            logo.attr('src', 'img/404light.png');
        }else{
        	logo.attr('src', 'img/404dark.png');
        }
    });
	
	//Solution Carousel
	var solution = $('.solution .owl-carousel');
	solution.owlCarousel({
		loop: false,
		navText: ['', ''],
		margin: 20,
		nav: false,
		dots: false,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 1

			},
			992: {
				items: 3
			}
		}
	});

	//Solution Carousel Next/Prev Custom Button
	$('.solution .navigation.next').on('click', function () {
		solution.trigger('next.owl.carousel');
	});	 
	$('.solution .navigation.prev').on('click', function () {
		solution.trigger('prev.owl.carousel');
	});
	
	//Testimonials Carousel Next/Prev Button
	var testimonials = $('.testimonials .owl-carousel');
	testimonials.owlCarousel({
		loop: true,
		navText: ['', ''],
		margin: 20,
		nav: false,
		dots: false,
		responsive: {
			0: {
				items: 1
			},
			600: {
				items: 1

			},
			992: {
				items: 2
			}
		}
	});

	//Testimonials Carousel Next/Prev Custom Button
	$('.testimonials .navigation.next').on('click', function () {
		testimonials.trigger('next.owl.carousel');
	});	 
	$('.testimonials .navigation.prev').on('click', function () {
		testimonials.trigger('prev.owl.carousel');
	});
	
	//Sponsors Carousel
	var sponsors = $('.sponsors .owl-carousel');
	sponsors.owlCarousel({
		loop: true,
		navText: ['', ''],
		margin: 40,
		nav: false,
		dots: false,
		autoplay: 3000,
		responsive: {
			0:{
				items:1
			},
			480:{
				items:2
			},
			600:{
				items:3
			},
			800:{
				items:4
				},
			1024:{
				items:5
			}
		}
	});

	//Responsive Navbar
	$('.navbar .navbar-nav .dropdown a').on('click', function () {
		if($(window).width() < 992){
			$(this).next('ul').slideToggle();
		}
	});
	

	//MapBox Config
	mapboxgl.accessToken = 'pk.eyJ1IjoibWVoZGkxMTEyMjIiLCJhIjoiY2pyY2R3eTM5MWJoMzN5cDg2d2FxcnUyYSJ9.a3eNnrTsEsq-o8iDIxiWNg';
	if (!mapboxgl.supported()) {
		alert('Your browser does not support Mapbox GL');
	}else{
		const map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/dark-v9',
			center: [-79.385,43.654],
			zoom: 12.5
		});
	}
});

$(window).on("load",function (){

	//Hide Loader
    var wind = $(window);
    $("#preloader").delay(500).fadeOut(400);

    // Scroll windows to top
    wind.scrollTop(0);
});

//Odometer on Scroll
$(window).on("resize scroll",function (){
	$('.odometer').each(function() {			
		var elementTop = $(this).offset().top;
		var elementBottom = elementTop + $(this).outerHeight();
		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height();
		
		if(elementBottom > viewportTop && elementTop < viewportBottom){
			$(this).html($(this).attr("data-value"));
		}
		
	});
});