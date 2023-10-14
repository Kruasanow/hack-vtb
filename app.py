from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

banks = [
    # Данные о банках из JSON файла
]

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

        # Выбор лучших банков - ваши критерии выбора здесь
        # Например, сортировка банков по расстоянию и выбор топ-3

        best_banks = sorted(banks, key=lambda bank: bank['distance'])
        best_banks = best_banks[:3]

        return render_template('index.html', user_data=user_data, best_banks=best_banks)

    return render_template('index.html', best_banks=None)

if __name__ == '__main__':
    app.run(debug=True)
