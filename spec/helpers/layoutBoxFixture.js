(function (window, document, undefined) {
    "use strict";
    
    var layoutBox = document.createElement("div");
        
    layoutBox.classList.add("layoutBox");
    layoutBox.style.width = "500px";
    layoutBox.style.height = "500px";

    document.body.appendChild(layoutBox);

}).call(this, window, document);