$(document).ready(function () {



    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(function () {
        $('a.page-scroll').bind('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });

    // Google vision API upload and pass photo to the API
    $("#pic").change(function encodeImagetoBase64(element) {
        $("#loadPicIcon").attr("class", "fa fa-refresh fa-spin fa-3x fa-fw");

        var file = this.files[0];
        var reader = new FileReader();

        reader.onloadend = function () {
            var convertedPic = reader.result;
            // Removes the extra string characters before the /
            var sliceNum = convertedPic.indexOf(",") + 1;
            var convertedPicSlice = convertedPic.slice(sliceNum);

            $.ajax({
                url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDdccmbhWxyGXxtqWe1mrNpBPbL7ZN3GRY",
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    'requests': [{
                        'image': {
                            "content": convertedPicSlice
                        },
                        'features': [{
                            'type': "FACE_DETECTION"
                        }]
                    }]
                }),

                success: function (result) {
                    // CallBack(result);

                    // Scroll to voice section once results are produced for the image
                    $('html, body').stop().animate({
                        scrollTop: $("#voice").offset().top
                    }, 1500, 'easeInOutExpo');

                    var faceResults = result.responses[0].faceAnnotations[0];
                    var anger = faceResults.angerLikelihood;
                    var joy = faceResults.joyLikelihood;
                    var sorrow = faceResults.sorrowLikelihood;
                    var surprise = faceResults.surpriseLikelihood;

                    // console.log(faceResults);

                    console.log("Anger " + anger);
                    console.log("Joy " + joy);
                    console.log("Sorrow " + sorrow);
                    console.log("Surprise " + surprise);

                    var mood;
                    if (joy === "LIKELY" || joy === "POSSIBLE" || joy === "VERY_LIKELY") {
                        mood = 'happy';
                    }
                    if (sorrow === "LIKELY" || sorrow === "POSSIBLE" || sorrow === "VERY_LIKELY") {
                        mood = 'sad';
                    }

                    setTimeout(googleVoice(mood), 1000);
                    $("#loadPicIcon").attr("class", "fa fa-cloud-upload fa-5x");

                },
                error: function (error) {
                    console.log(error);
                }
            });

            //   console.log(convertedPic);
            // console.log(convertedPicSlice);
        }
        reader.readAsDataURL(file);


    });



    function googleVoice(x) {

        $(document).ready(function () {
            var speechMessage = new SpeechSynthesisUtterance();
            speechMessage.lang = 'en-US';
            speechMessage.text = 'oh  you  look  ' + x + ' Today  how  can I  help  you';
            speechSynthesis.speak(speechMessage);

            speechMessage.onstart = function (event) {
                console.log(event);
            };
            if ('webkitSpeechRecognition' in window) {
                var speechRecognizer = new window.webkitSpeechRecognition();
                speechRecognizer.continuous = true;
                speechRecognizer.interimResults = true;
                speechRecognizer.lang = 'en-US';
                speechRecognizer.maxAlternatives = 1;


                setTimeout(function () {
                    f()
                }, 3000);


                $("#mic").on('click', function () {
                    f();
                });

                function f() {
                    $("#mic").css("animation", "mic-animate 2s linear infinite");
                    speechRecognizer.start();
                    speechRecognizer.onresult = function (event) {
                        for (var i = event.resultIndex; i < event.results.length; ++i) {
                            interimResults = event.results[i][0].transcript;
                            x = $('textarea').val();
                            console.log(event.results[i][0].transcript);

                            if (event.results[i].isFinal) {
                                console.log(event.results[i].transcript);

                                if (compare2string(event.results[i][0].transcript, "Im looking for some food")) {
                                    speechRecognizer.stop();
                                    speechSynthesis.speak(new SpeechSynthesisUtterance('go and  cook  some  food  for  your  self'));
                                }
                                if (compare2string(event.results[i][0].transcript, "go")) {
                                    window.open("https://www.google.com/search?source=hp&q=" + x);
                                    $('textarea').val("");
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "stop")) {
                                    speechRecognizer.stop();

                                    $("#mic").css("animation", 'none');
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "delete")) {
                                    var lastIndex = x.lastIndexOf(" ");
                                    x = x.substring(0, lastIndex);
                                    $('textarea').val(x);
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "delete all")) {
                                    $('textarea').val("");
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "I want to watch a movie")) {
                                    foodMap('theatre');
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "I want to eat something")) {
                                    speechRecognizer.stop();
                                    foodMap('pizza');
                                    break;
                                }

                                $('textarea').val(x + " " + interimResults);
                                console.log("final results: " + event.results[i][0].transcript);
                            }
                        }
                    }
                }
            }

            function compare2string(x, y) {
                if (x.toLowerCase().replace(/ /g, '').replace(/'/g, '') === y.toLowerCase().replace(/ /g, '').replace(/'/g, '')) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    $.getJSON("https://ipapi.co/json/",
        function (json) {
            // console.log(json);
            var city = json.city;

            $("iframe").attr("src", "https://www.google.com/maps/embed/v1/search?key=AIzaSyD0X2UTW5AczWoZ9-Wj517k9yvMZqBEeA4&q=" + city);
        });

    function foodMap(search) {

        $("#mic").css("animation", 'none');
        $('textarea').val("");

        // Scroll to voice section once results are produced for the image
        $('html, body').stop().animate({
            scrollTop: $("#mapSection").offset().top
        }, 1500, 'easeInOutExpo');

        $.getJSON("https://ipapi.co/json/",
            function (json) {
                // console.log(json);
                var city = json.city;

                $("iframe").attr("src", "https://www.google.com/maps/embed/v1/search?key=AIzaSyD0X2UTW5AczWoZ9-Wj517k9yvMZqBEeA4&q=" + search + "+in+" + city);
            });
    }

    // var GW = new google.maps.LatLng(38.8824200, -77.116944);
    // var map;
    // var infowindow;
    // var request;
    // var service;
    // var markers = [];

    // function callback(results, status) {
    //     if (status == google.maps.places.PlacesServiceStatus.OK) {
    //         for (var i = 0; i < results.length; i++) {
    //             var place = results[i];
    //             createMarker(results[i]);
    //         }
    //     }
    // }

    // function createMarker(place) {
    //     var placeLoc = place.geometry.location;
    //     marker = new google.maps.Marker({
    //         map: map,
    //         position: place.geometry.location

    //     });
    //     google.maps.event.addListener(marker, 'click', function () {
    //         var infowindow = new google.maps.InfoWindow({
    //             content: place.name
    //         });
    //         infowindow.open(map, this);
    //     });
    //     return marker;
    // }

    // function clearResults(markers) {
    //     for (var m in markers) {
    //         markers[m].setmap(null)
    //     }
    //     markers = []
    // }

    // function foodMap(search) {

    //     // Scroll to voice section once results are produced for the image
    //     $('html, body').stop().animate({
    //         scrollTop: $("#mapSection").offset().top
    //     }, 1500, 'easeInOutExpo');

    //     var request = {
    //         location: GW,
    //         radius: '500',
    //         type: [search]
    //     };

    //     service = new google.maps.places.PlacesService(map);
    //     service.nearbySearch(request, callback);

    // }

    // function initialize() {

    //     map = new google.maps.Map(document.getElementById('map'), {
    //         center: GW,
    //         zoom: 16
    //     });
    //     request = {
    //         location: GW,
    //         radius: '500'
    //     };

    //     service = new google.maps.places.PlacesService(map);

    // }

    // google.maps.event.addDomListener(window, 'load', initialize);



});