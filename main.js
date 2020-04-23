$(document).ready(function () {
    //OPEN NAVIGATION MENU
    $('.menu-toggler').on('click', function () {
        $(this).toggleClass('open');
        $('.top-nav').toggleClass('open');
    });
    //NAVIGATION MENU LINKS
    $('.top-nav .nav-link').on('click', function () {
        $('.menu-toggler').removeClass('open');
        $('.top-nav').removeClass('open');
    });

    //SMOOTH SCROLLING
    $('nav a[href*="#"]').on('click', function () {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 100
        }, 2000);
    }); 
    //SCROLL UP BUTTON
    $("#up").click(function() {
        $('html, body').animate({ 
            scrollTop: $(".landing-text").offset().top 
        }, 2000);
    });
});


