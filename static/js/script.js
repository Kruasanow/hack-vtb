ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
        center: [55.755814, 37.617635],
        zoom: 10
    });

    var placemarks = new ymaps.GeoObjectCollection();
    var selectedBanks = []; // Список всех банков из JSON

    // Загрузка и обработка JSON файла с данными о банках
    fetch('/static/banks.json') // Укажите правильный путь к вашему JSON файлу
        .then(response => response.json())
        .then(data => {
            selectedBanks = data; // Сохраняем все банки из JSON

            data.forEach(bankData => {
                var placemark = new ymaps.Placemark([bankData.latitude, bankData.longitude], {
                    hintContent: bankData.salePointName,
                    balloonContentHeader: bankData.salePointName,
                    balloonContentBody: 'Адрес: ' + bankData.address,
                    balloonContentFooter: 'Статус: ' + bankData.status
                });

                placemarks.add(placemark);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке JSON файла:', error);
        });

    myMap.geoObjects.add(placemarks);

    document.getElementById('calculate-route').addEventListener('click', function () {
        // Очистка маршрута на карте (если он уже был построен)
        myMap.geoObjects.remove(myMap.geoObjects.get(0));

        // Здесь можно добавить логику выбора лучших банков
        // Например, сортировка банков по какому-то критерию и выбор топ-3
        selectedBanks.sort((a, b) => {
            // Например, сортировка по расстоянию
            return a.distance - b.distance;
        });

        var topBanks = selectedBanks.slice(0, 3); // Выбираем топ-3 банка

        // Построение маршрута к выбранным банкам
        var multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: topBanks.map(function (bank) {
                return [bank.latitude, bank.longitude];
            }),
            params: {
                routingMode: 'auto',
                avoidTrafficJams: true
            }
        });

        multiRoute.model.setReferencePoints(topBanks.map(function (bank) {
            return [bank.latitude, bank.longitude];
        }));

        myMap.geoObjects.add(multiRoute);
    });
}
