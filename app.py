from flask import Flask, render_template, request

app = Flask(__name__)

banks = {
    'bank1': {'rate': 0.03, 'name': 'Банк 1'},
    'bank2': {'rate': 0.035, 'name': 'Банк 2'},
    'bank3': {'rate': 0.032, 'name': 'Банк 3'},
}

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

        # Расчет лучшего банка
        best_banks = sorted(banks.values(), key=lambda bank: bank['rate'])
        best_banks = best_banks[:3]

        return render_template('index.html', user_data=user_data, best_banks=best_banks)

    return render_template('index.html', best_banks=None)

if __name__ == '__main__':
    app.run(debug=True)