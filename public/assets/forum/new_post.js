// not works.... why?

// var new_post = new Vue({
//     el: "#new_post",
//     data: {
//         content: "",
//         preventSendTwice: false
//     },
//     methods: {
//         sub: function() {
//             console.log("submit!!!" + this.content);
//             if (this.preventSendTwice || this.content == "") {
//                 console.log("prevent send twice")
//                 return;
//             }
//             this.preventSendTwice = true;
//             let self = this;
//             $.ajax({
//                 method: 'POST',
//                 url: './new_post',
//                 dataType: 'json',
//                 data: {
//                     content: self.content
//                 },
//                 success: function() {
//                     console.log("send post successfully");
//                     self.preventSendTwice = false;
//                 },
//                 error: function() {
//                     console.log("failed to send post");
//                 }
//             })
//         }
//     }
// });
let preventSendTwice = false

$(document).on("click", '#send_post', function(event) {
    console.log("!!!!!!!!!");
    var content = $('#new_post_content').val();
    console.log(content);
    if (preventSendTwice || content == "") {
        return;
    }
    preventSendTwice = true;
    $.ajax({
        method: 'POST',
        url: './new_post',
        dataType: 'json',
        data: {
            content: content
        },
        success: function(data) {
            preventSendTwice = false;
            $('#new_post').modal("toggle");
        },
        error: function(e) {
            console.log("failed to send post");
        }
    })

})
