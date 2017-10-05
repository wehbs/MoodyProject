$(document).ready(function () {



    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(function () {
        // read a this greeting message for the user depense on his name
        var user=sessionStorage.getItem('user');
        speechSynthesis.speak(new SpeechSynthesisUtterance( "Hi.  " + user + '   upload your photo and check your mood today'));
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

  // define a fuction to get the voice
    function googleVoice(x) {
        // this will play a informatif message about his mood
        var speechMessage = new SpeechSynthesisUtterance();
        speechMessage.lang = 'en-US';
        speechMessage.text = 'oh  you  look  ' + x + ' Today  how  can I  help  you';
        speechSynthesis.speak(speechMessage);
        // this part will check if the speech api is supported by the browser
        if ('webkitSpeechRecognition' in window) {
            // create a new object webkitSpeechRecognition 
            var speechRecognizer = new window.webkitSpeechRecognition();
            // the listning will be a continuous unless we stop it
            speechRecognizer.continuous = true;
            // this will take the final setence once the user stop completly talking
            speechRecognizer.interimResults = true;
            // define the languague accent
            speechRecognizer.lang = 'en-US';
            // take the maximum accurate result
            speechRecognizer.maxAlternatives = 1;
            // the f function will be triggered once we click on the mic icon
            $("#mic").on('click', function () {
                f();
            });

            function f() {
                // play mic animation
                $("#mic").css("animation", "mic-animate 2s linear infinite");
                // start listnening
                speechRecognizer.start();
                // once there is a result this fucntion will be triggered
                speechRecognizer.onresult = function (event) {

                    for (var i = event.resultIndex; i < event.results.length; ++i) {
                        // take the interim result 
                        interimResults = event.results[i][0].transcript;
                        x = $('textarea').val();
                        // if the result is final
                        if (event.results[i].isFinal) {
                             // if the final sentence is ... so do .......
                            if (compare2string(event.results[i][0].transcript, "Im looking for some food")) {
                                speechSynthesis.speak(new SpeechSynthesisUtterance("go and  cook  some  food  for  your  self"));
                            }
                            if (compare2string(event.results[i][0].transcript, "go")) {
                                window.open("https://www.google.com/search?source=hp&q=" + x);
                                $('textarea').val("");
                                break;
                            }
                            if (compare2string(event.results[i][0].transcript, "stop")) {
                                speechRecognizer.stop();
                                $('textarea').val("");
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
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Well I don't know any movies that will match your mood but here are your local theatre's"));
                                foodMap("theatre");
                                break;
                            }
                            if (compare2string(event.results[i][0].transcript, "I want to eat something")) {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Here's some food that will comfort you"));
                                foodMap("ice cream");
                                break;
                            }
                            // this will set the value final sentence on input text
                            $('textarea').val(x + " " + interimResults);
                            console.log("final results: " + event.results[i][0].transcript);
                        }
                    }
                }
            }
        }
        // this function to compare two string 
        function compare2string(x, y) {
            if (x.toLowerCase().replace(/ /g, '').replace(/'/g, '') === y.toLowerCase().replace(/ /g, '').replace(/'/g, '')) {
                return true;
            } else {
                return false;
            }
        }
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

});