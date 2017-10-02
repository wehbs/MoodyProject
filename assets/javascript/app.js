$(function () {


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

        var file = this.files[0];
        var reader = new FileReader();

        reader.onloadend = function () {
            var convertedPic = reader.result;
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

                    var x;
                    if (joy === "LIKELY" || joy === "POSSIBLE" || joy === "VERY_LIKELY") {
                        x = 'happy';
                    }
                    if (sorrow === "LIKELY" || sorrow === "POSSIBLE" || sorrow === "VERY_LIKELY") {
                        x = 'sad';
                    }
                    googleVoice(x);

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

                $("#button").on('click', function () {
                    // event.preventDefault();
                    f();
                });

                function f() {
                    $("#button").text('stop');
                    speechRecognizer.start();
                    speechRecognizer.onresult = function (event) {
                        for (var i = event.resultIndex; i < event.results.length; ++i) {
                            interimResults = event.results[i][0].transcript;
                            x = $('textarea').val();
                            console.log(event.results[i][0].transcript);
                            if (event.results[i].isFinal) {
                                console.log(event.results[i].transcript);
                                if (compare2string(event.results[i][0].transcript, "I m looking for some food")) {
                                    speechRecognizer.stop();
                                    speechSynthesis.speak(new SpeechSynthesisUtterance('go and  cook  some  food  for  your  self'));
                                    $("#button").text('start');
                                }
                                if (compare2string(event.results[i][0].transcript, "go to google")) {
                                    window.open("https://www.google.com/");
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "stop")) {
                                    window.open("https://www.google.com/");
                                    break;
                                }
                                if (compare2string(event.results[i][0].transcript, "I want to watch a movie")) {
                                    music();
                                }
                                if (compare2string(event.results[i][0].transcript, "I want to eat something")) {
                                    food();
                                }
                                if (compare2string(event.results[i][0].transcript, "I want to go some where")) {
                                    travel();
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

            function food() {
                $("#A").append('<button id="google">food</button>');
            }

            function music() {
                $("#A").append('<button id="google">music</button>');
            }

            function movie() {
                $("#A").append('<button id="google">travel</button>');
            }
        });
    }




});