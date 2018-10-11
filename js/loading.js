






let loadingFinished = false;
let loadingPercentage = 0.0;

let loading_events = [];















function calculateLoading(){

    //console.log( loading_events)
    loading_total =0;
    loading_downloaded=0;
    for(let i=0; i < loading_events.length; i++){
     
        loading_total=loading_total + loading_events[i].total;
        loading_downloaded = loading_downloaded + loading_events[i].loaded;
    }

    loadingPercentage = loading_downloaded/loading_total;
    
  
    document.getElementById("loadingProgressText").innerHTML =  Math.floor(loadingPercentage*100) == 100 ? 99 : Math.floor(loadingPercentage*100);
    document.getElementById("progressBar").style.width =(Math.floor(loadingPercentage*100) == 100 ? 99 : Math.floor(loadingPercentage*100))+'%';
    console.log('calc loading runs ' + loadingPercentage    )

    if( loadingPercentage >= 1) {
       
        loadingFinished = true;
        
    }


}

