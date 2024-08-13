function sendData() {
  
    alert('hello');
    var post_collection_out = [];
    var post_collection_in = document.getElementsByClassName('post');
    alert('posts in report... ' + post_collection_in.length);
    
    for (i=0; i < post_collection_in.length; i++ ) {
        if (post_collection_in[i].getElementsByName('selected')) {
        //  post_collection_out.push(post_data[i])\n";
        }
    }

    console.log('removing session variables.');
    sessionStorage.removeItem('topic-data');
    sessionStorage.removeItem('post-data');
    sessionStorage.removeItem('job-data');
}

