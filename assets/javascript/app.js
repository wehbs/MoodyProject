$(function () {


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

                    console.log(faceResults);

                    console.log("Anger " + anger);
                    console.log("Joy " + joy);
                    console.log("Sorrow " + sorrow);
                    console.log("Surprise " + surprise);

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









});