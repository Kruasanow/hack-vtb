from flask import Flask, render_template, request, jsonify, session
import json
import datetime
import calendar
from algorithm import choose_nearest_offices, wait_time_for_office_now, wait_time_for_office_predict, get_offices_by_provided_service

app = Flask(__name__)
app.secret_key = 'uuuuuu!!!!!uuuuuuu'
with open('static/resources/offices.json', 'r', encoding='utf-8') as json_file:
    banks = json.load(json_file)

@app.route('/', methods=['GET', 'POST'])
def index():
    session['is_clicked'] = False
    if request.method == 'POST':
        
        user_type = request.form['user_type']
        service = request.form['service']
        transport = request.form['transport']

        user_data = {
            'user_type': user_type,
            'service': service,
            'transport': transport,
        }

        return render_template('index.html', user_data=user_data)

    return render_template('index.html', best_banks=None)

@app.route('/get_data', methods=['GET', 'POST'])
def get_data():
    def format_time(time: str) -> int:
        now = datetime.datetime.now()
        day_of_week = calendar.weekday(now.year, now.month, now.day) + 1
        lowerbound = int(time.split(':')[0])
        upperbound = lowerbound + 1

        formated = day_of_week + lowerbound + upperbound
        return formated
    buttons_html = """ <button id='bank-1'>Наиболее оптимальный</button> <button id='bank-2'>Оптимальный</button> <button id='bank-3'>Наименее оптимальный</button>"""
    user_type = request.args.get('user_type')
    service = request.args.get('service')
    routeType = request.args.get('routeType')
    cordX = request.args.get('cordX')
    cordY = request.args.get('cordY')
    time = request.args.get('time')
    offices = get_offices_by_provided_service(user_type, service)
    nearest_offices = choose_nearest_offices((float(cordX), float(cordY)), offices)

    print(f"ZALUPA ==== {nearest_offices}"+'\n')
    
    for office in nearest_offices:
        office['wait_time_now'] = wait_time_for_office_now(office)
        office['wait_time_predicted'] = wait_time_for_office_predict(office, format_time(time))

    data = nearest_offices
    data.append(buttons_html)
    print(time)
    print(data)
    print(user_type, service, routeType, cordX, cordY)
    return jsonify(data=data) 

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
