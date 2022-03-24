

import 'babel-polyfill';

import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';



const getMetaData = async () => {
  const metadata = await fetch("https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json")
  return metadata.json()
}


const padSequences = (sequences, metadata) => {
  return sequences.map(seq => {
    if (seq.length > metadata.max_len) {
      seq.splice(0, seq.length - metadata.max_len);
    }
    if (seq.length < metadata.max_len) {
      const pad = [];
      for (let i = 0; i < metadata.max_len - seq.length; ++i) {
        pad.push(0);
      }
      seq = pad.concat(seq);
    }
    return seq;
  });
}

const loadModel = async () => {
  const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`;
  const model = await tf.loadLayersModel(url);
  return model;
};

const predict = (text, model, metadata) => {
  const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
  const sequence = trimmed.map(word => {
    const wordIndex = metadata.word_index[word];
    if (typeof wordIndex === 'undefined') {
      return 2; 
    }
    return wordIndex + metadata.index_from;
  });
  const paddedSequence = padSequences([sequence], metadata);
  const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

  const predictOut = model.predict(input);
  const score = predictOut.dataSync()[0];
  predictOut.dispose();
  return score;
}

const getSentiment = (score) => {
  if (score > 0.66) {
    return "positive";
  }
  else if (score > 0.4) {
    return "neutral";
  }
  else {
    return "negative";
  }
}


const run = async (text) => {
      const model = await loadModel(); 
      const metadata = await getMetaData();
      let res = [];
      text.forEach(function (prediction) {
       // console.log(` ${prediction}`);
        let perc = predict(prediction, model, metadata);
        res.push({score: parseFloat(perc, 10), sentiment: getSentiment( parseFloat(perc, 10)), text: prediction});
      })
      
      //console.log(res)

      chrome.tabs.query({ active: true }, function (tabs) {
        //console.log(tabs[tabs.length - 1]);
        let message = { action: "PROCESS_FINISHED", res };
        chrome.tabs.sendMessage(tabs[tabs.length - 1].id, message);
      });
  
  }




chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log(msg)
  if (msg.action === "PROCESS_TEXT") {
    
    console.log(msg);
    run(msg.text)

    return true;
   
  }
}); 

chrome.tabs.onUpdated.addListener(function(id, info, tab){
  if (tab.status !== "complete"){
      return;
  }
  if(tab.url.indexOf("reviews") != -1){
    // chrome.tabs.executeScript(tab.id, {"file": "findtarget.js"});
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      const activeTab = tabs[0];
      //console.log(activeTab)
      // Send a message to the active tab
      chrome.tabs.sendMessage(activeTab.id, {
        "action": "FETCH_COMMENTS", url: activeTab
      });
    });

     return true;
  }
  else if (tab.url.indexOf("films") != -1){
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      const activeTab = tabs[0];
      //console.log(activeTab)
      // Send a message to the active tab
      chrome.tabs.sendMessage(activeTab.id, {
        "action": "FETCH_LANDING", url: activeTab
      });
    });

     return true;
  }
});


chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    const activeTab = tabs[0];
    //console.log(activeTab)
    // Send a message to the active tab
    chrome.tabs.sendMessage(activeTab.id, {
      "action": "FETCH_COMMENTS"
    });
  });
});


chrome.contextMenus.create({
  id: 'contextMenu0',
  title: 'Get recommendations',
  contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener(clickMenuCallback);

function clickMenuCallback(info, tab) {
  console.log(info)
  
  chrome.tabs.sendMessage(tab.id, {action: "GET_RECOMMENDATIONS", url: info});



}