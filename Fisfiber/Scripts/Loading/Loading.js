function Loading() {
    
    $.preloader.start({

        modal: true,
        //LOCALHOST
        //src: '/bootstrap/images/Loading.gif',
        //PRODUCCION
        src: '/Images/loader.gif',
        width: 102,
        height: 102,
        frames: 12


    });

    return true;
    
}


function StopLoading() {

    $.preloader.stop();
    return false;

}