ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
        center: [55.755814, 37.617635],
        zoom: 10
    });

    var placemarks = new ymaps.GeoObjectCollection();
    var selectedBanks = []; 
    var userCoordinates = null; 

    // Загрузка и обработка JSON файла с данными о банках
    fetch('/static/resources/offices.json')
        .then(response => response.json())
        .then(data => {
            selectedBanks = data;

            data.forEach(bankData => {
                var openHoursFormatted = bankData.openHoursIndividual.map(day => day.days + ': ' + day.hours).join('<br>');
                var placemark = new ymaps.Placemark([bankData.latitude, bankData.longitude], {
                    hintContent: bankData.salePointName,
                    balloonContentHeader: bankData.salePointName,
                    balloonContentBody: 'Адрес: ' + bankData.address,
                    balloonContentFooter: 'Время работы: <br>' + openHoursFormatted
                    
                },
                {
                    iconLayout: 'default#image',
                    iconImageHref: '/static/image/mark.png',
                    icon_imagesize: [30, 42],
                    iconImageOffset: [-3, -42]
                });

                placemarks.add(placemark);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке JSON файла:', error);
        });

    myMap.geoObjects.add(placemarks);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            userCoordinates = [position.coords.latitude, position.coords.longitude];
        });
    } else {
        alert('Ваш браузер не поддерживает геолокацию.');
    }

    document.getElementById('calculate-route').addEventListener('click', function () {
        if (userCoordinates) {

            myMap.geoObjects.remove(myMap.geoObjects.get(0));

            var routeType = document.getElementById('route-type').value;
            var user_type = document.getElementById('user_type').value;
            var service = document.getElementById('service').value;
            var time = document.getElementById('visit-time').value;
            var cordX = userCoordinates[0]
            var cordY = userCoordinates[1]
            console.log(cordX);
            console.log(cordY);
            $(document).ready(function() {
                var requestData = {
                    user_type: user_type,
                    service: service,
                    routeType: routeType,
                    cordX: cordX,
                    cordY: cordY,
                    time: time,
                 };
                $.ajax({
                    type: 'GET',
                    url: '/get_data',
                    data: requestData,
                    success: function(response) {

                        // Получите значение из ответа
                        var best_banks = response.data;
                        console.log(best_banks[3])
                        buildRouteToBank(best_banks[0]);
                        console.log(best_banks[3])
                        // console.log('IIIIIIII')
                        $('#partial-data-container').html(best_banks[3]);
                        document.getElementById('bank-1').addEventListener('click', function() {
                            if (userCoordinates && best_banks.length >= 1) {
                                // Выбираем первый лучший банк для построения маршрута
                                var bankToRoute = best_banks[0];
                                buildRouteToBank(bankToRoute);
                            }
                        });

                        document.getElementById('bank-2').addEventListener('click', function() {
                            if (userCoordinates && best_banks.length >= 2) {
                                // Выбираем второй лучший банк для построения маршрута
                                var bankToRoute = best_banks[1];
                                buildRouteToBank(bankToRoute);
                            }
                        });

                        document.getElementById('bank-3').addEventListener('click', function() {
                            if (userCoordinates && best_banks.length >= 3) {
                                // Выбираем третий лучший банк для построения маршрута
                                var bankToRoute = best_banks[2];
                                buildRouteToBank(bankToRoute);
                            }
                        });

                        function buildRouteToBank(bankToRoute) {
                            myMap.geoObjects.removeAll();
                            // Создаем маршрут к выбранному банку
                            var multiRoute = new ymaps.multiRouter.MultiRoute({
                                referencePoints: [userCoordinates, [bankToRoute.latitude, bankToRoute.longitude]],
                                params: {
                                    routingMode: routeType, // Устанавливаем выбранный тип маршрута
                                    avoidTrafficJams: true
                                }
                            }, {
                                // Внешний вид путевых точек.
                                wayPointStartIconColor: "#333",
                                wayPointStartIconFillColor: "#B3B3B3",
                                // Задаем собственную картинку для последней путевой точки.
                                // wayPointFinishIconLayout: "default#image",
                                wayPointFinishIconImageHref: "/static/image/mark.png",
                                wayPointFinishIconImageSize: [30, 42],
                                wayPointFinishIconImageOffset: [-3, -42],

                                // Внешний вид транзитных точек.
                                viaPointIconRadius: 7,
                                viaPointIconFillColor: "#000088",
                                viaPointActiveIconFillColor: "#E63E92",
                                // Транзитные точки можно перетаскивать, при этом
                                // маршрут будет перестраиваться.
                                viaPointDraggable: true,
                                // Позволяет скрыть иконки транзитных точек маршрута.
                                // viaPointVisible:false,

                                // Внешний вид точечных маркеров под путевыми точками.
                                pinIconFillColor: "#000088",
                                pinActiveIconFillColor: "#B3B3B3",
                                // Позволяет скрыть точечные маркеры путевых точек.
                                // pinVisible:false,

                                // Внешний вид линии маршрута.
                                routeStrokeWidth: 2,
                                routeStrokeColor: "#000088",
                                routeActiveStrokeWidth: 6,
                                routeActiveStrokeColor: "#1E4BD2",

                                // Внешний вид линии пешеходного маршрута.
                                routeActivePedestrianSegmentStrokeStyle: "solid",
                                routeActivePedestrianSegmentStrokeColor: "#1E4BD2",

                                // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
                                boundsAutoApply: true
                            });

                            multiRoute.model.setReferencePoints([userCoordinates, [bankToRoute.latitude, bankToRoute.longitude]]);

                            myMap.geoObjects.add(multiRoute);

                            multiRoute.model.events.add('requestsuccess', function() {
                                // Вывод информации о маршруте
                                var activeRoute = multiRoute.getActiveRoute();
                                console.log("Длина: " + activeRoute.properties.get("distance").text);
                                console.log("Время прохождения: " + activeRoute.properties.get("duration").text);
                                var spid = activeRoute.properties.get("duration").text;
                            });
                        }
                    },
                    error: function(error) {
                        console.log('Произошла ошибка:', error);
                    }
                });
            });
        } else {
            alert('Не удалось получить координаты пользователя.');
        }
    });
}
