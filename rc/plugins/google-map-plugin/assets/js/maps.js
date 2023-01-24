/**
 * This jQuery plugin displays map and it's components.
 * @author Flipper Code (hello *at* flippercode *dot* com)
 * @version 1.0
 */
(function($, window, document, undefined) {


    function GoogleMaps(element, map_data) {
        var options;
        this.element = element;
        this.map_data = $.extend({}, {}, map_data);
        options = this.map_data.map_options;
        this.settings = $.extend({
            "zoom": "5",
            "map_type_id": "ROADMAP",
            "scroll_wheel": true,
            "map_visual_refresh": false,
            "full_screen_control": false,
            "full_screen_control_position": "BOTTOM_RIGHT",
            "zoom_control": true,
            "zoom_control_style": "SMALL",
            "zoom_control_position": "TOP_LEFT",
            "map_type_control": true,
            "map_type_control_style": "HORIZONTAL_BAR",
            "map_type_control_position": "RIGHT_TOP",
            "scale_control": true,
            "street_view_control": true,
            "street_view_control_position": "TOP_LEFT",
            "overview_map_control": true,
            "center_lat": "40.6153983",
            "center_lng": "-74.2535216",
            "draggable": true
        }, {}, options);
        this.container = $("div[rel='" + $(this.element).attr("id") + "']");

        var suppress_markers = false;
        if (this.map_data.map_tabs && this.map_data.map_tabs.direction_tab) {
            suppress_markers = this.map_data.map_tabs.direction_tab.suppress_markers;
        }
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: suppress_markers,
        });
        this.drawingmanager = {};
        this.geocoder = new google.maps.Geocoder();
        this.places = [];
        this.show_places = [];
        this.categories = {};
        this.tabs = [];
        this.all_shapes = [];
        this.wpgmp_polylines = [];
        this.wpgmp_polygons = [];
        this.wpgmp_circles = [];
        this.wpgmp_shape_events = [];
        this.wpgmp_rectangles = [];
        this.per_page_value = 0;
        this.current_amenities = [];
        this.route_directions = [];
        this.search_area = '';
        this.markerClusterer = null;
        this.infowindow_marker = new google.maps.InfoWindow();
        this.init();
    }

    GoogleMaps.prototype = {

        init: function() {
            var map_obj = this;
            var center = new google.maps.LatLng(map_obj.settings.center_lat, map_obj.settings.center_lng);
            map_obj.map = new google.maps.Map(map_obj.element, {
                zoom: parseInt(map_obj.settings.zoom),
                center: center,
                disableDoubleClickZoom: (map_obj.settings.scroll_wheel != 'false'),
                scrollwheel: map_obj.settings.scroll_wheel,
                zoomControl: (map_obj.settings.zoom_control === true),
                fullscreenControl: (map_obj.settings.full_screen_control === true),
                fullscreenControlOptions: {
                    position: eval("google.maps.ControlPosition." + map_obj.settings.full_screen_control_position)
                },
                zoomControlOptions: {
                    style: eval("google.maps.ZoomControlStyle." + map_obj.settings.zoom_control_style),
                    position: eval("google.maps.ControlPosition." + map_obj.settings.zoom_control_position)
                },
                mapTypeControl: (map_obj.settings.map_type_control == true),
                mapTypeControlOptions: {
                    style: eval("google.maps.MapTypeControlStyle." + map_obj.settings.map_type_control_style),
                    position: eval("google.maps.ControlPosition." + map_obj.settings.map_type_control_position)
                },
                scaleControl: (map_obj.settings.scale_control == true),
                streetViewControl: (map_obj.settings.street_view_control == true),
                streetViewControlOptions: {
                    position: eval("google.maps.ControlPosition." + map_obj.settings.street_view_control_position)
                },
                overviewMapControl: (map_obj.settings.overview_map_control == true),
                overviewMapControlOptions: {
                    opened: map_obj.settings.overview_map_control
                },
                draggable: map_obj.settings.draggable,
                mapTypeId: eval("google.maps.MapTypeId." + map_obj.settings.map_type_id),
                styles: eval(map_obj.map_data.styles)
            });

            map_obj.map_loaded();
            map_obj.responsive_map();
            map_obj.create_markers();
            map_obj.display_markers();
            
            if ( map_obj.map_data.street_view ) {
                map_obj.set_streetview(center);
            }

            if ( map_obj.map_data.bicyle_layer) {
                map_obj.set_bicyle_layer();
            }

            if ( map_obj.map_data.traffic_layer) {
                map_obj.set_traffic_layer();
            }

            if (map_obj.map_data.transit_layer) {
                map_obj.set_transit_layer();
            }

            if ( map_obj.map_data.panoramio_layer ) {
                map_obj.set_panoramic_layer();
            }

            if (map_obj.settings.display_45_imagery == '45') {
                map_obj.set_45_imagery();
            }

            if (typeof map_obj.map_data.map_visual_refresh === true) {
                map_obj.set_visual_refresh();
            }

    
            $("body").on("click", ".wpgmp_marker_link", function() {
                map_obj.open_infowindow($(this).data("marker"));
                $('html, body').animate({
                    scrollTop: $(map_obj.container).offset().top - 150
                }, 500);
            });

            $(map_obj.container).on("click", "a[data-marker]", function() {
                map_obj.open_infowindow($(this).data("marker"));
                $('html, body').animate({
                    scrollTop: $(map_obj.container).offset().top - 150
                }, 500);
            });

            $(map_obj.container).on("click", "a[data-marker]", function() {
                map_obj.open_infowindow($(this).data("marker"));
            });

            // REGISTER AUTO SUGGEST
            map_obj.google_auto_suggest($(".wpgmp_auto_suggest"));

        },
        
        createMarker: function(place) {
            var map_obj = this;
            var map = map_obj.map;
            var placeLoc = place.geometry.location;
            var image = {
                url: place.icon,
                size: new google.maps.Size(25, 25),
                scaledSize: new google.maps.Size(25, 25)
            };

            place.marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                icon: image
            });

            google.maps.event.addListener(place.marker, 'click', function() {
                 if (map_obj.settings.map_infowindow_customisations === true)
                    map_obj.amenity_infowindow.setContent('<div class="wpgmp_infowindow"><div class="wpgmp_iw_content">' + place.name + '</div></div>');
                else
                    map_obj.amenity_infowindow.setContent(place.name);
                map_obj.amenity_infowindow.open(map, this);
            });
            map_obj.current_amenities.push(place);
        },
       
        marker_bind: function(marker) {

            map_obj = this;

            google.maps.event.addListener(marker, 'drag', function() {

                var position = marker.getPosition();

                map_obj.geocoder.geocode({
                    latLng: position
                }, function(results, status) {

                    if (status == google.maps.GeocoderStatus.OK) {

                        $("#googlemap_address").val(results[0].formatted_address);

                        $(".google_city").val(map_obj.wpgmp_finddata(results[0], 'administrative_area_level_3') || map_obj.wpgmp_finddata(results[0], 'locality'));
                        $(".google_state").val(map_obj.wpgmp_finddata(results[0], "administrative_area_level_1"));
                        $(".google_country").val(map_obj.wpgmp_finddata(results[0], "country"));

                        if (results[0].address_components) {
                            for (var i = 0; i < results[0].address_components.length; i++) {
                                for (var j = 0; j < results[0].address_components[i].types.length; j++) {
                                    if (results[0].address_components[i].types[j] == "postal_code") {
                                        wpgmp_zip_code = results[0].address_components[i].long_name;
                                        $(".google_postal_code").val(wpgmp_zip_code);
                                    }
                                }
                            }
                        }
                    }
                });

                $(".google_latitude").val(position.lat());
                $(".google_longitude").val(position.lng());
            });

        },

        google_auto_suggest: function(obj) {

            var map_obj = this;

            obj.each(function() {
                var current_input = this;
                var autocomplete = new google.maps.places.Autocomplete(this);

                autocomplete.bindTo('bounds', map_obj.map);

                if ($(this).attr("name") == 'location_address') {
                    var infowindow = map_obj.infowindow_marker;
                    var marker = new google.maps.Marker({
                        map: map_obj.map,
                        draggable: true,
                        anchorPoint: new google.maps.Point(0, -29)
                    });

                    map_obj.marker_bind(marker);

                    google.maps.event.addListener(autocomplete, 'place_changed', function() {

                        var place = autocomplete.getPlace();
                        if (!place.geometry) {
                            return;
                        }

                        // If the place has a geometry, then present it on a map.
                        if (place.geometry.viewport) {
                            map_obj.map.fitBounds(place.geometry.viewport);
                        } else {
                            map_obj.map.setCenter(place.geometry.location);
                            map_obj.map.setZoom(17);
                        }

                        $(".google_latitude").val(place.geometry.location.lat());
                        $(".google_longitude").val(place.geometry.location.lng());
                        $(".google_city").val(map_obj.wpgmp_finddata(place, 'administrative_area_level_3') || map_obj.wpgmp_finddata(place, 'locality'));
                        $(".google_state").val(map_obj.wpgmp_finddata(place, "administrative_area_level_1"));
                        $(".google_country").val(map_obj.wpgmp_finddata(place, "country"));
                        if (place.address_components) {
                            for (var i = 0; i < place.address_components.length; i++) {
                                for (var j = 0; j < place.address_components[i].types.length; j++) {
                                    if (place.address_components[i].types[j] == "postal_code") {
                                        wpgmp_zip_code = place.address_components[i].long_name;
                                        $(".google_postal_code").val(wpgmp_zip_code);
                                    }
                                }
                            }
                        }

                        marker.setPosition(place.geometry.location);
                        marker.setVisible(true);
                    });
                } else {

                    google.maps.event.addListener(autocomplete, 'place_changed', function() {

                        var place = autocomplete.getPlace();
                        if (!place.geometry) {
                            return;
                        }

                        $().val(place.geometry.location.lat());
                        $(current_input).data('longitude', place.geometry.location.lng());
                        $(current_input).data('latitude', place.geometry.location.lat());

                    });
                }
            });
        },

        wpgmp_finddata: function(result, type) {
            var component_name = "";
            for (i = 0; i < result.address_components.length; ++i) {
                var component = result.address_components[i];
                $.each(component.types, function(index, value) {
                    if (value == type) {
                        component_name = component.long_name;
                    }
                });


            }
            return component_name;
        },

        open_infowindow: function(current_place) {
            var map_obj = this;

            $.each(this.map_data.places, function(key, place) {
                if (parseInt(place.id) == parseInt(current_place) && place.marker.visible === true) {
                   map_obj.openInfoWindow(place);
                }
            });
        },

        place_info: function(place_id) {

            var place_obj;

            $.each(this.places, function(index, place) {

                if (parseInt(place.id) == parseInt(place_id)) {
                    place_obj = place;
                }
            });

            return place_obj;
        },

        event_listener: function(obj, type, func) {
            google.maps.event.addListener(obj, type, func);
        },

        set_visual_refresh: function() {

            google.maps.visualRefresh = true;
        },

        set_45_imagery: function() {
            //this.map.setTilt(45);
        },

        set_bicyle_layer: function() {

            var bikeLayer = new google.maps.BicyclingLayer();
            bikeLayer.setMap(this.map);
        },

        set_traffic_layer: function() {

            var traffic_layer = new google.maps.TrafficLayer();
            traffic_layer.setMap(this.map);
        },

        set_panoramic_layer: function() {

            var panoramic_layer = new google.maps.panoramio.PanoramioLayer();
            panoramic_layer.setMap(this.map);
        },

        set_transit_layer: function() {

            var transit_layer = new google.maps.TransitLayer();
            transit_layer.setMap(this.map);
        },

        set_streetview: function(latlng) {

            var panoOptions = {
                position: latlng,
                addressControlOptions: {
                    position: google.maps.ControlPosition.BOTTOM_CENTER
                },
                linksControl: this.map_data.street_view.links_control,
                panControl: this.map_data.street_view.street_view_pan_control,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                },
                enableCloseButton: this.map_data.street_view.street_view_close_button
            };
            if (this.map_data.street_view.pov_heading && this.map_data.street_view.pov_pitch) {
                panoOptions['pov'] = {
                    heading: parseInt(this.map_data.street_view.pov_heading),
                    pitch: parseInt(this.map_data.street_view.pov_pitch)
                };
            }
            var panorama = new google.maps.StreetViewPanorama(this.element, panoOptions);
        },

        map_loaded: function() {

            var map_obj = this;

            var gmap = map_obj.map;

            google.maps.event.addListenerOnce(gmap, 'idle', function() {

                var center = gmap.getCenter();
                google.maps.event.trigger(gmap, 'resize');
                gmap.setCenter(center);

            });

            if (map_obj.settings.center_by_nearest === true) {
                map_obj.center_by_nearest();
            }
            if (map_obj.settings.close_infowindow_on_map_click === true) {
                google.maps.event.addListener(gmap, "click", function(event) {
                    $.each(map_obj.places, function(key, place) {
                        place.infowindow.close();
                        place.marker.setAnimation(null);
                    });
                });
            }

            if (map_obj.settings.map_infowindow_customisations === true) {
                google.maps.event.addListener(map_obj.infowindow_marker, 'domready', function() {

                    var wpgmp_iwOuter = $(map_obj.container).find('.gm-style-iw');

                    wpgmp_iwOuter.parent().css({
                        'width': '0px',
                        'height': '0px'
                    });
                    var wpgmp_iwCloseBtn = wpgmp_iwOuter.next();
                    wpgmp_iwCloseBtn.css('display', 'none');

                    var wpgmp_iwBackground = wpgmp_iwOuter.prev();

                    wpgmp_iwBackground.children(':nth-child(2)').css({
                        'display': 'none'
                    });

                    wpgmp_iwBackground.children(':nth-child(3)').css({
                        'background-color': '#000;',
                    });

                    wpgmp_iwBackground.children(':nth-child(4)').css({
                        'display': 'none'
                    });
                    var height = wpgmp_iwOuter.outerHeight() ;
                    wpgmp_iwBackground.children(':nth-child(3)').css({
                        'top':(height+18)+'px'
                    });
                    wpgmp_iwBackground.children(':nth-child(1)').css({
                        'top':(height+10)+'px'
                    });
                    wpgmp_iwBackground.children(':nth-child(3)').find('div').children().css({
                        'box-shadow': map_obj.settings.infowindow_border_color + ' 0px 1px 6px',
                        'border': '1px solid ' + map_obj.settings.infowindow_border_color,
                        'border-top': '',
                        'z-index': '1',
                        'background-color': map_obj.settings.infowindow_bg_color
                    });
                    wpgmp_iwOuter.find('.wpgmp_infowindow').prepend('<div class="infowindow-close"></div>');
                    wpgmp_iwOuter.on('click', '.infowindow-close', function(event){
                        $.each(map_obj.places, function(key, place) {
                            place.infowindow.close();
                            place.marker.setAnimation(null);
                        });
                    });
                });
            }

        },
        resize_map: function() {
            var map_obj = this;
            var gmap = map_obj.map;
            var zoom = gmap.getZoom();
            var center = gmap.getCenter();
            google.maps.event.trigger(this.map, 'resize');
            gmap.setZoom(zoom);
            gmap.setCenter(center);
        },
        responsive_map: function() {

            var map_obj = this;

            var gmap = map_obj.map;

            google.maps.event.addDomListener(window, "resize", function() {

                var zoom = gmap.getZoom();
                var center = gmap.getCenter();

                google.maps.event.trigger(gmap, "resize");
                gmap.setZoom(zoom);
                gmap.setCenter(center);
                gmap.getBounds();

            });

        },
        create_markers: function() {

            var map_obj = this;
            var places = map_obj.map_data.places;
            var temp_listing_placeholder;
            var replaceData;
            var remove_keys = [];
            
            $.each(places, function(key, place) {

                if (place.location.lat && place.location.lng) {
                    if (typeof place.categories == 'undefined') {
                        place.categories = {};
                    }
                    place.marker = new google.maps.Marker({
                        position: new google.maps.LatLng(
                            parseFloat(place.location.lat),
                            parseFloat(place.location.lng)
                        ),
                        icon: place.location.icon,
                        url: place.url,
                        draggable: place.location.draggable,
                        map: map_obj.map,
                        clickable: place.location.infowindow_disable,
                    });

                    if (map_obj.settings.infowindow_drop_animation === true) {
                        place.marker.setAnimation(google.maps.Animation.DROP);
                    }

                    if (map_obj.settings.infowindow_filter_only === true) {
                        place.marker.visible = false;
                        place.marker.setVisible(false);
                    }


                    // bind event to marker
                    if (map_obj.map_data.page == 'edit_location')
                        map_obj.marker_bind(place.marker);
                    var location_categories = [];
                    if (typeof place.categories != 'undefined') {
                        for (var cat in place.categories) {
                            location_categories.push(place.categories[cat].name);
                        }
                    }
                    var content = '';
                     // replace infowindow content.
                    var marker_image = '';
                   
                     if( place.source == 'post' ) { 
                        marker_image = place.location.extra_fields.post_featured_image; 
                    } else {
                        marker_image = place.location.marker_image;
                    }

                    var temp_listing_placeholder = '';
                    if( place.source == 'post' ) { 
                        temp_listing_placeholder = map_obj.settings.infowindow_geotags_setting;
                    } else {
                        temp_listing_placeholder = map_obj.settings.infowindow_setting;
                    }

                    if( typeof temp_listing_placeholder == 'undefined' ) {
                                temp_listing_placeholder = place.content;
                    }

                        replaceData = {
                            "{marker_id}": place.id,
                            "{marker_title}": place.title,
                            "{marker_address}": place.address,
                            "{marker_latitude}": place.location.lat,
                            "{marker_longitude}": place.location.lng,
                            "{marker_city}": place.location.city,
                            "{marker_state}": place.location.state,
                            "{marker_country}": place.location.country,
                            "{marker_postal_code}": place.location.postal_code,
                            "{marker_zoom}": place.location.zoom,
                            "{marker_icon}": place.location.icon,
                            "{marker_category}": location_categories.join(','),
                            "{marker_message}": place.content,
                            "{marker_image}": marker_image
                        };

                        //Add extra fields of locations
                        if (typeof place.location.extra_fields != 'undefined') {
                            for (var extra in place.location.extra_fields) {
                                if (!place.location.extra_fields[extra]) {
                                    replaceData['{' + extra + '}'] = '';
                                } else {
                                    replaceData['{' + extra + '}'] = place.location.extra_fields[extra];
                                }
                            }
                        }
                        temp_listing_placeholder = temp_listing_placeholder.replace(/{[^{}]+}/g, function(match) {
                            if (match in replaceData) {
                                return (replaceData[match]);
                            } else {
                                return ("");
                            }
                        });

                    content = temp_listing_placeholder;
                  
                    
                    if (content === "") {
                        if (map_obj.settings.map_infowindow_customisations === true && map_obj.settings.show_infowindow_header === true)
                            content = '<div class="wpgmp_infowindow"><div class="wpgmp_iw_head"><div class="wpgmp_iw_head_content">' + place.title + '</div></div><div class="wpgmp_iw_content">' + place.content + '</div></div>';
                        else
                            content = '<div class="wpgmp_infowindow"><div class="wpgmp_iw_content">' + place.content + '</div></div>';
                    } else {
                        if (map_obj.settings.map_infowindow_customisations === true && map_obj.settings.show_infowindow_header === true)
                            content = '<div class="wpgmp_infowindow"><div class="wpgmp_iw_head"><div class="wpgmp_iw_head_content">' + place.title + '</div></div><div class="wpgmp_iw_content">' + content + '</div></div>';
                        else
                            content = '<div class="wpgmp_infowindow"><div class="wpgmp_iw_content">' + content + '</div></div>';
            
                    }
                    place.infowindow_data = content;
                    place.infowindow = map_obj.infowindow_marker;

                    if (place.location.infowindow_default_open === true) {
                        map_obj.openInfoWindow(place);
                    } else if (map_obj.settings.default_infowindow_open === true) {
                        map_obj.openInfoWindow(place);
                    }
                    var on_event = map_obj.settings.infowindow_open_event;
                    var bounce_on_event = map_obj.settings.infowindow_bounce_animation;
                    map_obj.event_listener(place.marker, on_event, function() {
                        $.each(map_obj.places, function(key, prev_place) {
                            prev_place.infowindow.close();
                            prev_place.marker.setAnimation(null);
                        });
                        map_obj.openInfoWindow(place);
                        if (bounce_on_event == 'click') {
                            map_obj.toggle_bounce(place.marker);
                        }
                    });
                    if (bounce_on_event == 'mouseover' && on_event != 'mouseover') {
                        map_obj.event_listener(place.marker, 'mouseover', function() {
                            place.marker.setAnimation(google.maps.Animation.BOUNCE);
                        });

                        map_obj.event_listener(place.marker, 'mouseout', function() {
                            place.marker.setAnimation(null);
                        });
                    }

                    if (bounce_on_event != '') {
                        google.maps.event.addListener(place.infowindow, 'closeclick', function() {
                            place.marker.setAnimation(null);
                        });
                    }

                    map_obj.places.push(place);
                } else {
                    remove_keys.push(key);
                }
            });
            $.each(remove_keys, function(index, value) {
                places.splice(value, 1);
            });

        },
        toggle_bounce: function(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        },
        display_markers: function() {

            var map_obj = this;
            map_obj.show_places = [];
            map_obj.categories = [];
            var categories = {};
            for (var i = 0; i < map_obj.places.length; i++) {
                map_obj.places[i].marker.setMap(map_obj.map);
                if (map_obj.places[i].marker.visible === true) {
                    map_obj.show_places.push(this.places[i]);
                }

                if (typeof map_obj.places[i].categories != 'undefined') {
                    $.each(map_obj.places[i].categories, function(index, category) {

                        if (typeof categories[category.name] == 'undefined') {
                            categories[category.name] = category;
                        }
                    });
                }
            }

            this.categories = categories;
        },
        get_current_location: function(success_func, error_func) {

            var map = this;

            if (typeof map.user_location == 'undefined') {

                navigator.geolocation.getCurrentPosition(function(position) {
                    map.user_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    if (success_func)
                        success_func(map.user_location);

                }, function(ErrorPosition) {

                    if (error_func)
                        error_func(ErrorPosition);

                }, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            } else {
                if (success_func)
                    success_func(map.user_location);
            }
        },

        openInfoWindow: function(place) {
            var map_obj = this;
            place.infowindow = map_obj.infowindow_marker;
            place.infowindow.setContent(place.infowindow_data);
            if (place.location.onclick_action == "custom_link") {
                if (place.location.open_new_tab == 'yes')
                    window.open(place.location.redirect_custom_link, '_blank');
                else
                    window.open(place.location.redirect_custom_link, '_self');
            } else {
                place.infowindow.open(this.map, place.marker);
                if (typeof map_obj.settings.infowindow_click_change_center != 'undefined' && map_obj.settings.infowindow_click_change_center == true) {
                    map_obj.map.setCenter(place.marker.getPosition());
                }
                if (typeof map_obj.settings.infowindow_click_change_zoom != 'undefined' && map_obj.settings.infowindow_click_change_zoom > 0) {
                    map_obj.map.setZoom(map_obj.settings.infowindow_click_change_zoom);
                }
                if (this.map_data.map_tabs && this.map_data.map_tabs.direction_tab && this.map_data.map_tabs.direction_tab.dir_tab === true) {
                    $(this.container).find('.start_point').val(place.address);
                }
            }

        },
    };

    $.fn.maps = function(options, places) {

        this.each(function() {

            if (!$.data(this, "wpgmp_maps")) {
                $.data(this, "wpgmp_maps", new GoogleMaps(this, options, places));
            }

        });
        // chain jQuery functions
        return this;
    };

}(jQuery, window, document));
