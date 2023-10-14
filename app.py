from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

with open('static/resources/offices.json', 'r', encoding='utf-8') as json_file:
    banks = json.load(json_file)

@app.route('/', methods=['GET', 'POST'])
def index():
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
    user_type = request.args.get('user_type')
    service = request.args.get('service')
    routeType = request.args.get('routeType')
    cordX = request.args.get('cordX')
    cordY = request.args.get('cordY')
    # Выбор лучшего банка
    data = banks[100]
    print(data)
    print(user_type, service, routeType, cordX, cordY)
    return jsonify(data=data)

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
