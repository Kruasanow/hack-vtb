ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
        center: [55.755814, 37.617635],
        zoom: 10
    });

    var placemark1 = new ymaps.Placemark([55.755814, 37.617635], {
        hintContent: 'Отделение 1',
        balloonContent: 'Это отделение банка 1'
    });


    myMap.geoObjects.add(placemark1);

}