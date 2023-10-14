from flask import Flask, render_template, request, jsonify, session
import json

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
    buttons_html = """ <button id='bank-1'>Кнопка 1</button> <button id='bank-2'>Кнопка 2</button> <button id='bank-3'>Кнопка 3</button>"""
    user_type = request.args.get('user_type')
    service = request.args.get('service')
    routeType = request.args.get('routeType')
    cordX = request.args.get('cordX')
    cordY = request.args.get('cordY')
    time = request.args.get('time')
    data = banks[100:103]
    data.append(buttons_html)
    print(data)
    print(user_type, service, routeType, cordX, cordY)
    return jsonify(data=data) 

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
