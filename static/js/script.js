ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
        center: [55.755814, 37.617635],
        zoom: 10
    });

    var placemarks = new ymaps.GeoObjectCollection();
    var selectedBanks = []; // Список всех банков из JSON
    var userCoordinates = null; // Координаты пользователя

    // Загрузка и обработка JSON файла с данными о банках
    fetch('/static/resources/offices.json') // Укажите правильный путь к вашему JSON файлу
        .then(response => response.json())
        .then(data => {
            selectedBanks = data; // Сохраняем все банки из JSON

            data.forEach(bankData => {
                var openHoursFormatted = bankData.openHoursIndividual.map(day => day.days + ': ' + day.hours).join('<br>');
                var placemark = new ymaps.Placemark([bankData.latitude, bankData.longitude], {
                    hintContent: bankData.salePointName,
                    balloonContentHeader: bankData.salePointName,
                    balloonContentBody: 'Адрес: ' + bankData.address,
                    balloonContentFooter: 'Время работы: <br>' + openHoursFormatted
                });

                placemarks.add(placemark);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке JSON файла:', error);
        });

    myMap.geoObjects.add(placemarks);

    // Определение местоположения пользователя
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            userCoordinates = [position.coords.latitude, position.coords.longitude];
            // userCoordinates = [55.656329, 37.526832];
        });
    } else {
        alert('Ваш браузер не поддерживает геолокацию.');
    }

    document.getElementById('calculate-route').addEventListener('click', function () {
        if (userCoordinates) {
            // Очистка маршрута на карте (если он уже был построен)
            myMap.geoObjects.remove(myMap.geoObjects.get(0));

            // Получение выбранного типа маршрута
            var routeType = document.getElementById('route-type').value;
            var user_type = document.getElementById('user_type').value;
            var service = document.getElementById('service').value;
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
                 };
                $.ajax({
                    type: 'GET',
                    url: '/get_data',
                    data: requestData,
                    success: function(response) {
                        // Получите значение из ответа
                        var best_banks = response.data;
                        var multiRoute = new ymaps.multiRouter.MultiRoute({
                            referencePoints: [userCoordinates, [best_banks.latitude, best_banks.longitude]],
                        params: {
                                routingMode: routeType, // Устанавливаем выбранный тип маршрута
                                avoidTrafficJams: true
                            }
                        });

                        multiRoute.model.setReferencePoints([userCoordinates, [best_banks.latitude, best_banks.longitude]]);

                        myMap.geoObjects.add(multiRoute);
                    },
                    error: function(error) {
                        console.log('Произошла ошибка:', error);
                    }
                });
            });


            // Здесь можно добавить логику выбора лучшего банка
            // Например, сортировка банков по какому-то критерию и выбор самого лучшего
            // selectedBanks.sort((a, b) => {
            //     // Например, сортировка по расстоянию от пользователя
            //     var distanceA = ymaps.coordSystem.geo.getDistance(userCoordinates, [a.latitude, a.longitude]);
            //     var distanceB = ymaps.coordSystem.geo.getDistance(userCoordinates, [b.latitude, b.longitude]);
            //     return distanceA - distanceB;
            // });
            //
            // var bestBank = selectedBanks[0]; // Выбираем самый лучший банк
            // console.log(bestBank);
            // Построение маршрута к выбранному банку с учетом типа маршрута
            // var multiRoute = new ymaps.multiRouter.MultiRoute({
            //     referencePoints: [userCoordinates, [bestBank.latitude, bestBank.longitude]],
            //     params: {
            //         routingMode: routeType, // Устанавливаем выбранный тип маршрута
            //         avoidTrafficJams: true
            //     }
            // });
            //
            // multiRoute.model.setReferencePoints([userCoordinates, [bestBank.latitude, bestBank.longitude]]);
            //
            // myMap.geoObjects.add(multiRoute);
        } else {
            alert('Не удалось получить координаты пользователя.');
        }
    });
}
