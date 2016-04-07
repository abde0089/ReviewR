"use strict";

var app = {
    // Application Constructor
    pages: null,
    currentPage: 0,
    imageSRC: null,
    initialize: function() {
       document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
    },
    urlGetAllReviews: "https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/",
    urlGetReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/get/",
    urlSetNewReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/set/",
    
    onDeviceReady: function(){
        
        var script = document.createElement('script'); 
        script.setAttribute('src', 'https://hammerjs.github.io/dist/hammer.js');
        document.body.appendChild(script);
        script.addEventListener('load', app.firstLoad);
        
        
    },
    firstLoad: function(){
        
        app.pages = document.querySelectorAll("section");
        
        var addBtn = document.getElementById("addBtn");
        var cameraBtn = document.getElementById("picBtn");
        var backBtn = document.getElementById("backBtn");
        
        //submitBtn.addEventListener("click", app.addReview);
        cameraBtn.addEventListener("click", app.takePicture);
        backBtn.addEventListener("click", function(){
            app.switchPage(0);   
        });
        
        addBtn.addEventListener("click", function(){
            
            if (app.currentPage == 0){
                app.switchPage(2);   
            }else{
                
                app.addReview();
                app.switchPage(0);
            }
        });
        
        app.getReviews();
        
        
    },
    getReviews: function(){
        
        var params = new FormData();
        params.append("uuid","London");
        
        app.ajaxCall(app.urlGetAllReviews, params, app.gotList, app.ajaxErr);
        
    },
    getDetails: function(ev){
        
       var id = ev.target.dataset.review;
        
        var params = new FormData();
        params.append("uuid","London");
        params.append("review_id", id);
        
        app.ajaxCall(app.urlGetReview, params, app.gotDetails, app.ajaxErr);
        
    },
    
    addReview: function(){
        
        var title = document.getElementById("reviewTitle").value;
        var review = document.getElementById("reviewText").value;
        var rating = document.getElementById("reviewRating").value;
        var image = encodeURIComponent(app.imageSRC);
        
            
        var params = new FormData();
        params.append("uuid","London");
        params.append('action', 'insert');
        params.append('title', title);
        params.append('rating', rating);
        params.append('review_txt', review);
        params.append('img', image);
        
        app.ajaxCall(app.urlSetNewReview, params, function (res){
            
            app.getReviews();
            app.switchPage(0);
            
        });
        
    },
    
    gotList: function(res){
        
        var xhr = res.target;
        
        
        if (parseInt(xhr.status) < 300) {
            
            var data = JSON.parse(xhr.responseText);

            if (data.code == 0) { // Zero from PHP = OK

                console.dir(data.reviews);

                var reviews = data.reviews;
                
                var list = document.querySelector("#list"); // get the list element
                
                list.innerHTML = ""; // empty the existing list

                if (reviews.length > 0) { // we have previous review(s)
                    
                    console.log("We have existing reviews: " + data.message);
                    
                    // loop through existing reviews and add a list item for each one
                    // reviews is an array so we can use array.forEach()
                    reviews.forEach(function (obj) { // forEach accaepts an iterator function and optionally, a value to use as this 
                                                     // actually has 3 optional arguments: value, index, and an array reference 
                        // create and initialize a new list item
                        var li = document.createElement("li");
                        li.setAttribute("data-review", obj.id);
                        li.textContent = obj.title;
                        list.appendChild(li);

                        // add click event to the list item so you can get all the details later
                        li.addEventListener("click", app.getDetails);

                        console.log("Existing data: ID: " + obj.id + " Title: " + obj.title + " Rating: " + obj.rating);
                    });
                 
                   
                } else { // no existing reviews 
                   
                    console.log("no existing reviews: " + data.message);
                   
                    
                    // create a single list item and display the default message
                    var li = document.createElement("li");
                    li.className = "loading";
                    li.setAttribute("data-review", 0);
                    li.textContent = data.message;
                    list.appendChild(li);
                    
                }
 
            } else { // Did not get zero from PHP = NOT OK!
                app.ajaxErr(data);
            }

        } else { // xhr Status Error
            app.ajaxErr({
                "message": "Invalid HTTP Response"
            });
        }   
        
    },
    
    gotDetails: function(res){
        
        console.log(JSON.parse(res.target.responseText));
        var data = JSON.parse(res.target.responseText);
        
        app.switchPage(1);
        
        var title = document.querySelector("#details > h4");
        var rating = document.querySelector("#details > h5");
        var image = document.querySelector("#details > img");
        var text = document.querySelector("#details > p");
        
        title.innerHTML = data.review_details.title;
        rating.innerHTML = data.review_details.rating;
        image.src = decodeURIComponent(data.review_details.img);
        text.innerHTML = data.review_details.review_txt;
        
    },
    
     takePicture: function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth: 200,
            cameraDirection: Camera.Direction.FRONT,
            saveToPhotoAlbum: false
        };
         
        navigator.camera.getPicture(app.imgSuccess, app.imgFail, options);
    },
    imgSuccess: function (img) {
        // data comes as imageData in base64.
        var add = document.querySelector('#add');
        app.imageSRC = "data:image/jpeg;base64," + img;
        navigator.camera.cleanup();
    },
    imgFail: function (err) {
        console.log("Failed to get image: " + err);
    },
    
    switchPage: function(show){
        
        for (var i=0; i < app.pages.length; i++){
            
            app.pages[i].classList.add("inactive");
            
        }
        
        app.currentPage = show;
        app.pages[show].classList.remove("inactive");
        
    },
    
    ajaxCall: function (url, formData, success, fail) {
      
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", success);
        xhr.addEventListener("error", fail);
        xhr.send(formData);
    },
    ajaxErr: function (err) {
        alert(err.message); // Houston we have an AJAX problem
    }

    
};

app.initialize();
