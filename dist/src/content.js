chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      if (request.action === "FETCH_COMMENTS") {
        console.log(request.url)
         fetchComments(request.url.url)
          
      }
      else if (request.action === "PROCESS_FINISHED") {
      //  console.log(request)
        colorComments(request.res)
      }

      else if (request.action === "GET_RECOMMENDATIONS") {
        console.log(request.url)
        fetchSimilar(request.url)

      }
      else if (request.action === "FETCH_LANDING") {
        console.log(request.url)
        fetchLandingPage(request.url)
      }

    
  }
);



function colorPicker(sentiment) {
  if (sentiment === "positive" ) {
    return {color: 'linear-gradient(to right, rgba(255,0,0,0), rgba(71,188,244,0.5), rgba(255,0,0,0))'}
  }
  else if (sentiment === "negative")
    return {color: 'linear-gradient(to right, rgba(255,0,0,0), rgba(241,126,48,0.5), rgba(255,0,0,0))'}
  else {
    return {color: 'linear-gradient(to right, rgba(255,0,0,0), rgba(109,226,87,0.5), rgba(255,0,0,0))'}
  }
 

}

function colorComments(messages) {
  const items = document.body.querySelectorAll('ul .film-detail');


  for (let i = 0; i < items.length; i++) {

    const textColor = colorPicker(messages[i].sentiment).color
 
    items[i].style.background = textColor;


  }
 

}

const createScore = (elem) => {
  console.log(elem)
  /*     const score = document.createElement('p')
    score.textContent = 'Score: ' + String(messages[i].score)
    score.style.fontWeight = 700
    score.style.fontSize = '13px'
    items[i].querySelector('.body-text').appendChild(score) */

}

const fetchLandingPage = (url) => {


   const landingItems = document.querySelectorAll('.poster-list li');
    let counter = 0

   Array.from(landingItems).map(function (elem){
    if (elem.classList.contains("film-watched")) {
      console.log(elem)
      counter = counter + 1
      elem.querySelector('img').style.border = "3px solid rgba(71,188,244,0.5)"
      
    }
   })

   const commonMovies = document.createElement('p')
  commonMovies.textContent = 'Common Movies: ' + String(counter)


  document.querySelector('.title-3').appendChild(commonMovies) 

   document.querySelector('iframe').style.display = "none"




    



}

const fetchComments = (url) => {

  fetch(url).then(function (response) {
        // The API call was successful!
        return response.text();
    }).then(function (html) {
    
        // Convert the HTML string into a document object
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        //console.log(doc)
        const items = doc.querySelectorAll('ul .film-detail');
       // console.log(items)
        const comments = Array.from(items).map((elem) => elem.querySelector(".body-text").innerText )
      //  console.log(comments)
        
        chrome.runtime.sendMessage({action: "PROCESS_TEXT", text: comments})
    
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });   

}







const fetchSimilar = (info) => {
  fetch(info.linkUrl).then(function (response) {
    // The API call was successful!
    return response.text();
}).then(function (html) {

    // Convert the HTML string into a document object
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
   // console.log(doc)
    const items = doc.querySelector(".related-films").querySelectorAll('.poster-list li');
  

    Array.from(items).map((elem) => {
      
      console.log(elem)
      elem.style.margin = "5px"
    

     // elem.classList.add("-scaled128");
      //elem.classList.add("-p125");


    
      document.querySelector('.basic').appendChild(elem)
    })
    //document.querySelector('.related-films').querySelector('.poster-list').appendChild(items[0])
   
    //sendResponse({textItems: items});

}).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
});
}


